import { PdfPageImage } from '@dariyd/react-native-pdf-page-image';

import type { RenderedPage } from '@/src/types/book';

export async function openPdf(uri: string): Promise<number> {
  const result = await PdfPageImage.open(uri);
  if (!Number.isInteger(result.pageCount) || result.pageCount < 1) {
    throw new Error('Este PDF não contém páginas legíveis.');
  }
  return result.pageCount;
}

export function renderCover(uri: string): Promise<RenderedPage> {
  return PdfPageImage.generate(uri, 0, 1, {
    format: 'jpeg',
    quality: 82,
    maxDimension: 720,
  });
}

export function renderReaderPage(uri: string, page: number): Promise<RenderedPage> {
  return PdfPageImage.generate(uri, page - 1, 2, {
    format: 'jpeg',
    quality: 88,
    maxDimension: 1800,
  });
}

export function closePdf(uri: string): Promise<void> {
  return PdfPageImage.close(uri);
}
