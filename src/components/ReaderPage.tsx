import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import { palette, radius, spacing, typography } from '@/src/constants/theme';
import type { RenderedPage } from '@/src/types/book';

interface ReaderPageProps {
  page?: RenderedPage;
  pageNumber: number;
  darkMode: boolean;
}

export function ReaderPage({ page, pageNumber, darkMode }: ReaderPageProps) {
  return (
    <View style={[styles.container, !darkMode && styles.containerLight]}>
      {page ? (
        <Image
          accessibilityLabel={`Página ${pageNumber}`}
          source={{ uri: page.uri }}
          resizeMode="contain"
          style={styles.image}
        />
      ) : (
        <View style={styles.loading}>
          <ActivityIndicator color={darkMode ? palette.readerText : palette.accent} />
          <Text style={[styles.loadingText, !darkMode && styles.loadingTextLight]}>
            Preparando página {pageNumber}…
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: palette.readerSurface,
  },
  containerLight: { backgroundColor: palette.line },
  image: { width: '100%', height: '100%', backgroundColor: palette.surface },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  loadingText: { color: palette.readerMuted, fontSize: typography.small },
  loadingTextLight: { color: palette.muted },
});
