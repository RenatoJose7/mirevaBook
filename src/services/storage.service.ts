import { Directory, File, FileMode, Paths } from 'expo-file-system';

const booksDirectory = new Directory(Paths.document, 'books');
const coversDirectory = new Directory(Paths.document, 'covers');
const pageCacheDirectory = new Directory(Paths.cache, 'page-cache');

function ensureDirectory(directory: Directory): void {
  directory.create({ idempotent: true, intermediates: true });
}

export function initializeStorage(): void {
  ensureDirectory(booksDirectory);
  ensureDirectory(coversDirectory);
  ensureDirectory(pageCacheDirectory);
}

function randomId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function uniqueFile(directory: Directory, extension: string): File {
  let candidate: File;
  do {
    candidate = new File(directory, `${randomId()}.${extension}`);
  } while (candidate.exists);
  return candidate;
}

export async function copyPdfToLibrary(sourceUri: string): Promise<File> {
  initializeStorage();
  const source = new File(sourceUri);
  const destination = uniqueFile(booksDirectory, 'pdf');
  try {
    await source.copy(destination);
  } catch (error) {
    if (destination.exists) destination.delete();
    throw error;
  }
  return destination;
}

export function hasPdfSignature(file: File): boolean {
  let handle: ReturnType<File['open']> | null = null;
  try {
    handle = file.open(FileMode.ReadOnly);
    const header = handle.readBytes(5);
    return (
      header.length === 5 &&
      header[0] === 0x25 &&
      header[1] === 0x50 &&
      header[2] === 0x44 &&
      header[3] === 0x46 &&
      header[4] === 0x2d
    );
  } finally {
    handle?.close();
  }
}

export async function persistCover(temporaryUri: string): Promise<File> {
  initializeStorage();
  const source = new File(temporaryUri);
  const destination = uniqueFile(coversDirectory, 'jpg');
  try {
    await source.copy(destination);
  } catch (error) {
    if (destination.exists) destination.delete();
    throw error;
  }
  return destination;
}

export function bookFileExists(uri: string): boolean {
  return new File(uri).exists;
}

export function removeFileIfPresent(uri: string | null | undefined): void {
  if (!uri) return;
  const file = new File(uri);
  if (file.exists) file.delete();
}

export function removeBookCache(bookId: number): void {
  const directory = new Directory(pageCacheDirectory, String(bookId));
  if (directory.exists) directory.delete();
}

export function removeBookFiles(
  bookId: number,
  pdfUri: string,
  coverUri: string | null,
): void {
  for (const uri of [pdfUri, coverUri]) {
    try {
      removeFileIfPresent(uri);
    } catch {
      // The database remains authoritative if the OS has already removed or locked a file.
    }
  }
  try {
    removeBookCache(bookId);
  } catch {
    // Cache cleanup is best-effort and never blocks removing the library entry.
  }
}
