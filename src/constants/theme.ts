export const palette = {
  ink: '#1B1C1A',
  muted: '#74766F',
  faint: '#A8AAA3',
  paper: '#F7F5EF',
  surface: '#FFFFFF',
  line: '#E6E3DA',
  accent: '#43675A',
  accentPressed: '#355248',
  accentSoft: '#E3ECE7',
  danger: '#A33D35',
  reader: '#171918',
  readerSurface: '#242725',
  readerText: '#F4F2EA',
  readerMuted: '#B6B8B3',
  shadow: '#10110F',
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
