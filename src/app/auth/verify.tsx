import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/Screen';
import { Sticker } from '@/components/Sticker';
import { Button } from '@/components/Button';
import { useAuth } from '@/features/auth/AuthProvider';
import { authErrorKey } from '@/features/auth/errors';
import { colors, fonts, radius, space } from '@/theme/tokens';

const POLL_MS = 4000;

/**
 * Shown right after sign-up. A loader runs while we wait for the confirmation
 * link to be clicked; the app polls sign-in every few seconds and, the moment
 * the email is confirmed, the session appears and the Gate opens the app.
 */
export default function VerifyScreen() {
  const { t } = useTranslation();
  const { pending, tryPendingSignIn, resendConfirmation, signOut } = useAuth();
  const [seconds, setSeconds] = useState(0);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!pending) {
      router.replace('/welcome');
      return;
    }
    timer.current = setInterval(async () => {
      setSeconds((s) => s + POLL_MS / 1000);
      const ok = await tryPendingSignIn();
      if (ok && timer.current) clearInterval(timer.current);
    }, POLL_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [pending, tryPendingSignIn]);

  const checkNow = async () => {
    setChecking(true);
    setError(null);
    const ok = await tryPendingSignIn();
    setChecking(false);
    if (!ok) setError(t('auth.verify.notYet'));
  };

  const resend = async () => {
    if (!pending) return;
    setError(null);
    try {
      await resendConfirmation(pending.email);
      setResent(true);
    } catch (e) {
      setError(t(authErrorKey(e)));
    }
  };

  const openMail = () => {
    Linking.openURL('mailto:').catch(() => undefined);
  };

  return (
    <Screen>
      <View style={styles.head}>
        <Button label={t('auth.verify.changeEmail')} onPress={() => signOut().then(() => router.replace('/auth/signup'))} variant="dark" size="sm" />
        <Sticker tone="pink" tilt={1}>{t('auth.verify.tag')}</Sticker>
      </View>

      <View style={styles.card}>
        <ActivityIndicator size="large" color={colors.yellow} />
        <Text style={styles.title}>{t('auth.verify.title')}</Text>
        <Text style={styles.email}>{pending?.email}</Text>
        <Text style={styles.sub}>{t('auth.verify.sub')}</Text>
        <Text style={styles.meta}>{t('auth.verify.waiting', { seconds })}</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {resent ? <Text style={styles.ok}>{t('auth.verify.resent')}</Text> : null}

      <View style={styles.spacer} />
      <Button label={t('auth.verify.openMail')} onPress={openMail} variant="white" />
      <Button label={checking ? t('auth.working') : t('auth.verify.clicked')} onPress={checkNow} disabled={checking} />
      <Button label={t('auth.verify.resend')} onPress={resend} variant="outline" disabled={resent} />
      <Text style={styles.hint}>{t('auth.verify.spam')}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  card: { alignItems: 'center', gap: space.md, padding: space.xxl, borderRadius: radius.card, borderWidth: 3, borderColor: colors.text, marginTop: space.lg },
  title: { color: colors.text, fontFamily: fonts.display, fontSize: 22, textAlign: 'center' },
  email: { color: colors.yellow, fontFamily: fonts.bodyExtra, fontSize: 16, textAlign: 'center' },
  sub: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, textAlign: 'center', lineHeight: 21 },
  meta: { color: colors.dim, fontFamily: fonts.body, fontSize: 12 },
  error: { color: colors.yellow, fontFamily: fonts.body, fontSize: 14, textAlign: 'center' },
  ok: { color: colors.green, fontFamily: fonts.body, fontSize: 14, textAlign: 'center' },
  hint: { color: colors.dim, fontFamily: fonts.body, fontSize: 12, textAlign: 'center' },
  spacer: { flex: 1, minHeight: space.lg },
});
