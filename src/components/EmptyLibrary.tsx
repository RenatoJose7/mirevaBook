import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, radius, spacing, typography } from '@/src/constants/theme';

interface EmptyLibraryProps {
  onAdd: () => void;
}

export function EmptyLibrary({ onAdd }: EmptyLibraryProps) {
  return (
    <View style={styles.container}>
      <View style={styles.bookShape}>
        <View style={styles.bookSpine} />
        <Text style={styles.bookMonogram}>M</Text>
      </View>
      <Text style={styles.title}>Sua biblioteca está vazia</Text>
      <Text style={styles.description}>Adicione um PDF para começar a leitura.</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onAdd}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonText}>Adicionar livro</Text>
      </Pressable>
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
  bookShape: {
    width: 92,
    height: 126,
    borderRadius: radius.sm,
    backgroundColor: palette.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  bookSpine: {
    position: 'absolute',
    left: 11,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: palette.accent,
    opacity: 0.24,
  },
  bookMonogram: {
    color: palette.accent,
    fontSize: 28,
    fontWeight: '500',
  },
  title: {
    color: palette.ink,
    fontSize: typography.title,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    color: palette.muted,
    fontSize: typography.body,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  button: {
    minHeight: 50,
    borderRadius: radius.pill,
    backgroundColor: palette.accent,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: { backgroundColor: palette.accentPressed, transform: [{ scale: 0.98 }] },
  buttonText: { color: palette.surface, fontSize: typography.body, fontWeight: '600' },
});
