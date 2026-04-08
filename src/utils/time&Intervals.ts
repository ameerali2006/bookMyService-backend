export type Interval = { start: number; end: number };
export type LabeledStatus = 'available' | 'break' | 'booked' | 'unavailable';

export const toMinutes = (t: string): number => {
  if (t === '24:00') return 1440;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
export const isTimeGreater = (t1: string, t2: string): boolean => {
  const time1 = toMinutes(t1);
  const time2 = toMinutes(t2);
  return time1 > time2;
};
export const doTimesOverlap = (
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean => {
  const aStart = toMinutes(startA);
  const aEnd = toMinutes(endA);
  const bStart = toMinutes(startB);
  const bEnd = toMinutes(endB);
  return aStart < bEnd && aEnd > bStart;
};
export const fromMinutes = (n: number): string => {
  if (n <= 0) return '00:00';
  if (n >= 1440) return '24:00';
  const h = Math.floor(n / 60)
    .toString()
    .padStart(2, '0');
  const m = (n % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

export const dateKey = (d: Date): string => {
  const dd = new Date(d);
  dd.setHours(0, 0, 0, 0);
  const y = dd.getFullYear();
  const m = (dd.getMonth() + 1).toString().padStart(2, '0');
  const da = dd.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${da}`;
};

export const dayBounds = (d: Date): { start: Date; end: Date } => {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  const e = new Date(s);
  e.setDate(e.getDate() + 1);
  return { start: s, end: e };
};

export const mergeIntervals = (arr: Interval[]): Interval[] => {
  if (!arr.length) return [];

  const sorted = [...arr].sort((a, b) => a.start - b.start);

  return sorted.reduce<Interval[]>((acc, curr) => {
    if (!acc.length || curr.start > acc[acc.length - 1].end) {
      return [...acc, { ...curr }];
    }

    const last = acc[acc.length - 1];
    last.end = Math.max(last.end, curr.end);
    return acc;
  }, []);
};

export const subtractIntervals = (
  base: Interval[],
  cuts: Interval[],
): Interval[] => {
  const initial = mergeIntervals(base);
  const mergedCuts = mergeIntervals(cuts);

  const result = mergedCuts.reduce<Interval[]>((res, cut) => res.flatMap((b) => {
    if (cut.end <= b.start || cut.start >= b.end) {
      return [b];
    }

    const parts: Interval[] = [];

    if (cut.start > b.start) {
      parts.push({ start: b.start, end: Math.min(cut.start, b.end) });
    }

    if (cut.end < b.end) {
      parts.push({ start: Math.max(cut.end, b.start), end: b.end });
    }

    return parts;
  }), initial);

  return mergeIntervals(result);
};

export const buildLabeledTimeline = (
  available: Interval[],
  breaks: Interval[],
  booked: Interval[],
): Array<{ start: number; end: number; status: LabeledStatus }> => {
  const points = new Set<number>([0, 1440]);

  [...available, ...breaks, ...booked].forEach((v) => {
    points.add(v.start);
    points.add(v.end);
  });

  const xs = [...points].sort((a, b) => a - b);

  const contains = (iv: Interval[], s: number, e: number) => iv.some((v) => s < v.end && e > v.start);

  const raw = xs
    .slice(0, -1)
    .map((s, i) => {
      const e = xs[i + 1];
      if (e <= s) return null;

      let status: LabeledStatus = 'unavailable';

      if (contains(booked, s, e)) status = 'booked';
      else if (contains(breaks, s, e)) status = 'break';
      else if (contains(available, s, e)) status = 'available';

      return { start: s, end: e, status };
    })
    .filter(Boolean) as Array<{
    start: number;
    end: number;
    status: LabeledStatus;
  }>;

  return raw.reduce<typeof raw>((acc, seg) => {
    const last = acc[acc.length - 1];

    if (last && last.status === seg.status && last.end === seg.start) {
      last.end = seg.end;
      return acc;
    }

    return [...acc, { ...seg }];
  }, []);
};
export const addDurationToTime = (
  startTime: string,
  durationHours: number,
): string => {
  const [hours, minutes] = startTime.split(':').map(Number);

  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);

  const addedMinutes = durationHours * 60;
  startDate.setMinutes(startDate.getMinutes() + addedMinutes);

  const endH = String(startDate.getHours()).padStart(2, '0');
  const endM = String(startDate.getMinutes()).padStart(2, '0');

  return `${endH}:${endM}`;
};

export function normalizeDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
