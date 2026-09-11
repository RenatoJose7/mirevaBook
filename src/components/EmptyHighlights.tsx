import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { palette, radius, spacing, typography } from '@/src/constants/theme';

export function EmptyHighlights() {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="star-outline" size={32} color={palette.accent} />
      </View>
      <Text style={styles.title}>Nenhum livro em destaque</Text>
      <Text style={styles.description}>
        Toque na estrela de um livro na biblioteca para encontrá-lo rapidamente aqui.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  iconCircle: {
    width: 82,
    height: 82,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    backgroundColor: palette.accentSoft,
  },
  title: { color: palette.ink, fontSize: typography.title, fontWeight: '600', textAlign: 'center' },
  description: {
    maxWidth: 310,
    color: palette.muted,
    fontSize: typography.body,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
