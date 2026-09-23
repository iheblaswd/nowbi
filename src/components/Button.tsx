import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts, radius } from '@/theme/tokens';

type Variant = 'primary' | 'outline' | 'purple' | 'pink' | 'blue' | 'white' | 'dark';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: 'sm' | 'md';
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  /** Optional glyph shown before the label (receives the label color via `iconColor`). */
  icon?: (iconColor: string) => React.ReactNode;
};

const bg: Record<Variant, string> = {
  primary: colors.yellow,
  outline: 'transparent',
  purple: colors.purple,
  pink: colors.pink,
  blue: colors.blue,
  white: colors.text,
  dark: colors.surface2,
};
const fg: Record<Variant, string> = {
  primary: colors.ink,
  outline: colors.text,
  purple: colors.text,
  pink: colors.ink,
  blue: colors.ink,
  white: colors.ink,
  dark: colors.text,
};

export function Button({ label, onPress, variant = 'primary', size = 'md', disabled, style, accessibilityLabel, icon }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        { backgroundColor: bg[variant] },
        variant === 'outline' && styles.outline,
        pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
        disabled && { opacity: 0.45 },
        style,
      ]}
    >
      {icon ? <View style={styles.icon}>{icon(fg[variant])}</View> : null}
      <Text style={[styles.label, { color: fg[variant] }, size === 'sm' && styles.labelSm]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'stretch',
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  md: { height: 54, paddingHorizontal: 18 },
  sm: { height: 42, paddingHorizontal: 16, alignSelf: 'flex-start' },
  outline: { borderWidth: 3, borderColor: colors.text },
  icon: { marginRight: 10, alignItems: 'center', justifyContent: 'center' },
  label: {
    fontFamily: fonts.display,
    fontSize: 15,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  labelSm: { fontSize: 12 },
});
