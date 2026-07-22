const { expandToBuckets, rangesOverlap, applyBuffer } = require('../../src/utils/timeSlots');

describe('expandToBuckets', () => {
  it('splits a range into equal-width buckets, dropping a trailing partial bucket', () => {
    const start = new Date('2026-07-27T09:00:00.000Z');
    const end = new Date('2026-07-27T10:00:00.000Z');
    const buckets = expandToBuckets(start, end, 30);
    expect(buckets).toEqual([
      new Date('2026-07-27T09:00:00.000Z'),
      new Date('2026-07-27T09:30:00.000Z')
    ]);
  });

  it('drops a trailing partial bucket that would overrun the end', () => {
    const start = new Date('2026-07-27T09:00:00.000Z');
    const end = new Date('2026-07-27T09:50:00.000Z');
    const buckets = expandToBuckets(start, end, 30);
    expect(buckets).toEqual([new Date('2026-07-27T09:00:00.000Z')]);
  });

  it('returns an empty array when the range is shorter than one bucket', () => {
    const start = new Date('2026-07-27T09:00:00.000Z');
    const end = new Date('2026-07-27T09:10:00.000Z');
    expect(expandToBuckets(start, end, 30)).toEqual([]);
  });
});

describe('rangesOverlap', () => {
  it('detects overlapping ranges', () => {
    const a = [new Date('2026-07-27T09:00:00.000Z'), new Date('2026-07-27T10:00:00.000Z')];
    const b = [new Date('2026-07-27T09:30:00.000Z'), new Date('2026-07-27T10:30:00.000Z')];
    expect(rangesOverlap(a[0], a[1], b[0], b[1])).toBe(true);
  });

  it('treats back-to-back ranges as non-overlapping', () => {
    const a = [new Date('2026-07-27T09:00:00.000Z'), new Date('2026-07-27T10:00:00.000Z')];
    const b = [new Date('2026-07-27T10:00:00.000Z'), new Date('2026-07-27T11:00:00.000Z')];
    expect(rangesOverlap(a[0], a[1], b[0], b[1])).toBe(false);
  });
});

describe('applyBuffer', () => {
  it('widens a booking range by the configured buffers', () => {
    const start = new Date('2026-07-27T09:00:00.000Z');
    const end = new Date('2026-07-27T09:30:00.000Z');
    const widened = applyBuffer(start, end, 10, 5);
    expect(widened.start).toEqual(new Date('2026-07-27T08:50:00.000Z'));
    expect(widened.end).toEqual(new Date('2026-07-27T09:35:00.000Z'));
  });
});
