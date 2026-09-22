import { useCallback, useEffect, useState } from 'react';
import { completeTask, deferTask, ensureNow, listTasks, seedIfEmpty, Task } from '@/db/tasks';
import { confirmMeds, getTodayPlan, Plan } from '@/db/plans';

export type NowState = {
  loading: boolean;
  current: Task | null;
  next: Task[];
  laterCount: number;
  doneCount: number;
  plan: Plan | null;
};

/** Everything the Now screen shows, plus the two actions that never shame. */
export function useNow() {
  const [state, setState] = useState<NowState>({ loading: true, current: null, next: [], laterCount: 0, doneCount: 0, plan: null });

  const refresh = useCallback(async () => {
    await ensureNow();
    const [tasks, plan] = await Promise.all([listTasks(), getTodayPlan()]);
    setState({
      loading: false,
      current: tasks.find((t) => t.bucket === 'now') ?? null,
      next: tasks.filter((t) => t.bucket === 'next').slice(0, 2),
      laterCount: tasks.filter((t) => t.bucket === 'later').length,
      doneCount: tasks.filter((t) => t.bucket === 'done').length,
      plan,
    });
  }, []);

  useEffect(() => {
    seedIfEmpty().then(refresh);
  }, [refresh]);

  const done = useCallback(async () => {
    if (!state.current) return;
    await completeTask(state.current.id);
    await refresh();
  }, [state.current, refresh]);

  const notNow = useCallback(async () => {
    if (!state.current) return;
    await deferTask(state.current.id);
    await refresh();
  }, [state.current, refresh]);

  const meds = useCallback(async () => {
    await confirmMeds();
    await refresh();
  }, [refresh]);

  return { ...state, refresh, done, notNow, meds };
}
