import { useCallback, useEffect, useRef, useState } from 'react';

import { BookmarksRepository } from '@/src/database/bookmarks.repository';
import { BooksRepository } from '@/src/database/books.repository';
import { ReadingRepository } from '@/src/database/reading.repository';
import { closePdf, openPdf, renderReaderPage } from '@/src/services/pdf.service';
import { bookFileExists } from '@/src/services/storage.service';
import type { Book, RenderedPage } from '@/src/types/book';

const pagesToKeep = (page: number, totalPages: number): number[] =>
  [page - 1, page, page + 1, page + 2].filter(
    (candidate) => candidate >= 1 && candidate <= totalPages,
  );

export function useReader(bookId: number) {
  const [book, setBook] = useState<Book | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState<Record<number, RenderedPage>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const disposedRef = useRef(false);
  const pageRef = useRef(1);
  const bookRef = useRef<Book | null>(null);
  const pageCacheRef = useRef<Record<number, RenderedPage>>({});
  const inFlightRef = useRef<Map<number, Promise<void>>>(new Map());
  const renderQueueRef = useRef<Promise<void>>(Promise.resolve());

  const loadPage = useCallback(async (page: number, targetBook: Book) => {
    if (disposedRef.current) return;
    const cached = pageCacheRef.current[page];
    if (cached) {
      setPages((current) => (current[page] ? current : { ...current, [page]: cached }));
      return;
    }

    const inFlight = inFlightRef.current.get(page);
    if (inFlight) {
      await inFlight;
      const result = pageCacheRef.current[page];
      if (result) {
        setPages((current) => (current[page] ? current : { ...current, [page]: result }));
        return;
      }
    }

    const renderTask = renderQueueRef.current.catch(() => undefined).then(async () => {
      try {
        if (disposedRef.current) return;
        const wantedBeforeRender = pagesToKeep(pageRef.current, targetBook.totalPages);
        if (!wantedBeforeRender.includes(page)) return;

        try {
          const rendered = await renderReaderPage(targetBook.pdfUri, page);
          if (disposedRef.current) return;

          const retained = pagesToKeep(pageRef.current, targetBook.totalPages);
          if (!retained.includes(page)) return;

          pageCacheRef.current[page] = rendered;
          setPages((current) => ({ ...current, [page]: rendered }));
        } catch (caught) {
          if (disposedRef.current || page !== pageRef.current) return;
          setError(caught instanceof Error ? caught.message : 'Falha ao renderizar a página.');
        }
      } finally {
        inFlightRef.current.delete(page);
      }
    });

    inFlightRef.current.set(page, renderTask);
    renderQueueRef.current = renderTask.catch(() => undefined);
    await renderTask;
  }, []);

  const prepareWindow = useCallback(
    async (page: number, targetBook: Book) => {
      const retained = pagesToKeep(page, targetBook.totalPages);
      pageCacheRef.current = Object.fromEntries(
        Object.entries(pageCacheRef.current).filter(([key]) => retained.includes(Number(key))),
      );
      setPages({ ...pageCacheRef.current });

      await loadPage(page, targetBook);
      void (async () => {
        for (const candidate of retained) {
          if (candidate !== page) await loadPage(candidate, targetBook);
        }
      })();
    },
    [loadPage],
  );

  useEffect(() => {
    disposedRef.current = false;
    let openedUri: string | null = null;

    const initialize = async () => {
      try {
        setLoading(true);
        setError(null);
        const storedBook = await BooksRepository.getById(bookId);
        if (!storedBook) throw new Error('Livro não encontrado na biblioteca.');
        if (!bookFileExists(storedBook.pdfUri)) {
          throw new Error('O arquivo deste livro não foi encontrado no aparelho.');
        }

        openedUri = storedBook.pdfUri;
        const actualTotalPages = await openPdf(storedBook.pdfUri);
        const page = Math.min(Math.max(1, storedBook.currentPage), actualTotalPages);
        const hydratedBook = { ...storedBook, totalPages: actualTotalPages, currentPage: page };

        if (actualTotalPages !== storedBook.totalPages) {
          await BooksRepository.updateTotalPages(storedBook.id, actualTotalPages);
        }
        await ReadingRepository.recordPage(storedBook.id, page);

        if (disposedRef.current) return;
        bookRef.current = hydratedBook;
        pageRef.current = page;
        const bookmarked = await BookmarksRepository.exists(storedBook.id, page);
        if (disposedRef.current) return;
        setBook(hydratedBook);
        setCurrentPage(page);
        setIsBookmarked(bookmarked);
        await prepareWindow(page, hydratedBook);
      } catch (caught) {
        if (!disposedRef.current) {
          setError(caught instanceof Error ? caught.message : 'Não foi possível abrir o livro.');
        }
      } finally {
        if (!disposedRef.current) setLoading(false);
      }
    };

    void initialize();

    return () => {
      disposedRef.current = true;
      inFlightRef.current.clear();
      pageCacheRef.current = {};
      const uriToClose = openedUri;
      if (uriToClose) {
        void renderQueueRef.current
          .catch(() => undefined)
          .then(() => closePdf(uriToClose))
          .catch(() => undefined);
      }
    };
  }, [bookId, prepareWindow]);

  const goToPage = useCallback(
    (requestedPage: number) => {
      const targetBook = bookRef.current;
      if (!targetBook) return;
      const nextPage = Math.min(Math.max(1, Math.round(requestedPage)), targetBook.totalPages);
      if (nextPage === pageRef.current) return;

      pageRef.current = nextPage;
      setCurrentPage(nextPage);
      setError(null);
      setBook((current) => (current ? { ...current, currentPage: nextPage } : current));
      void ReadingRepository.recordPage(targetBook.id, nextPage).catch(() => {
        if (!disposedRef.current) setError('A página abriu, mas o progresso não pôde ser salvo.');
      });
      void BookmarksRepository.exists(targetBook.id, nextPage).then((exists) => {
        if (!disposedRef.current && pageRef.current === nextPage) setIsBookmarked(exists);
      });
      void prepareWindow(nextPage, targetBook);
    },
    [prepareWindow],
  );

  const toggleBookmark = useCallback(async () => {
    const targetBook = bookRef.current;
    const page = pageRef.current;
    if (!targetBook) return;

    try {
      const active = await BookmarksRepository.toggle(targetBook.id, page);
      if (!disposedRef.current && pageRef.current === page) setIsBookmarked(active);
    } catch {
      if (!disposedRef.current) setError('Não foi possível atualizar o marcador.');
    }
  }, []);

  return {
    book,
    currentPage,
    pages,
    loading,
    error,
    controlsVisible,
    isBookmarked,
    darkMode,
    goToPage,
    toggleBookmark,
    toggleControls: () => setControlsVisible((visible) => !visible),
    toggleDarkMode: () => setDarkMode((enabled) => !enabled),
    clearError: () => setError(null),
  };
}
