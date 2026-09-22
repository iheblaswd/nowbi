import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { reloadAppAsync } from 'expo';
import { Screen } from '@/components/Screen';
import { Sticker } from '@/components/Sticker';
import { Button } from '@/components/Button';
import { changeLanguage, Lang, SUPPORTED } from '@/i18n';
import { clearAllTasks, seedIfEmpty } from '@/db/tasks';
import { useAuth } from '@/features/auth/AuthProvider';
import { colors, fonts, radius, space } from '@/theme/tokens';

const LABELS: Record<Lang, string> = { en: 'English', fr: 'Français', ar: 'العربية' };

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { session, guest, signOut } = useAuth();
  const [busy, setBusy] = useState(false);

  const pick = async (lang: Lang) => {
    setBusy(true);
    const needsReload = await changeLanguage(lang);
    setBusy(false);
    if (needsReload) {
      try {
        await reloadAppAsync('language direction changed');
      } catch {
        // In Expo Go on some devices reload is not available; the next manual reload applies RTL.
      }
    }
  };

  const loadExamples = async () => {
    await clearAllTasks();
    await seedIfEmpty();
    router.back();
  };

  return (
    <Screen>
      <View style={styles.head}>
        <Button label={t('settings.back')} onPress={() => router.back()} variant="dark" size="sm" />
        <Sticker tone="dark" tilt={1}>
          {t('settings.title')}
        </Sticker>
      </View>

      <Text style={styles.eyebrow}>{t('settings.language')}</Text>
      <View style={styles.chips}>
        {SUPPORTED.map((lang) => {
          const on = i18n.language === lang;
          return (
            <Pressable
              key={lang}
              onPress={() => pick(lang)}
              disabled={busy}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={[styles.chip, on && styles.chipOn]}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{LABELS[lang]}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.hint}>{t('settings.languageHint')}</Text>

      <View style={styles.box}>
        <Text style={styles.hint}>{t('settings.noShame')}</Text>
      </View>

      <View style={styles.box}>
        <Text style={styles.hint}>{session?.user.email ? t('settings.signedInAs', { email: session.user.email }) : guest ? t('settings.guestMode') : ''}</Text>
      </View>

      <View style={styles.spacer} />
      <Button label={t('settings.loadExamples')} onPress={loadExamples} variant="outline" />
      <Button label={t('settings.logout')} onPress={() => signOut()} variant="dark" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: colors.muted, fontFamily: fonts.display, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: space.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.surface },
  chipOn: { backgroundColor: colors.yellow, borderColor: colors.yellow },
  chipText: { color: colors.text, fontFamily: fonts.bodyExtra, fontSize: 14 },
  chipTextOn: { color: colors.ink },
  hint: { color: colors.dim, fontFamily: fonts.body, fontSize: 13 },
  box: { padding: space.lg, borderRadius: radius.row, backgroundColor: colors.surface },
  spacer: { flex: 1, minHeight: space.lg },
});
