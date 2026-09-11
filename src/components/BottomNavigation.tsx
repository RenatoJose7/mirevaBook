import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette, radius, shadows, spacing, typography } from '@/src/constants/theme';

export type NavigationSection = 'home' | 'highlights' | 'profile';

interface BottomNavigationProps {
  active: NavigationSection;
}

const items: Array<{
  key: NavigationSection;
  label: string;
  route: '/' | '/highlights' | '/profile';
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}> = [
  { key: 'home', label: 'Início', route: '/', icon: 'home-outline', activeIcon: 'home' },
  { key: 'highlights', label: 'Destaques', route: '/highlights', icon: 'star-outline', activeIcon: 'star' },
  { key: 'profile', label: 'Perfil', route: '/profile', icon: 'person-outline', activeIcon: 'person' },
];

export function BottomNavigation({ active }: BottomNavigationProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.safeArea, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <View style={[styles.bar, shadows.card]}>
        {items.map((item) => {
          const selected = item.key === active;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={item.label}
              onPress={() => {
                if (!selected) router.replace(item.route);
              }}
              style={({ pressed }) => [
                styles.item,
                selected && styles.itemActive,
                pressed && styles.itemPressed,
              ]}
            >
              <Ionicons
                name={selected ? item.activeIcon : item.icon}
                size={22}
                color={selected ? palette.surface : palette.ink}
              />
              {selected && <Text style={styles.label}>{item.label}</Text>}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.paper,
  },
  bar: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: palette.surface,
  },
  item: {
    minWidth: 54,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  itemActive: { minWidth: 116, backgroundColor: palette.ink },
  itemPressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  label: { color: palette.surface, fontSize: typography.small, fontWeight: '600' },
});
