import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/Screen';
import { Sticker } from '@/components/Sticker';
import { Button } from '@/components/Button';
import { addTask, listTasks, moveTask } from '@/db/tasks';
import { getTodayPlan, Energy } from '@/db/plans';
import { assignBuckets, buildProposal, moveProposal, ProposedTask } from '@/features/dump/planner';
import { colors, fonts, radius, space } from '@/theme/tokens';

type Ctx = { hasCurrent: boolean; currentId: string | null; energy: Energy };

export default function DumpScreen() {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [proposal, setProposal] = useState<ProposedTask[] | null>(null);
  const [ctx, setCtx] = useState<Ctx>({ hasCurrent: false, currentId: null, energy: 'ok' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([listTasks(), getTodayPlan()]).then(([tasks, plan]) => {
      const cur = tasks.find((x) => x.bucket === 'now');
      setCtx({ hasCurrent: !!cur, currentId: cur?.id ?? null, energy: plan.energy });
    });
  }, []);

  const stepTemplates = {
    open: t('dump.steps.open'),
    first: t('dump.steps.first'),
    middle: t('dump.steps.middle'),
    finish: t('dump.steps.finish'),
  };

  const makePlan = useCallback(() => {
    const p = buildProposal(text, { hasCurrent: ctx.hasCurrent, energy: ctx.energy, steps: stepTemplates });
    setProposal(p);
  }, [text, ctx, stepTemplates]);

  const move = (from: number, to: number) => {
    if (!proposal) return;
    setProposal(moveProposal(proposal, from, to, ctx.hasCurrent, ctx.energy));
  };

  const remove = (i: number) => {
    if (!proposal) return;
    setProposal(assignBuckets(proposal.filter((_, idx) => idx !== i), ctx.hasCurrent, ctx.energy));
  };

  const confirm = async () => {
    if (!proposal || saving) return;
    setSaving(true);
    for (const p of proposal) {
      await addTask({ title: p.title, estimatedMinutes: p.estimatedMinutes, steps: p.steps, bucket: p.bucket, source: 'dump' });
    }
    // If the dump produced a new "now" while one existed, the old one waits in next.
    if (ctx.hasCurrent && ctx.currentId && proposal.some((p) => p.bucket === 'now')) {
      await moveTask(ctx.currentId, 'next');
    }
    setSaving(false);
    router.replace('/');
  };

  if (proposal) {
    const empty = proposal.length === 0;
    return (
      <Screen>
        <View style={styles.head}>
          <Button label={t('dump.edit')} onPress={() => setProposal(null)} variant="dark" size="sm" />
          <Sticker tone="pink" tilt={1}>
            {t('dump.proposal')}
          </Sticker>
        </View>
        <Text style={styles.title}>{empty ? t('dump.nothingFound') : t('dump.proposalTitle', { count: proposal.length })}</Text>
        <Text style={styles.hint}>{t('dump.proposalHint')}</Text>

        <View style={styles.list}>
          {proposal.map((p, i) => (
            <View key={`${p.title}-${i}`} style={styles.item}>
              <View style={styles.itemTop}>
                <View style={styles.itemText}>
                  <Text style={styles.itemTitle}>{p.title}</Text>
                  <View style={styles.itemMeta}>
                    <Sticker tone={p.bucket === 'now' ? 'yellow' : p.bucket === 'next' ? 'blue' : 'dark'} size="sm">
                      {t(`bucket.${p.bucket}`)}
                    </Sticker>
                    <Text style={styles.metaText}>{t('now.minutes', { count: p.estimatedMinutes })}</Text>
                  </View>
                </View>
                <View style={styles.arrows}>
                  <IconBtn label="↑" a11y={t('dump.moveUp')} onPress={() => move(i, i - 1)} disabled={i === 0} />
                  <IconBtn label="↓" a11y={t('dump.moveDown')} onPress={() => move(i, i + 1)} disabled={i === proposal.length - 1} />
                  <IconBtn label="×" a11y={t('dump.remove')} onPress={() => remove(i)} />
                </View>
              </View>
              {p.steps.length > 0 && (
                <View style={styles.steps}>
                  {p.steps.map((s, j) => (
                    <View key={j} style={styles.step}>
                      <Text style={styles.stepN}>{j + 1}</Text>
                      <Text style={styles.stepText}>{s}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.spacer} />
        <View style={styles.btns}>
          <Button label={t('dump.confirm')} onPress={confirm} disabled={empty || saving} />
          <Button label={t('dump.startOver')} onPress={() => { setProposal(null); setText(''); }} variant="outline" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.head}>
        <Button label={t('settings.back')} onPress={() => router.back()} variant="dark" size="sm" />
        <Sticker tone="yellow" tilt={1}>
          {t('dump.title')}
        </Sticker>
      </View>
      <Text style={styles.title}>{t('dump.prompt')}</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={t('dump.placeholder')}
        placeholderTextColor={colors.dim}
        multiline
        textAlignVertical="top"
        autoFocus
        style={styles.input}
        accessibilityLabel={t('dump.title')}
      />
      <Text style={styles.hint}>{t('dump.privacy')}</Text>
      <View style={styles.spacer} />
      <Button label={t('dump.makePlan')} onPress={makePlan} disabled={text.trim().length < 3} />
    </Screen>
  );
}

function IconBtn({ label, a11y, onPress, disabled }: { label: string; a11y: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      style={({ pressed }) => [styles.iconBtn, disabled && { opacity: 0.3 }, pressed && { opacity: 0.7 }]}
    >
      <Text style={styles.iconText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.text, fontFamily: fonts.display, fontSize: 24, lineHeight: 28 },
  hint: { color: colors.dim, fontFamily: fonts.body, fontSize: 13 },
  input: {
    minHeight: 180,
    borderWidth: 2,
    borderColor: colors.line,
    borderRadius: radius.row,
    backgroundColor: colors.surface,
    color: colors.text,
    padding: space.lg,
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 24,
  },
  list: { gap: space.sm },
  item: { padding: space.lg, borderRadius: radius.row, backgroundColor: colors.surface, gap: space.sm },
  itemTop: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  itemText: { flex: 1, gap: 6 },
  itemTitle: { color: colors.text, fontFamily: fonts.bodyExtra, fontSize: 16 },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  metaText: { color: colors.muted, fontFamily: fonts.body, fontSize: 13 },
  arrows: { flexDirection: 'row', gap: 6 },
  iconBtn: { width: 38, height: 38, borderRadius: radius.pill, borderWidth: 2, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  iconText: { color: colors.text, fontFamily: fonts.bodyExtra, fontSize: 18, lineHeight: 20 },
  steps: { gap: 6 },
  step: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: 8, paddingHorizontal: space.md, borderRadius: 12, backgroundColor: colors.surface2 },
  stepN: { color: colors.yellow, fontFamily: fonts.display, fontSize: 11 },
  stepText: { flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: 14 },
  spacer: { flex: 1, minHeight: space.lg },
  btns: { gap: space.sm },
});
