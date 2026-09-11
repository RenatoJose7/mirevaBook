import { useCallback, useEffect, useState } from 'react';

import { ReadingRepository } from '@/src/database/reading.repository';
import type { ReadingSummary } from '@/src/types/book';

const emptySummary: ReadingSummary = {
  pagesRead: 0,
  booksCompleted: 0,
  booksInProgress: 0,
  overallProgress: 0,
  recentBookTitle: null,
};

export function useReadingSummary() {
  const [summary, setSummary] = useState<ReadingSummary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      setSummary(await ReadingRepository.getSummary());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível carregar o progresso.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { summary, loading, error, refresh };
}
