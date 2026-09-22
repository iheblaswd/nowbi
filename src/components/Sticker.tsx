import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts, radius, stickerBg, stickerFg, StickerTone, tilts } from '@/theme/tokens';

type Props = {
  children: React.ReactNode;
  tone?: StickerTone;
  /** Index into the tilt cycle; omit for no rotation. */
  tilt?: number;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
};

export function Sticker({ children, tone = 'white', tilt, size = 'md', style }: Props) {
  const rotate = tilt === undefined ? '0deg' : `${tilts[tilt % tilts.length]}deg`;
  const fontSize = size === 'sm' ? 10 : size === 'lg' ? 15 : 11;
  const padV = size === 'sm' ? 4 : size === 'lg' ? 8 : 6;
  const padH = size === 'sm' ? 9 : size === 'lg' ? 14 : 11;
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: stickerBg[tone], paddingVertical: padV, paddingHorizontal: padH, transform: [{ rotate }] },
        style,
      ]}
    >
      <Text style={[styles.text, { color: stickerFg[tone], fontSize }]} numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    backgroundColor: colors.text,
  },
  text: {
    fontFamily: fonts.display,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    lineHeight: 14,
  },
});
