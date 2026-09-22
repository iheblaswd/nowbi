/**
 * Nowbi design tokens — "Sticker Bomb" direction.
 * Dark ground, tilted sticker labels, one accent per moment.
 * Rule: no red for state, nothing "overdue", nothing that can look like failure.
 */
export const colors = {
  ground: '#0B0B0F',
  surface: '#1A1A21',
  surface2: '#2A2A33',
  line: '#3A3A46',
  text: '#FFFFFF',
  muted: '#B3B3C0',
  dim: '#7C7C8A',
  ink: '#0B0B0F',
  yellow: '#FFD23F',
  pink: '#FF5DA2',
  blue: '#3DA5FF',
  purple: '#8B5CF6',
  green: '#5CE0A8',
  // used only for the "Up next" sticker label, never for state
  coral: '#F04438',
} as const;

export type StickerTone = 'white' | 'yellow' | 'pink' | 'blue' | 'purple' | 'green' | 'coral' | 'dark';

export const stickerBg: Record<StickerTone, string> = {
  white: colors.text,
  yellow: colors.yellow,
  pink: colors.pink,
  blue: colors.blue,
  purple: colors.purple,
  green: colors.green,
  coral: colors.coral,
  dark: colors.surface2,
};

export const stickerFg: Record<StickerTone, string> = {
  white: colors.ink,
  yellow: colors.ink,
  pink: colors.ink,
  blue: colors.ink,
  purple: colors.text,
  green: colors.ink,
  coral: colors.text,
  dark: colors.text,
};

export const fonts = {
  display: 'ArchivoBlack_400Regular',
  body: 'Nunito_700Bold',
  bodyExtra: 'Nunito_800ExtraBold',
  bodyRegular: 'Nunito_600SemiBold',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 } as const;

export const radius = { pill: 999, card: 22, row: 16, tile: 18 } as const;

/** Rotations cycle through these so stickers never look aligned. */
export const tilts = [-3, 2, -2, 3] as const;
