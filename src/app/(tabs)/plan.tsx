import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/Screen';
import { Sticker } from '@/components/Sticker';
import { Bucket, listTasks, moveTask, Task } from '@/db/tasks';
import { colors, fonts, radius, space } from '@/theme/tokens';

const ORDER: Bucket[] = ['now', 'next', 'later', 'done'];
const TONE: Record<Bucket, 'yellow' | 'blue' | 'dark' | 'green'> = { now: 'yellow', next: 'blue', later: 'dark', done: 'green' };

export default function PlanScreen() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);

  const refresh = useCallback(() => {
    listTasks().then(setTasks);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const move = async (task: Task, to: Bucket) => {
    if (to === 'now') {
      const cur = tasks.find((x) => x.bucket === 'now');
      if (cur && cur.id !== task.id) await moveTask(cur.id, 'next');
    }
    await moveTask(task.id, to);
    refresh();
  };

  const by = (b: Bucket) => tasks.filter((x) => x.bucket === b);
  const waiting = by('next').length + by('later').length;

  return (
    <Screen>
      <View style={styles.big}>
        <Text style={[styles.bigWord, { backgroundColor: colors.blue, transform: [{ rotate: '-3deg' }] }]}>{t('plan.title')}</Text>
      </View>
      <View style={styles.summary}>
        <Text style={styles.hint}>{t('plan.summary', { done: by('done').length, waiting })}</Text>
        <Link href="/dump" asChild>
          <Pressable accessibilityRole="button" style={styles.dumpBtn}>
            <Text style={styles.dumpText}>+ {t('now.dump')}</Text>
          </Pressable>
        </Link>
      </View>

      {ORDER.map((bucket, bi) => (
        <View key={bucket} style={styles.col}>
          <Sticker tone={TONE[bucket]} tilt={bi}>
            {t(`bucket.${bucket}`)}
          </Sticker>
          {by(bucket).length === 0 ? (
            <Text style={styles.empty}>{t('plan.empty')}</Text>
          ) : (
            by(bucket).map((task) => (
              <View key={task.id} style={styles.row}>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, bucket === 'done' && styles.done]} numberOfLines={2}>
                    {task.title}
                  </Text>
                  <Text style={styles.rowMeta}>
                    {t('now.minutes', { count: task.estimatedMinutes })}
                    {task.steps.length ? ` · ${t('plan.steps', { count: task.steps.length })}` : ''}
                  </Text>
                </View>
                <View style={styles.actions}>
                  {bucket !== 'now' && <Chip label={t('bucket.now')} onPress={() => move(task, 'now')} />}
                  {bucket === 'later' && <Chip label={t('bucket.next')} onPress={() => move(task, 'next')} />}
                  {bucket !== 'later' && bucket !== 'done' && <Chip label={t('bucket.later')} onPress={() => move(task, 'later')} />}
                  {bucket !== 'done' && <Chip label={t('now.done')} onPress={() => move(task, 'done')} />}
                </View>
              </View>
            ))
          )}
        </View>
      ))}
      <Text style={styles.hint}>{t('plan.noShame')}</Text>
    </Screen>
  );
}

function Chip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.chip, pressed && { opacity: 0.7 }]}>
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  big: { marginTop: 6 },
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
  summary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  hint: { flex: 1, color: colors.muted, fontFamily: fonts.body, fontSize: 13 },
  dumpBtn: { height: 42, paddingHorizontal: 16, borderRadius: radius.pill, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  dumpText: { color: colors.text, fontFamily: fonts.display, fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase' },
  col: { gap: space.sm },
  empty: { color: colors.dim, fontFamily: fonts.body, fontSize: 13, paddingHorizontal: 4 },
  row: { padding: space.md, borderRadius: radius.row, backgroundColor: colors.surface, gap: space.sm },
  rowText: { gap: 2 },
  rowTitle: { color: colors.text, fontFamily: fonts.bodyExtra, fontSize: 16 },
  done: { textDecorationLine: 'line-through', color: colors.muted },
  rowMeta: { color: colors.muted, fontFamily: fonts.body, fontSize: 13 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { height: 34, paddingHorizontal: 12, borderRadius: radius.pill, borderWidth: 2, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  chipText: { color: colors.text, fontFamily: fonts.display, fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase' },
});
