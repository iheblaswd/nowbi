import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/Screen';
import { Sticker } from '@/components/Sticker';
import { Button } from '@/components/Button';
import { useAuth } from '@/features/auth/AuthProvider';
import { authErrorKey } from '@/features/auth/errors';
import { colors, fonts, space } from '@/theme/tokens';

/** First screen before the app: the pitch, then three ways in. */
export default function WelcomeScreen() {
  const { t } = useTranslation();
  const { configured, signInWithGoogle, continueAsGuest } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const google = async () => {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(t(authErrorKey(e)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <View style={styles.top}>
        <View style={styles.stickers}>
          <Sticker tone="pink" tilt={0}>{t('welcome.tag1')}</Sticker>
          <Sticker tone="blue" tilt={1}>{t('welcome.tag2')}</Sticker>
          <Sticker tone="green" tilt={2}>{t('welcome.tag3')}</Sticker>
        </View>
        <View style={styles.logo}>
          <Text style={[styles.logoWord, { backgroundColor: colors.yellow, transform: [{ rotate: '-4deg' }] }]}>Now</Text>
          <Text style={[styles.logoWord, styles.logoWord2, { backgroundColor: colors.pink, transform: [{ rotate: '3deg' }] }]}>bi</Text>
        </View>
        <Text style={styles.pitch}>{t('welcome.pitch')}</Text>
        <Text style={styles.sub}>{t('welcome.sub')}</Text>
      </View>

      <View style={styles.spacer} />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {busy ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.yellow} />
          <Text style={styles.loaderText}>{t('auth.googleWait')}</Text>
        </View>
      ) : null}
      <View style={styles.btns}>
        <Button
          label={busy ? t('auth.working') : t('welcome.google')}
          onPress={google}
          variant="white"
          disabled={busy || !configured}
          icon={(c) => <AntDesign name="google" size={20} color={c} />}
        />
        <Button
          label={t('welcome.signup')}
          onPress={() => router.push('/auth/signup')}
          disabled={busy || !configured}
          icon={(c) => <Ionicons name="mail" size={22} color={c} />}
        />
        <Button
          label={t('welcome.login')}
          onPress={() => router.push('/auth/login')}
          variant="outline"
          disabled={busy || !configured}
          icon={(c) => <Ionicons name="log-in-outline" size={24} color={c} />}
        />
        {!configured && (
          <>
            <Text style={styles.hint}>{t('welcome.notConfigured')}</Text>
            <Button label={t('welcome.guest')} onPress={continueAsGuest} variant="dark" />
          </>
        )}
      </View>
      <Text style={styles.legal}>{t('welcome.legal')}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { gap: space.lg, marginTop: space.xl },
  stickers: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  logo: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginTop: space.md },
  logoWord: {
    fontFamily: fonts.display,
    fontSize: 64,
    lineHeight: 70,
    textTransform: 'uppercase',
    color: colors.ink,
    paddingVertical: 2,
    paddingHorizontal: 14,
  },
  logoWord2: { marginBottom: 10 },
  pitch: { color: colors.text, fontFamily: fonts.display, fontSize: 24, lineHeight: 29 },
  sub: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 21 },
  spacer: { flex: 1, minHeight: space.xxl },
  btns: { gap: space.sm },
  error: { color: colors.yellow, fontFamily: fonts.body, fontSize: 14 },
  loader: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'center' },
  loaderText: { color: colors.muted, fontFamily: fonts.body, fontSize: 14 },
  hint: { color: colors.dim, fontFamily: fonts.body, fontSize: 12, textAlign: 'center', marginTop: 4 },
  legal: { color: colors.dim, fontFamily: fonts.body, fontSize: 12, textAlign: 'center', marginTop: space.sm },
});
