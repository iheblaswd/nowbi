import { getDb, nowIso, uuid } from './database';

export type Bucket = 'now' | 'next' | 'later' | 'done';

export type Task = {
  id: string;
  title: string;
  bucket: Bucket;
  position: number;
  estimatedMinutes: number;
  steps: string[];
  stepIdx: number;
  completedAt: string | null;
};

type Row = {
  id: string;
  title: string;
  bucket: Bucket;
  position: number;
  estimated_minutes: number;
  steps_json: string;
  step_idx: number;
  completed_at: string | null;
};

const fromRow = (r: Row): Task => ({
  id: r.id,
  title: r.title,
  bucket: r.bucket,
  position: r.position,
  estimatedMinutes: r.estimated_minutes,
  steps: safeSteps(r.steps_json),
  stepIdx: r.step_idx,
  completedAt: r.completed_at,
});

function safeSteps(json: string): string[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.filter((s) => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

export async function listTasks(): Promise<Task[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Row>(
    'SELECT id, title, bucket, position, estimated_minutes, steps_json, step_idx, completed_at FROM tasks WHERE deleted_at IS NULL ORDER BY position ASC, created_at ASC',
  );
  return rows.map(fromRow);
}

export async function countTasks(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM tasks WHERE deleted_at IS NULL');
  return row?.n ?? 0;
}

export type NewTask = { title: string; estimatedMinutes?: number; steps?: string[]; bucket?: Bucket; source?: string };

export async function addTask(t: NewTask): Promise<Task> {
  const db = await getDb();
  const id = uuid();
  const ts = nowIso();
  const bucket = t.bucket ?? 'later';
  const pos = await nextPosition(bucket);
  await db.runAsync(
    'INSERT INTO tasks (id, title, bucket, position, estimated_minutes, steps_json, step_idx, source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?)',
    [id, t.title, bucket, pos, t.estimatedMinutes ?? 10, JSON.stringify(t.steps ?? []), t.source ?? 'text', ts, ts],
  );
  return { id, title: t.title, bucket, position: pos, estimatedMinutes: t.estimatedMinutes ?? 10, steps: t.steps ?? [], stepIdx: 0, completedAt: null };
}

async function nextPosition(bucket: Bucket): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ m: number | null }>('SELECT MAX(position) AS m FROM tasks WHERE bucket = ? AND deleted_at IS NULL', [bucket]);
  return (row?.m ?? -1) + 1;
}

export async function moveTask(id: string, bucket: Bucket): Promise<void> {
  const db = await getDb();
  const pos = await nextPosition(bucket);
  const completedAt = bucket === 'done' ? nowIso() : null;
  await db.runAsync('UPDATE tasks SET bucket = ?, position = ?, completed_at = ?, updated_at = ? WHERE id = ?', [bucket, pos, completedAt, nowIso(), id]);
}

/** Marks the current "now" task done. Never records a miss: there is no such state. */
export async function completeTask(id: string): Promise<void> {
  await moveTask(id, 'done');
}

/** "Not now": rolls the task to later, silently. */
export async function deferTask(id: string): Promise<void> {
  await moveTask(id, 'later');
}

/** Ensures exactly one task sits in "now": promotes the first "next" task when needed. */
export async function ensureNow(): Promise<void> {
  const db = await getDb();
  const now = await db.getFirstAsync<{ id: string }>("SELECT id FROM tasks WHERE bucket = 'now' AND deleted_at IS NULL LIMIT 1");
  if (now) return;
  const next = await db.getFirstAsync<{ id: string }>("SELECT id FROM tasks WHERE bucket = 'next' AND deleted_at IS NULL ORDER BY position ASC LIMIT 1");
  if (next) await moveTask(next.id, 'now');
}

export async function advanceStep(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE tasks SET step_idx = step_idx + 1, updated_at = ? WHERE id = ?', [nowIso(), id]);
}

export async function clearAllTasks(): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM tasks');
}

/** Demo rows so the first open shows what the app does. Labelled as examples in the UI. */
export async function seedIfEmpty(): Promise<void> {
  if ((await countTasks()) > 0) return;
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await addTask({ title: 'Write the intro of the sprint report', estimatedMinutes: 25, bucket: 'now', steps: ['Open last sprint doc', 'Outline the three results', 'Write 5 lines', 'Read once, send'] });
    await addTask({ title: 'Reply to Sara about the invoice', estimatedMinutes: 10, bucket: 'next' });
    await addTask({ title: 'Book the dentist', estimatedMinutes: 5, bucket: 'next' });
    await addTask({ title: 'Sort the doom pile on the desk', estimatedMinutes: 15, bucket: 'later' });
    await addTask({ title: 'Send Karim the API doc link', estimatedMinutes: 3, bucket: 'done' });
    await addTask({ title: 'Take the bins out', estimatedMinutes: 2, bucket: 'done' });
  });
  await db.runAsync("UPDATE tasks SET step_idx = 1 WHERE bucket = 'now'");
}
