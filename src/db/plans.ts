import { getDb, nowIso, todayKey } from './database';

export type Energy = 'low' | 'ok' | 'high';
export type Plan = { date: string; energy: Energy; medsConfirmedAt: string | null };

export async function getTodayPlan(): Promise<Plan> {
  const db = await getDb();
  const date = todayKey();
  const row = await db.getFirstAsync<{ date: string; energy: Energy; meds_confirmed_at: string | null }>(
    'SELECT date, energy, meds_confirmed_at FROM plans WHERE date = ?',
    [date],
  );
  if (row) return { date: row.date, energy: row.energy, medsConfirmedAt: row.meds_confirmed_at };
  await db.runAsync('INSERT INTO plans (date, energy, updated_at) VALUES (?, ?, ?)', [date, 'ok', nowIso()]);
  return { date, energy: 'ok', medsConfirmedAt: null };
}

export async function setEnergy(energy: Energy): Promise<void> {
  const db = await getDb();
  await getTodayPlan();
  await db.runAsync('UPDATE plans SET energy = ?, updated_at = ? WHERE date = ?', [energy, nowIso(), todayKey()]);
}

export async function confirmMeds(): Promise<string> {
  const db = await getDb();
  await getTodayPlan();
  const ts = nowIso();
  await db.runAsync('UPDATE plans SET meds_confirmed_at = ?, updated_at = ? WHERE date = ?', [ts, ts, todayKey()]);
  return ts;
}
