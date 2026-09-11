import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation } from '@/src/components/BottomNavigation';
import { layout, palette, radius, shadows, spacing, typography } from '@/src/constants/theme';
import { useReadingSummary } from '@/src/hooks/useReadingSummary';

export default function ProfileScreen() {
  const { summary, loading, error, refresh } = useReadingSummary();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={30} color={palette.accent} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>PERFIL LOCAL</Text>
            <Text style={styles.heading}>Sua leitura</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={palette.accent} />
            <Text style={styles.loadingText}>Calculando seu progresso…</Text>
          </View>
        ) : (
          <>
            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>PROGRESSO DA BIBLIOTECA</Text>
              <Text style={styles.heroValue}>{summary.overallProgress}%</Text>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${summary.overallProgress}%` }]} />
              </View>
              <Text style={styles.heroDescription}>
                {summary.pagesRead === 0
                  ? 'Abra um livro para começar a registrar sua leitura.'
                  : `${summary.pagesRead} páginas únicas visualizadas.`}
              </Text>
            </View>

            <View style={styles.statsRow}>
              <StatCard icon="reader-outline" value={summary.pagesRead} label="Páginas lidas" />
              <StatCard icon="checkmark-circle-outline" value={summary.booksCompleted} label="Livros lidos" />
            </View>

            <View style={[styles.detailCard, shadows.card]}>
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="book-outline" size={20} color={palette.accent} />
                </View>
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Em andamento</Text>
                  <Text style={styles.detailValue}>{summary.booksInProgress} livros</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="time-outline" size={20} color={palette.accent} />
                </View>
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Leitura mais recente</Text>
                  <Text style={styles.detailValue} numberOfLines={2}>
                    {summary.recentBookTitle ?? 'Nenhuma leitura registrada'}
                  </Text>
                </View>
              </View>
            </View>

            {error && <Text style={styles.error}>{error}</Text>}
          </>
        )}
      </ScrollView>
      <BottomNavigation active="profile" />
    </SafeAreaView>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
}) {
  return (
    <View style={[styles.statCard, shadows.card]}>
      <Ionicons name={icon} size={23} color={palette.accent} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper },
  content: { padding: layout.screenPadding, paddingBottom: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.accentSoft,
  },
  headerText: { flex: 1 },
  eyebrow: { color: palette.accent, fontSize: typography.micro, letterSpacing: 1.8, fontWeight: '700' },
  heading: { color: palette.ink, fontSize: typography.display, lineHeight: 39, fontWeight: '700', letterSpacing: -0.8 },
  loading: { minHeight: 300, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  loadingText: { color: palette.muted, fontSize: typography.small },
  heroCard: { padding: spacing.lg, borderRadius: radius.lg, backgroundColor: palette.ink },
  heroLabel: { color: palette.readerMuted, fontSize: typography.micro, letterSpacing: 1.4, fontWeight: '700' },
  heroValue: { color: palette.surface, fontSize: 52, lineHeight: 62, fontWeight: '700', letterSpacing: -1.5 },
  heroDescription: { color: palette.readerMuted, fontSize: typography.small, lineHeight: 19, marginTop: spacing.sm },
  track: { height: 5, borderRadius: radius.pill, overflow: 'hidden', backgroundColor: palette.readerSurface },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: palette.accentSoft },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  statCard: { flex: 1, minHeight: 142, padding: spacing.md, borderRadius: radius.md, backgroundColor: palette.surface },
  statValue: { color: palette.ink, fontSize: 30, fontWeight: '700', marginTop: spacing.md },
  statLabel: { color: palette.muted, fontSize: typography.small, lineHeight: 18, marginTop: spacing.xxs },
  detailCard: { marginTop: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: palette.surface },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  detailIcon: { width: 42, height: 42, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.accentSoft },
  detailText: { flex: 1 },
  detailLabel: { color: palette.muted, fontSize: typography.micro, letterSpacing: 0.8, textTransform: 'uppercase' },
  detailValue: { color: palette.ink, fontSize: typography.body, fontWeight: '600', marginTop: spacing.xxs },
  divider: { height: 1, backgroundColor: palette.line, marginVertical: spacing.md },
  error: { color: palette.danger, fontSize: typography.small, textAlign: 'center', marginTop: spacing.lg },
});
