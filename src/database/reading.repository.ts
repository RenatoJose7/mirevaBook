import { getDatabase } from '@/src/database/database';
import type { ReadingSummary } from '@/src/types/book';

interface CountRow {
  value: number;
}

export const ReadingRepository = {
  async recordPage(bookId: number, page: number): Promise<void> {
    const database = await getDatabase();
    const readAt = new Date().toISOString();

    await database.withExclusiveTransactionAsync(async (transaction) => {
      await transaction.runAsync(
        `UPDATE books
         SET current_page = ?, last_opened_at = ?,
             completed_at = CASE
               WHEN ? >= total_pages THEN COALESCE(completed_at, ?)
               ELSE completed_at
             END
         WHERE id = ?`,
        page,
        readAt,
        page,
        readAt,
        bookId,
      );
      await transaction.runAsync(
        `INSERT OR IGNORE INTO read_pages (book_id, page, read_at)
         VALUES (?, ?, ?)`,
        bookId,
        page,
        readAt,
      );
    });
  },

  async getSummary(): Promise<ReadingSummary> {
    const database = await getDatabase();
    const [pages, completed, inProgress, totalPages, recentBook] = await Promise.all([
      database.getFirstAsync<CountRow>('SELECT COUNT(*) AS value FROM read_pages'),
      database.getFirstAsync<CountRow>(
        'SELECT COUNT(*) AS value FROM books WHERE completed_at IS NOT NULL',
      ),
      database.getFirstAsync<CountRow>(`
        SELECT COUNT(*) AS value FROM books
        WHERE completed_at IS NULL
          AND EXISTS (SELECT 1 FROM read_pages WHERE read_pages.book_id = books.id)
      `),
      database.getFirstAsync<CountRow>('SELECT COALESCE(SUM(total_pages), 0) AS value FROM books'),
      database.getFirstAsync<{ title: string }>(`
        SELECT books.title
        FROM books
        INNER JOIN read_pages ON read_pages.book_id = books.id
        ORDER BY read_pages.read_at DESC
        LIMIT 1
      `),
    ]);

    const pagesRead = pages?.value ?? 0;
    const availablePages = totalPages?.value ?? 0;

    return {
      pagesRead,
      booksCompleted: completed?.value ?? 0,
      booksInProgress: inProgress?.value ?? 0,
      overallProgress:
        availablePages > 0 ? Math.min(100, Math.round((pagesRead / availablePages) * 100)) : 0,
      recentBookTitle: recentBook?.title ?? null,
    };
  },
};
