"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDurationToTime = exports.buildLabeledTimeline = exports.subtractIntervals = exports.mergeIntervals = exports.dayBounds = exports.dateKey = exports.fromMinutes = exports.doTimesOverlap = exports.isTimeGreater = exports.toMinutes = void 0;
exports.normalizeDay = normalizeDay;
const toMinutes = (t) => {
    if (t === '24:00')
        return 1440;
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
};
exports.toMinutes = toMinutes;
const isTimeGreater = (t1, t2) => {
    const time1 = (0, exports.toMinutes)(t1);
    const time2 = (0, exports.toMinutes)(t2);
    return time1 > time2;
};
exports.isTimeGreater = isTimeGreater;
const doTimesOverlap = (startA, endA, startB, endB) => {
    const aStart = (0, exports.toMinutes)(startA);
    const aEnd = (0, exports.toMinutes)(endA);
    const bStart = (0, exports.toMinutes)(startB);
    const bEnd = (0, exports.toMinutes)(endB);
    return aStart < bEnd && aEnd > bStart;
};
exports.doTimesOverlap = doTimesOverlap;
const fromMinutes = (n) => {
    if (n <= 0)
        return '00:00';
    if (n >= 1440)
        return '24:00';
    const h = Math.floor(n / 60)
        .toString()
        .padStart(2, '0');
    const m = (n % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
};
exports.fromMinutes = fromMinutes;
const dateKey = (d) => {
    const dd = new Date(d);
    dd.setHours(0, 0, 0, 0);
    const y = dd.getFullYear();
    const m = (dd.getMonth() + 1).toString().padStart(2, '0');
    const da = dd.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${da}`;
};
exports.dateKey = dateKey;
const dayBounds = (d) => {
    const s = new Date(d);
    s.setHours(0, 0, 0, 0);
    const e = new Date(s);
    e.setDate(e.getDate() + 1);
    return { start: s, end: e };
};
exports.dayBounds = dayBounds;
const mergeIntervals = (arr) => {
    if (!arr.length)
        return [];
    const sorted = [...arr].sort((a, b) => a.start - b.start);
    return sorted.reduce((acc, curr) => {
        if (!acc.length || curr.start > acc[acc.length - 1].end) {
            return [...acc, Object.assign({}, curr)];
        }
        const last = acc[acc.length - 1];
        last.end = Math.max(last.end, curr.end);
        return acc;
    }, []);
};
exports.mergeIntervals = mergeIntervals;
const subtractIntervals = (base, cuts) => {
    const initial = (0, exports.mergeIntervals)(base);
    const mergedCuts = (0, exports.mergeIntervals)(cuts);
    const result = mergedCuts.reduce((res, cut) => res.flatMap((b) => {
        if (cut.end <= b.start || cut.start >= b.end) {
            return [b];
        }
        const parts = [];
        if (cut.start > b.start) {
            parts.push({ start: b.start, end: Math.min(cut.start, b.end) });
        }
        if (cut.end < b.end) {
            parts.push({ start: Math.max(cut.end, b.start), end: b.end });
        }
        return parts;
    }), initial);
    return (0, exports.mergeIntervals)(result);
};
exports.subtractIntervals = subtractIntervals;
const buildLabeledTimeline = (available, breaks, booked) => {
    const points = new Set([0, 1440]);
    [...available, ...breaks, ...booked].forEach((v) => {
        points.add(v.start);
        points.add(v.end);
    });
    const xs = [...points].sort((a, b) => a - b);
    const contains = (iv, s, e) => iv.some((v) => s < v.end && e > v.start);
    const raw = xs
        .slice(0, -1)
        .map((s, i) => {
        const e = xs[i + 1];
        if (e <= s)
            return null;
        let status = 'unavailable';
        if (contains(booked, s, e))
            status = 'booked';
        else if (contains(breaks, s, e))
            status = 'break';
        else if (contains(available, s, e))
            status = 'available';
        return { start: s, end: e, status };
    })
        .filter(Boolean);
    return raw.reduce((acc, seg) => {
        const last = acc[acc.length - 1];
        if (last && last.status === seg.status && last.end === seg.start) {
            last.end = seg.end;
            return acc;
        }
        return [...acc, Object.assign({}, seg)];
    }, []);
};
exports.buildLabeledTimeline = buildLabeledTimeline;
const addDurationToTime = (startTime, durationHours) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const addedMinutes = durationHours * 60;
    startDate.setMinutes(startDate.getMinutes() + addedMinutes);
    const endH = String(startDate.getHours()).padStart(2, '0');
    const endM = String(startDate.getMinutes()).padStart(2, '0');
    return `${endH}:${endM}`;
};
exports.addDurationToTime = addDurationToTime;
function normalizeDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}
