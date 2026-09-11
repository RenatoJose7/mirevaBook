import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookGrid } from '@/src/components/BookGrid';
import { BottomNavigation } from '@/src/components/BottomNavigation';
import { EmptyLibrary } from '@/src/components/EmptyLibrary';
import { layout, palette, radius, spacing, typography } from '@/src/constants/theme';
import { useBooks } from '@/src/hooks/useBooks';
import type { Book } from '@/src/types/book';

export default function LibraryScreen() {
  const router = useRouter();
  const {
    books,
    loading,
    importPhase,
    error,
    clearError,
    refresh,
    addBook,
    removeBook,
    toggleHighlight,
  } = useBooks();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
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

  const openBook = useCallback(
    (book: Book) => {
      router.push({ pathname: '/reader/[bookId]', params: { bookId: String(book.id) } });
    },
    [router],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>SEUS LIVROS</Text>
          <Text style={styles.heading}>Minha Biblioteca</Text>
        </View>
        {books.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Adicionar livro"
            disabled={Boolean(importPhase)}
            onPress={() => void addBook()}
            style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
          >
            <Text style={styles.addIcon}>＋</Text>
          </Pressable>
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={palette.accent} />
          <Text style={styles.loadingText}>Carregando biblioteca…</Text>
        </View>
      ) : books.length === 0 ? (
        <EmptyLibrary onAdd={() => void addBook()} />
      ) : (
        <BookGrid
          books={books}
          onOpen={openBook}
          onDelete={confirmDelete}
          onToggleHighlight={(book) => void toggleHighlight(book)}
        />
      )}

      <BottomNavigation active="home" />

      {error && (
        <Pressable accessibilityRole="alert" onPress={clearError} style={styles.errorBanner}>
          <Text style={styles.errorText} numberOfLines={3}>{error}</Text>
          <Text style={styles.errorDismiss}>×</Text>
        </Pressable>
      )}

      {importPhase && (
        <View style={styles.importOverlay}>
          <View style={styles.importCard}>
            <ActivityIndicator color={palette.accent} />
            <Text style={styles.importTitle}>
              {importPhase === 'copying' ? 'Importando livro…' : 'Preparando livro…'}
            </Text>
            <Text style={styles.importDetail}>
              {importPhase === 'copying'
                ? 'Copiando o PDF para o armazenamento do aplicativo.'
                : 'Lendo as páginas e criando a capa.'}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  eyebrow: { color: palette.accent, fontSize: typography.micro, letterSpacing: 1.8, fontWeight: '700' },
  heading: { color: palette.ink, fontSize: typography.display, lineHeight: 39, fontWeight: '700', letterSpacing: -0.8 },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.accent,
  },
  addButtonPressed: { backgroundColor: palette.accentPressed, transform: [{ scale: 0.96 }] },
  addIcon: { color: palette.surface, fontSize: 27, lineHeight: 29, fontWeight: '300' },
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
  importOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(27, 28, 26, 0.38)',
  },
  importCard: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: palette.surface,
  },
  importTitle: { color: palette.ink, fontSize: typography.title, fontWeight: '600', marginTop: spacing.md },
  importDetail: { color: palette.muted, fontSize: typography.small, lineHeight: 19, textAlign: 'center', marginTop: spacing.xs },
});
