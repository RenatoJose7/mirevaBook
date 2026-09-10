import { getDatabase } from '@/src/database/database';
import type { Bookmark } from '@/src/types/book';

interface BookmarkRow {
  id: number;
  book_id: number;
  page: number;
  created_at: string;
}

function toBookmark(row: BookmarkRow): Bookmark {
  return {
    id: row.id,
    bookId: row.book_id,
    page: row.page,
    createdAt: row.created_at,
  };
}

export const BookmarksRepository = {
  async toggle(bookId: number, page: number): Promise<boolean> {
    const database = await getDatabase();
    let isActive = false;
    await database.withExclusiveTransactionAsync(async (transaction) => {
      const existing = await transaction.getFirstAsync<{ id: number }>(
        'SELECT id FROM bookmarks WHERE book_id = ? AND page = ?',
        bookId,
        page,
      );

      if (existing) {
        await transaction.runAsync('DELETE FROM bookmarks WHERE id = ?', existing.id);
        isActive = false;
        return;
      }

      await transaction.runAsync(
        'INSERT INTO bookmarks (book_id, page, created_at) VALUES (?, ?, ?)',
        bookId,
        page,
        new Date().toISOString(),
      );
      isActive = true;
    });
    return isActive;
  },

  async exists(bookId: number, page: number): Promise<boolean> {
    const database = await getDatabase();
    const row = await database.getFirstAsync<{ found: number }>(
      `SELECT EXISTS(
        SELECT 1 FROM bookmarks WHERE book_id = ? AND page = ?
      ) AS found`,
      bookId,
      page,
    );
    return row?.found === 1;
  },

  async getByBook(bookId: number): Promise<Bookmark[]> {
    const database = await getDatabase();
    const rows = await database.getAllAsync<BookmarkRow>(
      'SELECT * FROM bookmarks WHERE book_id = ? ORDER BY page ASC',
      bookId,
    );
    return rows.map(toBookmark);
  },
};
