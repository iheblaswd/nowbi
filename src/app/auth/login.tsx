import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/Screen';
import { Sticker } from '@/components/Sticker';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { useAuth } from '@/features/auth/AuthProvider';
import { authErrorKey, isValidEmail } from '@/features/auth/errors';
import { colors, fonts, space } from '@/theme/tokens';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState<'none' | 'email' | 'google'>('none');
  const [error, setError] = useState<string | null>(null);

  const run = async (fn: () => Promise<void>, which: 'email' | 'google') => {
    setError(null);
    setBusy(which);
    try {
      await fn();
      // On success the Gate in the root layout moves us into the app.
    } catch (e) {
      const key = authErrorKey(e);
      if (key === 'auth.errors.notConfirmed') router.replace('/auth/verify');
      else setError(t(key));
    } finally {
      setBusy('none');
    }
  };

  return (
    <Screen>
      <View style={styles.head}>
        <Button label={t('settings.back')} onPress={() => router.back()} variant="dark" size="sm" />
        <Sticker tone="blue" tilt={1}>{t('auth.loginTag')}</Sticker>
      </View>
      <Text style={styles.title}>{t('auth.loginTitle')}</Text>

      <Field
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        placeholder="you@example.com"
      />
      <Field
        label={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
        textContentType="password"
        onSubmitEditing={() => run(() => signIn(email.trim().toLowerCase(), password), 'email')}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {busy !== 'none' ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.yellow} />
          <Text style={styles.loaderText}>{busy === 'google' ? t('auth.googleWait') : t('auth.working')}</Text>
        </View>
      ) : null}
      <View style={styles.spacer} />
      <Button
        label={busy === 'email' ? t('auth.working') : t('auth.login')}
        onPress={() => run(() => signIn(email.trim().toLowerCase(), password), 'email')}
        disabled={busy !== 'none' || !isValidEmail(email) || password.length === 0}
      />
      <Button label={busy === 'google' ? t('auth.working') : t('welcome.google')} onPress={() => run(signInWithGoogle, 'google')} variant="white" disabled={busy !== 'none'} />
      <Button label={t('auth.noAccount')} onPress={() => router.replace('/auth/signup')} variant="dark" disabled={busy !== 'none'} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.text, fontFamily: fonts.display, fontSize: 26, lineHeight: 30 },
  error: { color: colors.yellow, fontFamily: fonts.body, fontSize: 14 },
  loader: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'center' },
  loaderText: { color: colors.muted, fontFamily: fonts.body, fontSize: 14 },
  spacer: { flex: 1, minHeight: space.lg },
});
