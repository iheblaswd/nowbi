import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '@/theme/tokens';

type Props = {
  /** 0..1 */
  progress: number;
  color?: string;
  height?: number;
};

/** A shrinking/growing bar: the visual-time primitive used everywhere. */
export function TimeBar({ progress, color = colors.yellow, height = 16 }: Props) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
      style={[styles.track, { height, borderRadius: radius.pill }]}
    >
      <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color, borderRadius: radius.pill }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flex: 1, backgroundColor: colors.surface2, overflow: 'hidden' },
  fill: { height: '100%' },
});
