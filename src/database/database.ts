import * as SQLite from 'expo-sqlite';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function openAndMigrate(): Promise<SQLite.SQLiteDatabase> {
  const database = await SQLite.openDatabaseAsync('reader.db');

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      pdf_uri TEXT NOT NULL,
      cover_uri TEXT,
      total_pages INTEGER DEFAULT 0,
      current_page INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      last_opened_at TEXT,
      is_highlighted INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      page INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE CASCADE
    );

    CREATE UNIQUE INDEX IF NOT EXISTS bookmarks_book_page
      ON bookmarks(book_id, page);

    CREATE TABLE IF NOT EXISTS read_pages (
      book_id INTEGER NOT NULL,
      page INTEGER NOT NULL,
      read_at TEXT NOT NULL,
      PRIMARY KEY(book_id, page),
      FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE CASCADE
    );
  `);

  const bookColumns = await database.getAllAsync<{ name: string }>('PRAGMA table_info(books)');
  const existingColumns = new Set(bookColumns.map((column) => column.name));

  if (!existingColumns.has('is_highlighted')) {
    await database.execAsync(
      'ALTER TABLE books ADD COLUMN is_highlighted INTEGER NOT NULL DEFAULT 0;',
    );
  }
  if (!existingColumns.has('completed_at')) {
    await database.execAsync('ALTER TABLE books ADD COLUMN completed_at TEXT;');
  }

  return database;
}

export function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = openAndMigrate().catch((error: unknown) => {
      databasePromise = null;
      throw error;
    });
  }

  return databasePromise;
}

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  return initializeDatabase();
}
