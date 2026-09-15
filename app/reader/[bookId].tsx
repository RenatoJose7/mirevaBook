import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PageTurn } from '@/src/components/PageTurn';
import { ReaderControls } from '@/src/components/ReaderControls';
import { ReaderPage } from '@/src/components/ReaderPage';
import { layout, palette, radius, spacing, typography } from '@/src/constants/theme';
import { useReader } from '@/src/hooks/useReader';

export default function ReaderScreen() {
  const params = useLocalSearchParams<{ bookId: string | string[] }>();
  const rawBookId = Array.isArray(params.bookId) ? params.bookId[0] : params.bookId;
  const bookId = Number(rawBookId);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const reader = useReader(Number.isInteger(bookId) && bookId > 0 ? bookId : -1);
  const pageWidth = Math.min(width - spacing.md * 2, layout.maxPageWidth);
  const [zoomScale, setZoomScale] = useState(1);

  useEffect(() => {
    setZoomScale(1);
  }, [reader.currentPage]);

  if (reader.loading) {
    return (
      <View style={styles.loadingScreen}>
        <StatusBar style="light" />
        <ActivityIndicator color={palette.readerText} />
        <Text style={styles.loadingText}>Abrindo livro...</Text>
      </View>
    );
  }

  if (!reader.book) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <StatusBar style="light" />
        <Text style={styles.errorTitle}>Nao foi possivel abrir este livro</Text>
        <Text style={styles.errorMessage}>{reader.error ?? 'Livro nao encontrado.'}</Text>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Voltar para a biblioteca</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const { book, currentPage, pages, darkMode } = reader;

  return (
    <View style={[styles.screen, !darkMode && styles.screenLight]}>
      <StatusBar style="light" hidden={!reader.controlsVisible} />
      <View style={[styles.pageFrame, { width: pageWidth }]}>
        <PageTurn
          key={currentPage}
          width={pageWidth}
          currentPage={currentPage}
          totalPages={book.totalPages}
          zoomScale={zoomScale}
          onTurn={reader.goToPage}
          onTap={reader.toggleControls}
          onZoomChange={setZoomScale}
          current={<ReaderPage page={pages[currentPage]} pageNumber={currentPage} darkMode={darkMode} />}
          previous={
            <ReaderPage
              page={pages[currentPage - 1]}
              pageNumber={Math.max(1, currentPage - 1)}
              darkMode={darkMode}
            />
          }
          next={
            <ReaderPage
              page={pages[currentPage + 1]}
              pageNumber={Math.min(book.totalPages, currentPage + 1)}
              darkMode={darkMode}
            />
          }
        />
      </View>

      {!reader.controlsVisible && (
        <View pointerEvents="none" style={styles.floatingPageCount}>
          <Text style={[styles.floatingPageText, !darkMode && styles.floatingPageTextLight]}>
            {currentPage} / {book.totalPages}
          </Text>
        </View>
      )}

      {reader.controlsVisible && (
        <ReaderControls
          title={book.title}
          currentPage={currentPage}
          totalPages={book.totalPages}
          zoomScale={zoomScale}
          isBookmarked={reader.isBookmarked}
          darkMode={darkMode}
          onBack={() => router.back()}
          onPageChange={reader.goToPage}
          onZoomChange={setZoomScale}
          onToggleBookmark={() => void reader.toggleBookmark()}
          onToggleDarkMode={reader.toggleDarkMode}
        />
      )}

      {reader.error && (
        <Pressable onPress={reader.clearError} style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{reader.error}</Text>
          <Text style={styles.errorClose}>x</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', backgroundColor: palette.reader, paddingVertical: spacing.xs },
  screenLight: { backgroundColor: '#E3E0EE' },
  pageFrame: { flex: 1 },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: palette.reader,
  },
  loadingText: { color: palette.readerMuted, fontSize: typography.body },
  errorTitle: { color: palette.readerText, fontSize: typography.title, fontWeight: '600', textAlign: 'center' },
  errorMessage: { color: palette.readerMuted, fontSize: typography.body, lineHeight: 24, textAlign: 'center' },
  backButton: {
    minHeight: 48,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.accent,
  },
  backButtonText: { color: palette.surface, fontSize: typography.body, fontWeight: '600' },
  floatingPageCount: { position: 'absolute', bottom: spacing.md, alignSelf: 'center' },
  floatingPageText: { color: palette.readerMuted, fontSize: typography.micro },
  floatingPageTextLight: { color: palette.muted },
  errorBanner: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: 116,
    minHeight: 52,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.xxl,
    borderRadius: radius.md,
    justifyContent: 'center',
    backgroundColor: palette.danger,
  },
  errorBannerText: { color: palette.surface, fontSize: typography.small, lineHeight: 18 },
  errorClose: { position: 'absolute', right: spacing.md, color: palette.surface, fontSize: 24 },
});
