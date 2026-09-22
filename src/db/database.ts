import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const SCHEMA_VERSION = 1;

/**
 * Single shared connection. Local-first: every screen reads and writes here,
 * sync (later) only pushes rows by updated_at.
 */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('nowbi.db').then(async (db) => {
      await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
      await migrate(db);
      return db;
    });
  }
  return dbPromise;
}

async function migrate(db: SQLite.SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;
  if (current >= SCHEMA_VERSION) return;

  if (current < 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        bucket TEXT NOT NULL CHECK (bucket IN ('now','next','later','done')),
        position INTEGER NOT NULL DEFAULT 0,
        estimated_minutes INTEGER NOT NULL DEFAULT 10,
        actual_minutes INTEGER,
        steps_json TEXT NOT NULL DEFAULT '[]',
        step_idx INTEGER NOT NULL DEFAULT 0,
        source TEXT NOT NULL DEFAULT 'text',
        scheduled_for TEXT,
        completed_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_tasks_bucket ON tasks (bucket, position);

      CREATE TABLE IF NOT EXISTS plans (
        date TEXT PRIMARY KEY NOT NULL,
        energy TEXT NOT NULL DEFAULT 'ok' CHECK (energy IN ('low','ok','high')),
        meds_confirmed_at TEXT,
        recap_seen_at TEXT,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  }

  await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
}

export const nowIso = () => new Date().toISOString();

/** UUID v4 without a native dependency; good enough for local ids. */
export function uuid(): string {
  const hex = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) out += '-';
    else if (i === 14) out += '4';
    else if (i === 19) out += hex[(Math.random() * 4) | 8];
    else out += hex[(Math.random() * 16) | 0];
  }
  return out;
}

export const todayKey = () => new Date().toISOString().slice(0, 10);
