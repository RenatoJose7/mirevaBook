import Slider from '@react-native-community/slider';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette, radius, spacing, typography } from '@/src/constants/theme';

interface ReaderControlsProps {
  title: string;
  currentPage: number;
  totalPages: number;
  zoomScale: number;
  isBookmarked: boolean;
  darkMode: boolean;
  onBack: () => void;
  onPageChange: (page: number) => void;
  onZoomChange: (scale: number) => void;
  onToggleBookmark: () => void;
  onToggleDarkMode: () => void;
}

export function ReaderControls({
  title,
  currentPage,
  totalPages,
  zoomScale,
  isBookmarked,
  darkMode,
  onBack,
  onPageChange,
  onZoomChange,
  onToggleBookmark,
  onToggleDarkMode,
}: ReaderControlsProps) {
  const insets = useSafeAreaInsets();
  const [previewPage, setPreviewPage] = useState(currentPage);

  useEffect(() => setPreviewPage(currentPage), [currentPage]);

  return (
    <Animated.View
      entering={FadeIn.duration(160)}
      exiting={FadeOut.duration(130)}
      pointerEvents="box-none"
      style={StyleSheet.absoluteFill}
    >
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.xs }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={onBack} style={styles.iconButton}>
          <Text style={styles.backIcon}>{'‹'}</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={darkMode ? 'Usar tema claro' : 'Usar tema escuro'}
          onPress={onToggleDarkMode}
          style={styles.iconButton}
        >
          <Text style={styles.iconText}>{darkMode ? '☼' : '◐'}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isBookmarked ? 'Remover marcador' : 'Adicionar marcador'}
          onPress={onToggleBookmark}
          style={[styles.iconButton, isBookmarked && styles.bookmarkActive]}
        >
          <Text style={[styles.bookmark, isBookmarked && styles.bookmarkTextActive]}>▮</Text>
        </Pressable>
      </View>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <View style={styles.controlsRow}>
          <View style={styles.pageRow}>
            <Text style={styles.pageLabel}>Pagina</Text>
            <Text style={styles.pageValue}>{previewPage} / {totalPages}</Text>
          </View>
          <View style={styles.zoomControls}>
            <Text style={styles.zoomLabel}>Zoom</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Diminuir zoom"
              disabled={zoomScale <= 1}
              onPress={() => onZoomChange(Math.max(1, zoomScale - 0.25))}
              style={[styles.zoomButton, zoomScale <= 1 && styles.zoomButtonDisabled]}
            >
              <Text style={styles.zoomButtonText}>A-</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Redefinir zoom"
              onPress={() => onZoomChange(1)}
              style={styles.zoomValueButton}
            >
              <Text style={styles.zoomValue}>{Math.round(zoomScale * 100)}%</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Aumentar zoom"
              disabled={zoomScale >= 2.5}
              onPress={() => onZoomChange(Math.min(2.5, zoomScale + 0.25))}
              style={[styles.zoomButton, zoomScale >= 2.5 && styles.zoomButtonDisabled]}
            >
              <Text style={styles.zoomButtonText}>A+</Text>
            </Pressable>
          </View>
        </View>
        <Slider
          accessibilityLabel="Navegar pelas paginas"
          style={styles.slider}
          minimumValue={1}
          maximumValue={Math.max(1, totalPages)}
          step={1}
          value={currentPage}
          minimumTrackTintColor={palette.accentSoft}
          maximumTrackTintColor="#5B5576"
          thumbTintColor={palette.surface}
          onValueChange={(value) => setPreviewPage(Math.round(value))}
          onSlidingComplete={(value) => onPageChange(Math.round(value))}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: 'rgba(15, 8, 43, 0.96)',
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  bookmarkActive: { backgroundColor: palette.accentSoft },
  backIcon: { color: palette.readerText, fontSize: 38, lineHeight: 38, fontWeight: '300' },
  iconText: { color: palette.readerText, fontSize: 24 },
  bookmark: { color: palette.readerText, fontSize: 21, transform: [{ scaleX: 0.72 }] },
  bookmarkTextActive: { color: palette.accent },
  title: {
    flex: 1,
    color: palette.readerText,
    fontSize: typography.body,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(15, 8, 43, 0.96)',
  },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  pageRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  pageLabel: { color: palette.readerMuted, fontSize: typography.small },
  pageValue: { color: palette.readerText, fontSize: typography.small, fontWeight: '600' },
  zoomControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
  zoomLabel: { color: palette.readerMuted, fontSize: typography.micro, marginRight: spacing.xxs },
  zoomButton: {
    width: 30,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  zoomButtonDisabled: { opacity: 0.38 },
  zoomButtonText: { color: palette.readerText, fontSize: 12, fontWeight: '700' },
  zoomValueButton: { minWidth: 38, alignItems: 'center' },
  zoomValue: { color: palette.accentSoft, fontSize: typography.micro, fontWeight: '700' },
  slider: { width: '100%', height: 38, marginTop: spacing.xs },
});
