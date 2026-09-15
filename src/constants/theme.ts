export const palette = {
  ink: '#1C1445',
  muted: '#5B5576',
  faint: '#AAA3C9',
  paper: '#F7F6FB',
  surface: '#FFFFFF',
  line: '#E3E0EE',
  accent: '#3A2C6A',
  accentPressed: '#0F082B',
  accentSoft: '#DCEAF5',
  danger: '#A33D35',
  reader: '#0F082B',
  readerSurface: '#1C1445',
  readerText: '#FFFFFF',
  readerMuted: '#C5C0D8',
  shadow: '#0B0722',
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
} as const;

export const typography = {
  display: 32,
  title: 20,
  body: 16,
  small: 13,
  micro: 11,
} as const;

export const shadows = {
  card: {
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
} as const;

export const layout = {
  screenPadding: spacing.lg,
  gridGap: spacing.md,
  maxPageWidth: 820,
} as const;
