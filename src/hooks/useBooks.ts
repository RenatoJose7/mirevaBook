import { useCallback, useEffect, useState } from 'react';

import { BooksRepository } from '@/src/database/books.repository';
import {
  deleteBook as deleteBookFromLibrary,
  importBook,
  type ImportPhase,
} from '@/src/services/library.service';
import type { Book } from '@/src/types/book';

interface UseBooksOptions {
  highlightedOnly?: boolean;
}

export function useBooks({ highlightedOnly = false }: UseBooksOptions = {}) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [importPhase, setImportPhase] = useState<ImportPhase | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      setBooks(
        highlightedOnly
          ? await BooksRepository.getHighlighted()
          : await BooksRepository.getAll(),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível carregar a biblioteca.');
    } finally {
      setLoading(false);
    }
  }, [highlightedOnly]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addBook = useCallback(async () => {
    try {
      setError(null);
      const book = await importBook(setImportPhase);
      if (book) await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível importar o livro.');
    } finally {
      setImportPhase(null);
    }
  }, [refresh]);

  const removeBook = useCallback(async (book: Book) => {
    try {
      setError(null);
      await deleteBookFromLibrary(book);
      setBooks((current) => current.filter((item) => item.id !== book.id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível excluir o livro.');
    }
  }, []);

  const toggleHighlight = useCallback(
    async (book: Book) => {
      const nextValue = !book.isHighlighted;
      try {
        setError(null);
        await BooksRepository.setHighlighted(book.id, nextValue);
        setBooks((current) =>
          current
            .map((item) =>
              item.id === book.id ? { ...item, isHighlighted: nextValue } : item,
            )
            .filter((item) => !highlightedOnly || item.isHighlighted),
        );
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : 'Não foi possível atualizar o destaque.',
        );
      }
    },
    [highlightedOnly],
  );

  return {
    books,
    loading,
    importPhase,
    error,
    clearError: () => setError(null),
    refresh,
    addBook,
    removeBook,
    toggleHighlight,
  };
}
