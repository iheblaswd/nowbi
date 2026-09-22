import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fonts, radius } from '@/theme/tokens';

function TabLabel({ label, focused, tilt }: { label: string; focused: boolean; tilt: number }) {
  return (
    <View style={[styles.pill, focused && styles.pillOn, focused && { transform: [{ rotate: `${tilt}deg` }] }]}>
      <Text style={[styles.label, focused && styles.labelOn]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.bar,
        tabBarItemStyle: styles.item,
        sceneStyle: { backgroundColor: colors.ground },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('nav.now'), tabBarIcon: ({ focused }) => <TabLabel label={t('nav.now')} focused={focused} tilt={-3} /> }} />
      <Tabs.Screen name="plan" options={{ title: t('nav.plan'), tabBarIcon: ({ focused }) => <TabLabel label={t('nav.plan')} focused={focused} tilt={2} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.ground,
    borderTopWidth: 0,
    height: 74,
    paddingTop: 10,
  },
  item: { justifyContent: 'center' },
  pill: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: radius.pill },
  pillOn: { backgroundColor: colors.yellow },
  label: { fontFamily: fonts.display, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.muted },
  labelOn: { color: colors.ink },
});
