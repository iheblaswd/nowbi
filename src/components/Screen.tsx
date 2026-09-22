import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space } from '@/theme/tokens';

type Props = { children: React.ReactNode; scroll?: boolean };

/** Dark ground, safe-area aware, 20px gutters. Every screen starts here. */
export function Screen({ children, scroll = true }: Props) {
  const insets = useSafeAreaInsets();
  const padding = {
    paddingTop: insets.top + space.lg,
    paddingBottom: insets.bottom + space.xxl,
    paddingHorizontal: space.xl,
  };
  if (!scroll) {
    return <View style={[styles.root, padding]}>{children}</View>;
  }
  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, padding]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ground },
  content: { gap: space.lg, flexGrow: 1 },
});
