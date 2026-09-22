import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Sticker } from '@/components/Sticker';
import { colors, fonts, radius, space } from '@/theme/tokens';

type Props = {
  title: string;
  minutes: number;
  tilt?: number;
  tone?: 'yellow' | 'blue' | 'green';
  right?: React.ReactNode;
};

export function TaskRow({ title, minutes, tilt = 1, tone = 'yellow', right }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      {right ?? (
        <Sticker tone={tone} tilt={tilt} size="sm">
          {minutes} min
        </Sticker>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    paddingVertical: 14,
    paddingHorizontal: space.lg,
    borderRadius: radius.row,
    backgroundColor: colors.surface,
  },
  title: { flex: 1, color: colors.text, fontFamily: fonts.bodyExtra, fontSize: 16 },
});
