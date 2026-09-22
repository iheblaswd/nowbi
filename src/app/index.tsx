import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/Screen';
import { Sticker } from '@/components/Sticker';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { TimeBar } from '@/components/TimeBar';
import { TaskRow } from '@/components/TaskRow';
import { useNow } from '@/features/now/useNow';
import { colors, fonts, space } from '@/theme/tokens';

function fmtTime(iso: string | null, lang: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
}

export default function NowScreen() {
  const { t, i18n } = useTranslation();
  const { loading, current, next, laterCount, doneCount, plan, done, notNow, meds } = useNow();
  const lang = i18n.language;
  const dateStr = new Date().toLocaleDateString(lang, { weekday: 'short', day: 'numeric', month: 'short' });
  const medsAt = fmtTime(plan?.medsConfirmedAt ?? null, lang);
  const stepProgress = current && current.steps.length ? current.stepIdx / current.steps.length : 0;

  return (
    <Screen>
      {/* Sticker header: date, meds, energy, done count */}
      <View style={styles.stickers}>
        <Sticker tilt={0}>{dateStr}</Sticker>
        <Pressable onPress={meds} accessibilityRole="button" accessibilityLabel={t('now.meds')}>
          <Sticker tone="purple" tilt={1}>
            {medsAt ? `${t('now.meds')} ${medsAt}` : t('now.medsDue')}
          </Sticker>
        </Pressable>
        <Sticker tone="yellow" tilt={2}>
          {t('now.energy', { level: t(`energy.${plan?.energy ?? 'ok'}`) })}
        </Sticker>
        <Sticker tone="blue" tilt={3}>
          {t('now.doneCount', { count: doneCount })}
        </Sticker>
      </View>

      {/* Big title as two tilted stickers */}
      <View style={styles.big}>
        <Text style={[styles.bigWord, { backgroundColor: colors.pink, transform: [{ rotate: '-3deg' }] }]}>{t('now.right')}</Text>
        <Text style={[styles.bigWord, styles.bigWord2, { backgroundColor: colors.yellow, transform: [{ rotate: '2deg' }] }]}>{t('now.now')}</Text>
      </View>

      {/* The one thing */}
      <Card>
        {loading ? null : current ? (
          <>
            <Text style={styles.taskTitle}>{current.title}</Text>
            <Text style={styles.muted}>
              {current.steps.length
                ? t('now.step', { n: current.stepIdx + 1, total: current.steps.length, name: current.steps[current.stepIdx] ?? '' })
                : t('now.minutes', { count: current.estimatedMinutes })}
            </Text>
            <View style={styles.bar}>
              <TimeBar progress={stepProgress} />
              <Sticker tilt={3} size="sm">
                {t('now.minutes', { count: current.estimatedMinutes })}
              </Sticker>
            </View>
            <View style={styles.btns}>
              <Button label={t('now.done')} onPress={done} />
              <Button label={t('now.notNow')} onPress={notNow} variant="outline" />
            </View>
          </>
        ) : (
          <Text style={styles.muted}>{t('now.empty')}</Text>
        )}
      </Card>

      {/* Up next */}
      <View style={styles.section}>
        <Sticker tone="coral" tilt={2}>
          {t('now.upNext')}
        </Sticker>
        {next.length ? (
          next.map((task, i) => <TaskRow key={task.id} title={task.title} minutes={task.estimatedMinutes} tilt={i + 1} />)
        ) : (
          <Text style={styles.muted}>{t('now.nothingQueued', { count: laterCount })}</Text>
        )}
      </View>

      <View style={styles.spacer} />

      <View style={styles.foot}>
        <Sticker tone="dark">{t('now.doneToday', { count: doneCount })}</Sticker>
        <Link href="/settings" asChild>
          <Pressable accessibilityRole="button" accessibilityLabel={t('now.settings')} style={styles.settings}>
            <Text style={styles.settingsText}>{t('now.settings')}</Text>
          </Pressable>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stickers: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  big: { gap: 6, marginTop: 6 },
  bigWord: {
    alignSelf: 'flex-start',
    fontFamily: fonts.display,
    fontSize: 38,
    lineHeight: 42,
    textTransform: 'uppercase',
    color: colors.ink,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  bigWord2: { marginStart: 40 },
  taskTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 24, lineHeight: 28 },
  muted: { color: colors.muted, fontFamily: fonts.body, fontSize: 15 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  btns: { flexDirection: 'row', gap: space.md, marginTop: 4 },
  section: { gap: space.sm },
  spacer: { flex: 1, minHeight: space.lg },
  foot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  settings: { height: 44, paddingHorizontal: 18, borderRadius: 999, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },
  settingsText: { fontFamily: fonts.display, fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.ink },
});
