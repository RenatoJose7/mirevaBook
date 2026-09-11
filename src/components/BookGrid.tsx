import { FlatList, StyleSheet, useWindowDimensions } from 'react-native';

import { BookCard } from '@/src/components/BookCard';
import { layout, spacing } from '@/src/constants/theme';
import type { Book } from '@/src/types/book';

interface BookGridProps {
  books: Book[];
  onOpen: (book: Book) => void;
  onDelete: (book: Book) => void;
  onToggleHighlight: (book: Book) => void;
}

export function BookGrid({ books, onOpen, onDelete, onToggleHighlight }: BookGridProps) {
  const { width } = useWindowDimensions();
  const cardWidth = (width - layout.screenPadding * 2 - layout.gridGap) / 2;

  return (
    <FlatList
      data={books}
      keyExtractor={(item) => String(item.id)}
      numColumns={2}
      columnWrapperStyle={styles.row}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => (
        <BookCard
          book={item}
          width={cardWidth}
          onPress={() => onOpen(item)}
          onLongPress={() => onDelete(item)}
          onToggleHighlight={() => onToggleHighlight(item)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.lg,
  },
  row: { gap: layout.gridGap },
});
