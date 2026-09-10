import { useCallback, useEffect, useState } from 'react';

import { BooksRepository } from '@/src/database/books.repository';
import {
  deleteBook as deleteBookFromLibrary,
  importBook,
  type ImportPhase,
} from '@/src/services/library.service';
import type { Book } from '@/src/types/book';

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [importPhase, setImportPhase] = useState<ImportPhase | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      setBooks(await BooksRepository.getAll());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível carregar a biblioteca.');
    } finally {
      setLoading(false);
    }
  }, []);

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

  return {
    books,
    loading,
    importPhase,
    error,
    clearError: () => setError(null),
    refresh,
    addBook,
    removeBook,
  };
}
