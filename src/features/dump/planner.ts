/**
 * Rules-based brain-dump planner. Runs on the device, offline, in every language.
 * The AI planner (later) produces the same shape and falls back to this one.
 */
import type { Bucket } from '@/db/tasks';

export type ProposedTask = {
  title: string;
  estimatedMinutes: number;
  steps: string[];
  bucket: Bucket;
};

const SPLIT_RE = /\s*(?:\r?\n|[,;.!?]|\band then\b|\bthen\b|\band also\b|\balso\b|\bet puis\b|\bpuis\b|\bensuite\b|\bet aussi\b|\baussi\b|\bet\b|\band\b|وبعدين|وكمان|وأيضا|ثم|[،؛؟])\s*/i;

/** Leading filler people say before the actual task, in EN/FR/AR. */
const PREFIX_RE = new RegExp(
  '^(?:' +
    [
      'i need to',
      'i really need to',
      'i should really',
      'i should',
      'i have to',
      "i've got to",
      'i got to',
      'i gotta',
      'i must',
      'i want to',
      'i wanna',
      "don't forget to",
      'dont forget to',
      'remember to',
      'need to',
      'gotta',
      'maybe',
      'je dois',
      'il faut que je',
      'il faut',
      'faut que je',
      'faut',
      'je voudrais',
      'je veux',
      'penser à',
      'ne pas oublier de',
      'لازم',
      'يجب أن',
      'يجب',
      'ما ننساش',
      'ما ننسىش',
      'نحب',
      'بدي',
    ]
      .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|') +
    ')\\s+',
  'i',
);

const LONG_RE = /\b(report|write|essay|study|revise|design|code|build|refactor|clean|sort|organi[sz]e|prepare|plan|research|read|apply|tax|cv|resume|rapport|rédiger|écrire|étudier|ranger|nettoyer|préparer|أكتب|دراسة|نرتب|تقرير)\b/i;
const MEDIUM_RE = /\b(call|phone|reply|answer|email|mail|message|book|schedule|order|pay|invoice|appel|appeler|répondre|réserver|payer|facture|اتصل|نرد|نحجز|نخلص)\b/i;
const TINY_RE = /\b(buy|get|take out|send|text|ping|water|feed|acheter|prendre|envoyer|نشري|نبعث)\b/i;

/** Splits free text into candidate task titles. */
export function splitDump(text: string): string[] {
  return text
    .split(SPLIT_RE)
    .map((s) => s.trim())
    .map(cleanTitle)
    .filter((s) => s.length >= 3 && !/^(and|also|then|et|puis|و)$/i.test(s));
}

export function cleanTitle(raw: string): string {
  let s = raw.replace(/^[\s\-•*]+/, '').replace(PREFIX_RE, '').trim();
  s = s.replace(/\s+/g, ' ');
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Minutes guess from verbs; users adjust in the proposal. */
export function estimateMinutes(title: string): number {
  if (LONG_RE.test(title)) return 30;
  if (MEDIUM_RE.test(title)) return 10;
  if (TINY_RE.test(title)) return 5;
  return 10;
}

export type StepTemplates = { open: string; first: string; middle: string; finish: string };

/** Anything over 25 minutes gets four generic steps; the user edits them. */
export function stepsFor(minutes: number, tpl: StepTemplates): string[] {
  if (minutes <= 25) return [];
  return [tpl.open, tpl.first, tpl.middle, tpl.finish];
}

/**
 * Buckets in order: the first item becomes "now" unless something already is,
 * the next two "next", the rest "later". Keeps the day small on purpose.
 */
export function assignBuckets<T extends { bucket: Bucket }>(items: T[], hasCurrent: boolean, energy: 'low' | 'ok' | 'high' = 'ok'): T[] {
  const nextSlots = energy === 'low' ? 1 : energy === 'high' ? 3 : 2;
  let nowUsed = hasCurrent;
  let nextUsed = 0;
  return items.map((it) => {
    if (!nowUsed) {
      nowUsed = true;
      return { ...it, bucket: 'now' as Bucket };
    }
    if (nextUsed < nextSlots) {
      nextUsed++;
      return { ...it, bucket: 'next' as Bucket };
    }
    return { ...it, bucket: 'later' as Bucket };
  });
}

export function buildProposal(text: string, opts: { hasCurrent: boolean; energy?: 'low' | 'ok' | 'high'; steps: StepTemplates }): ProposedTask[] {
  const titles = splitDump(text);
  const items: ProposedTask[] = titles.map((title) => {
    const estimatedMinutes = estimateMinutes(title);
    return { title, estimatedMinutes, steps: stepsFor(estimatedMinutes, opts.steps), bucket: 'later' };
  });
  return assignBuckets(items, opts.hasCurrent, opts.energy ?? 'ok');
}

/** Moves an item and re-buckets the list so order always equals priority. */
export function moveProposal(list: ProposedTask[], from: number, to: number, hasCurrent: boolean, energy?: 'low' | 'ok' | 'high'): ProposedTask[] {
  if (to < 0 || to >= list.length || from === to) return list;
  const copy = list.slice();
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return assignBuckets(copy, hasCurrent, energy ?? 'ok');
}
