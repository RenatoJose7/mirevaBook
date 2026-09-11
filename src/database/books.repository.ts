import { getDatabase } from '@/src/database/database';
import type { Book, CreateBookInput } from '@/src/types/book';

interface BookRow {
  id: number;
  title: string;
  pdf_uri: string;
  cover_uri: string | null;
  total_pages: number;
  current_page: number;
  created_at: string;
  last_opened_at: string | null;
  is_highlighted: number;
  completed_at: string | null;
}

function toBook(row: BookRow): Book {
  return {
    id: row.id,
    title: row.title,
    pdfUri: row.pdf_uri,
    coverUri: row.cover_uri,
    totalPages: row.total_pages,
    currentPage: row.current_page,
    createdAt: row.created_at,
    lastOpenedAt: row.last_opened_at,
    isHighlighted: row.is_highlighted === 1,
    completedAt: row.completed_at,
  };
}

export const BooksRepository = {
  async getAll(): Promise<Book[]> {
    const database = await getDatabase();
    const rows = await database.getAllAsync<BookRow>(`
      SELECT * FROM books
      ORDER BY COALESCE(last_opened_at, created_at) DESC, id DESC
    `);
    return rows.map(toBook);
  },

  async getById(id: number): Promise<Book | null> {
    const database = await getDatabase();
    const row = await database.getFirstAsync<BookRow>(
      'SELECT * FROM books WHERE id = ?',
      id,
    );
    return row ? toBook(row) : null;
  },

  async getHighlighted(): Promise<Book[]> {
    const database = await getDatabase();
    const rows = await database.getAllAsync<BookRow>(`
      SELECT * FROM books
      WHERE is_highlighted = 1
      ORDER BY COALESCE(last_opened_at, created_at) DESC, id DESC
    `);
    return rows.map(toBook);
  },

  async create(input: CreateBookInput): Promise<Book> {
    const database = await getDatabase();
    const createdAt = new Date().toISOString();
    const result = await database.runAsync(
      `INSERT INTO books
        (title, pdf_uri, cover_uri, total_pages, current_page, created_at)
       VALUES (?, ?, ?, ?, 1, ?)`,
      input.title,
      input.pdfUri,
      input.coverUri ?? null,
      Math.max(1, input.totalPages),
      createdAt,
    );

    const book = await this.getById(result.lastInsertRowId);
    if (!book) {
      throw new Error('O livro foi criado, mas não pôde ser recuperado.');
    }
    return book;
  },

  async updateCurrentPage(id: number, page: number): Promise<void> {
    const database = await getDatabase();
    await database.runAsync(
      `UPDATE books
       SET current_page = ?, last_opened_at = ?
       WHERE id = ?`,
      page,
      new Date().toISOString(),
      id,
    );
  },

  async updateLastOpened(id: number): Promise<void> {
    const database = await getDatabase();
    await database.runAsync(
      'UPDATE books SET last_opened_at = ? WHERE id = ?',
      new Date().toISOString(),
      id,
    );
  },

  async updateTotalPages(id: number, totalPages: number): Promise<void> {
    const database = await getDatabase();
    await database.runAsync(
      `UPDATE books
       SET total_pages = ?, current_page = MIN(current_page, ?)
       WHERE id = ?`,
      totalPages,
      totalPages,
      id,
    );
  },

  async setHighlighted(id: number, highlighted: boolean): Promise<void> {
    const database = await getDatabase();
    await database.runAsync(
      'UPDATE books SET is_highlighted = ? WHERE id = ?',
      highlighted ? 1 : 0,
      id,
    );
  },

  async delete(id: number): Promise<void> {
    const database = await getDatabase();
    await database.runAsync('DELETE FROM books WHERE id = ?', id);
  },
};
