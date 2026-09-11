export interface Book {
  id: number;
  title: string;
  pdfUri: string;
  coverUri: string | null;
  totalPages: number;
  currentPage: number;
  createdAt: string;
  lastOpenedAt: string | null;
  isHighlighted: boolean;
  completedAt: string | null;
}

export interface CreateBookInput {
  title: string;
  pdfUri: string;
  coverUri?: string | null;
  totalPages: number;
}

export interface Bookmark {
  id: number;
  bookId: number;
  page: number;
  createdAt: string;
}

export interface RenderedPage {
  uri: string;
  width: number;
  height: number;
}

export interface ReadingSummary {
  pagesRead: number;
  booksCompleted: number;
  booksInProgress: number;
  overallProgress: number;
  recentBookTitle: string | null;
}
