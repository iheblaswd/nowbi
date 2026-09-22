import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fonts } from '@/theme/tokens';

/**
 * Landing route for nowbi://auth/callback links (email confirmation, Google OAuth).
 * The AuthProvider reads the link and creates the session; the Gate then routes into the app.
 */
export default function AuthCallbackScreen() {
  const { t } = useTranslation();
  return (
    <View style={styles.root}>
      <ActivityIndicator size="large" color={colors.yellow} />
      <Text style={styles.text}>{t('auth.callback')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center', gap: 16 },
  text: { color: colors.muted, fontFamily: fonts.body, fontSize: 15 },
});
