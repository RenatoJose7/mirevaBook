import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookGrid } from '@/src/components/BookGrid';
import { BottomNavigation } from '@/src/components/BottomNavigation';
import { EmptyHighlights } from '@/src/components/EmptyHighlights';
import { layout, palette, radius, spacing, typography } from '@/src/constants/theme';
import { useBooks } from '@/src/hooks/useBooks';
import type { Book } from '@/src/types/book';

export default function HighlightsScreen() {
  const router = useRouter();
  const { books, loading, error, clearError, refresh, removeBook, toggleHighlight } = useBooks({
    highlightedOnly: true,
  });

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const openBook = useCallback(
    (book: Book) => {
      router.push({ pathname: '/reader/[bookId]', params: { bookId: String(book.id) } });
    },
    [router],
  );

  const confirmDelete = useCallback(
    (book: Book) => {
      Alert.alert(
        `Excluir “${book.title}”?`,
        'O arquivo e seu progresso serão removidos deste aplicativo.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', style: 'destructive', onPress: () => void removeBook(book) },
        ],
      );
    },
    [removeBook],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.eyebrow}>SUA SELEÇÃO</Text>
        <Text style={styles.heading}>Destaques</Text>
        <Text style={styles.subtitle}>Os livros que você quer manter por perto.</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={palette.accent} />
          <Text style={styles.loadingText}>Carregando destaques…</Text>
        </View>
      ) : books.length === 0 ? (
        <EmptyHighlights />
      ) : (
        <BookGrid
          books={books}
          onOpen={openBook}
          onDelete={confirmDelete}
          onToggleHighlight={(book) => void toggleHighlight(book)}
        />
      )}

      <BottomNavigation active="highlights" />

      {error && (
        <Pressable accessibilityRole="alert" onPress={clearError} style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorDismiss}>×</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper },
  header: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.lg, paddingBottom: spacing.lg },
  eyebrow: { color: palette.accent, fontSize: typography.micro, letterSpacing: 1.8, fontWeight: '700' },
  heading: { color: palette.ink, fontSize: typography.display, lineHeight: 39, fontWeight: '700', letterSpacing: -0.8 },
  subtitle: { color: palette.muted, fontSize: typography.small, marginTop: spacing.xs },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  loadingText: { color: palette.muted, fontSize: typography.small },
  errorBanner: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: 112,
    minHeight: 56,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.xxl,
    borderRadius: radius.md,
    justifyContent: 'center',
    backgroundColor: palette.danger,
  },
  errorText: { color: palette.surface, fontSize: typography.small, lineHeight: 19 },
  errorDismiss: { position: 'absolute', right: spacing.md, color: palette.surface, fontSize: 24 },
});
