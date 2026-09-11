import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, radius, shadows, spacing, typography } from '@/src/constants/theme';
import type { Book } from '@/src/types/book';

interface BookCardProps {
  book: Book;
  width: number;
  onPress: () => void;
  onLongPress: () => void;
  onToggleHighlight: () => void;
}

export function BookCard({
  book,
  width,
  onPress,
  onLongPress,
  onToggleHighlight,
}: BookCardProps) {
  const longPressTriggered = useRef(false);
  const progress = book.totalPages > 0 ? Math.min(book.currentPage / book.totalPages, 1) : 0;
  const percent = Math.round(progress * 100);

  return (
    <Pressable
      accessibilityHint="Toque e segure para excluir"
      accessibilityLabel={`${book.title}, ${percent}% lido`}
      onPress={() => {
        if (longPressTriggered.current) {
          longPressTriggered.current = false;
          return;
        }
        onPress();
      }}
      onLongPress={() => {
        longPressTriggered.current = true;
        onLongPress();
      }}
      delayLongPress={450}
      style={({ pressed }) => [styles.container, { width }, pressed && styles.pressed]}
    >
      <View style={[styles.cover, shadows.card]}>
        {book.coverUri ? (
          <Image source={{ uri: book.coverUri }} style={styles.coverImage} resizeMode="cover" />
        ) : (
          <View style={styles.fallbackCover}>
            <Text style={styles.fallbackInitial}>{book.title.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={book.isHighlighted ? 'Remover dos destaques' : 'Adicionar aos destaques'}
          onPress={(event) => {
            event.stopPropagation();
            onToggleHighlight();
          }}
          hitSlop={6}
          style={({ pressed }) => [
            styles.highlightButton,
            book.isHighlighted && styles.highlightButtonActive,
            pressed && styles.optionsPressed,
          ]}
        >
          <Ionicons
            name={book.isHighlighted ? 'star' : 'star-outline'}
            size={18}
            color={book.isHighlighted ? palette.ink : palette.surface}
          />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Opções de ${book.title}`}
          onPress={(event) => {
            event.stopPropagation();
            onLongPress();
          }}
          hitSlop={6}
          style={({ pressed }) => [styles.optionsButton, pressed && styles.optionsPressed]}
        >
          <Text style={styles.optionsText}>•••</Text>
        </Pressable>
      </View>
      <Text style={styles.title} numberOfLines={2}>{book.title}</Text>
      <View style={styles.progressRow}>
        <Text style={styles.pageCount}>{book.currentPage} / {book.totalPages}</Text>
        <Text style={styles.percent}>{percent}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.xl },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  cover: {
    width: '100%',
    aspectRatio: 0.7,
    borderRadius: radius.sm,
    backgroundColor: palette.surface,
    overflow: 'hidden',
  },
  coverImage: { width: '100%', height: '100%' },
  fallbackCover: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.accentSoft,
    borderLeftWidth: 8,
    borderLeftColor: palette.accent,
  },
  fallbackInitial: { color: palette.accent, fontSize: 42, fontWeight: '500' },
  highlightButton: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(27, 28, 26, 0.72)',
  },
  highlightButtonActive: { backgroundColor: '#E8C866' },
  optionsButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 38,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(27, 28, 26, 0.72)',
  },
  optionsPressed: { backgroundColor: 'rgba(27, 28, 26, 0.9)' },
  optionsText: { color: palette.surface, fontSize: 15, lineHeight: 16, letterSpacing: 1 },
  title: {
    color: palette.ink,
    fontSize: typography.body,
    lineHeight: 21,
    fontWeight: '600',
    minHeight: 42,
    marginTop: spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  pageCount: { color: palette.muted, fontSize: typography.small },
  percent: { color: palette.accent, fontSize: typography.small, fontWeight: '600' },
  track: {
    height: 3,
    borderRadius: radius.pill,
    backgroundColor: palette.line,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: palette.accent },
});
