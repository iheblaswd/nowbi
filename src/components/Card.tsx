import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, space } from '@/theme/tokens';

type Props = {
  children: React.ReactNode;
  /** Colour of the offset "sticker" shadow. */
  shadow?: 'yellow' | 'pink' | 'blue' | 'purple' | 'none';
  style?: ViewStyle;
};

const shadowColor = {
  yellow: colors.yellow,
  pink: colors.pink,
  blue: colors.blue,
  purple: colors.purple,
  none: 'transparent',
} as const;

/** Outlined card with a hard, colored offset shadow — the Sticker Bomb signature. */
export function Card({ children, shadow = 'yellow', style }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <View style={[styles.shadow, { backgroundColor: shadowColor[shadow] }]} />
      <View style={[styles.card, shadow === 'none' && styles.flat]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative', marginEnd: 6, marginBottom: 6 },
  shadow: {
    position: 'absolute',
    top: 6,
    bottom: -6,
    start: 6,
    end: -6,
    borderRadius: radius.card,
  },
  card: {
    borderWidth: 3,
    borderColor: colors.text,
    borderRadius: radius.card,
    backgroundColor: colors.ground,
    padding: space.xl,
    gap: space.md,
  },
  flat: { borderColor: colors.line },
});
