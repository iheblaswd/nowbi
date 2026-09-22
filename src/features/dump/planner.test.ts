import { assignBuckets, buildProposal, cleanTitle, estimateMinutes, moveProposal, splitDump } from './planner';

const tpl = { open: 'Open what you need', first: 'Smallest first piece', middle: 'The middle', finish: 'Finish and close' };

describe('splitDump', () => {
  it('splits on commas, periods, newlines and connector words', () => {
    const out = splitDump('I need to finish the sprint report, call the dentist and Sara is waiting for the invoice answer. Also buy milk');
    expect(out).toEqual(['Finish the sprint report', 'Call the dentist', 'Sara is waiting for the invoice answer', 'Buy milk']);
  });

  it('drops empty and tiny fragments', () => {
    expect(splitDump('ok. , and\n\n  ')).toEqual([]);
  });

  it('handles French and Arabic fillers', () => {
    expect(splitDump('je dois appeler le dentiste, puis il faut payer la facture')).toEqual(['Appeler le dentiste', 'Payer la facture']);
    expect(splitDump('لازم نخلص الفاتورة، وبعدين نحجز الطبيب')).toEqual([
      'نخلص الفاتورة',
      'نحجز الطبيب',
    ]);
  });
});

describe('cleanTitle', () => {
  it('strips leading filler and capitalises', () => {
    expect(cleanTitle("don't forget to water the plant")).toBe('Water the plant');
    expect(cleanTitle('- buy milk')).toBe('Buy milk');
  });
});

describe('estimateMinutes', () => {
  it('guesses by verb', () => {
    expect(estimateMinutes('Write the sprint report')).toBe(30);
    expect(estimateMinutes('Call the dentist')).toBe(10);
    expect(estimateMinutes('Buy milk')).toBe(5);
    expect(estimateMinutes('Something else')).toBe(10);
  });
});

describe('assignBuckets', () => {
  const items = ['a', 'b', 'c', 'd', 'e'].map((title) => ({ title, bucket: 'later' as const }));

  it('first becomes now when nothing is current, then two next, rest later', () => {
    expect(assignBuckets(items, false).map((i) => i.bucket)).toEqual(['now', 'next', 'next', 'later', 'later']);
  });

  it('keeps the existing now task and only fills next', () => {
    expect(assignBuckets(items, true).map((i) => i.bucket)).toEqual(['next', 'next', 'later', 'later', 'later']);
  });

  it('low energy queues a single next task', () => {
    expect(assignBuckets(items, false, 'low').map((i) => i.bucket)).toEqual(['now', 'next', 'later', 'later', 'later']);
  });
});

describe('buildProposal and moveProposal', () => {
  it('adds steps to long tasks and re-buckets after a move', () => {
    const p = buildProposal('write the report, buy milk', { hasCurrent: false, steps: tpl });
    expect(p[0]).toMatchObject({ title: 'Write the report', estimatedMinutes: 30, bucket: 'now' });
    expect(p[0].steps).toHaveLength(4);
    expect(p[1]).toMatchObject({ title: 'Buy milk', estimatedMinutes: 5, bucket: 'next', steps: [] });

    const moved = moveProposal(p, 1, 0, false);
    expect(moved.map((i) => i.title)).toEqual(['Buy milk', 'Write the report']);
    expect(moved.map((i) => i.bucket)).toEqual(['now', 'next']);
  });
});
