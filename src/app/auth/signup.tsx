import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/Screen';
import { Sticker } from '@/components/Sticker';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { useAuth } from '@/features/auth/AuthProvider';
import { authErrorKey, isValidEmail } from '@/features/auth/errors';
import { colors, fonts, space } from '@/theme/tokens';

export default function SignupScreen() {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailOk = isValidEmail(email);
  const passOk = password.length >= 8;

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      const result = await signUp(email.trim().toLowerCase(), password);
      if (result === 'confirm') router.replace('/auth/verify');
      // 'done' (confirmation disabled in Supabase): the Gate sends us into the app.
    } catch (e) {
      const key = authErrorKey(e);
      if (key === 'auth.errors.notConfirmed') router.replace('/auth/verify');
      else setError(t(key));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <View style={styles.head}>
        <Button label={t('settings.back')} onPress={() => router.back()} variant="dark" size="sm" />
        <Sticker tone="yellow" tilt={1}>{t('auth.signupTag')}</Sticker>
      </View>
      <Text style={styles.title}>{t('auth.signupTitle')}</Text>
      <Text style={styles.sub}>{t('auth.signupSub')}</Text>

      <Field
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        placeholder="you@example.com"
        error={email.length > 3 && !emailOk ? t('auth.errors.badEmail') : null}
      />
      <Field
        label={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        placeholder={t('auth.passwordHint')}
        error={password.length > 0 && !passOk ? t('auth.errors.weakPassword') : null}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.spacer} />
      <Button label={busy ? t('auth.working') : t('auth.createAccount')} onPress={submit} disabled={busy || !emailOk || !passOk} />
      <Button label={t('auth.haveAccount')} onPress={() => router.replace('/auth/login')} variant="dark" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.text, fontFamily: fonts.display, fontSize: 26, lineHeight: 30 },
  sub: { color: colors.muted, fontFamily: fonts.body, fontSize: 15 },
  error: { color: colors.yellow, fontFamily: fonts.body, fontSize: 14 },
  spacer: { flex: 1, minHeight: space.lg },
});
