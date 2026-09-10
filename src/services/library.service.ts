import * as DocumentPicker from 'expo-document-picker';

import { BooksRepository } from '@/src/database/books.repository';
import { closePdf, openPdf, renderCover } from '@/src/services/pdf.service';
import {
  copyPdfToLibrary,
  hasPdfSignature,
  persistCover,
  removeBookFiles,
  removeFileIfPresent,
} from '@/src/services/storage.service';
import type { Book } from '@/src/types/book';

export type ImportPhase = 'copying' | 'preparing';

function titleFromFilename(filename: string): string {
  const title = filename.replace(/\.pdf$/i, '').trim();
  return title || 'Livro sem título';
}

export async function importBook(
  onPhase?: (phase: ImportPhase) => void,
): Promise<Book | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled) return null;

  const asset = result.assets[0];
  if (!asset) throw new Error('Nenhum arquivo foi selecionado.');

  onPhase?.('copying');
  const pdfFile = await copyPdfToLibrary(asset.uri);
  let coverUri: string | null = null;

  try {
    if (!hasPdfSignature(pdfFile)) {
      throw new Error('O arquivo selecionado não é um PDF válido.');
    }

    onPhase?.('preparing');
    const totalPages = await openPdf(pdfFile.uri);
    const renderedCover = await renderCover(pdfFile.uri);
    const coverFile = await persistCover(renderedCover.uri);
    coverUri = coverFile.uri;

    return await BooksRepository.create({
      title: titleFromFilename(asset.name),
      pdfUri: pdfFile.uri,
      coverUri,
      totalPages,
    });
  } catch (error) {
    removeFileIfPresent(pdfFile.uri);
    removeFileIfPresent(coverUri);
    throw error;
  } finally {
    await closePdf(pdfFile.uri).catch(() => undefined);
  }
}

export async function deleteBook(book: Book): Promise<void> {
  await BooksRepository.delete(book.id);
  removeBookFiles(book.id, book.pdfUri, book.coverUri);
}
