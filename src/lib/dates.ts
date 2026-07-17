// Tiny date helpers for the Gantt axis — no date library, local time.

const MS_PER_DAY = 86_400_000;

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const WEEKDAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"];

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, n: number): Date {
  if (!(d instanceof Date) || isNaN(d.getTime())) {
    throw new Error("addDays: invalid date");
  }
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

// Whole days between two dates (rounded to day boundaries).
export function diffDays(a: Date, b: Date): number {
  if (!(a instanceof Date) || isNaN(a.getTime())) {
    throw new Error("diffDays: invalid date (a)");
  }
  if (!(b instanceof Date) || isNaN(b.getTime())) {
    throw new Error("diffDays: invalid date (b)");
  }
  return Math.round(
    (startOfDay(b).getTime() - startOfDay(a).getTime()) / MS_PER_DAY
  );
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

// Two-line day header: bottom = day-of-month; top = the 3-letter month
// abbreviation on the 1st, otherwise the single-letter weekday.
export function formatDayHeader(d: Date): { top: string; bottom: string } {
  const dom = d.getDate();
  const top = dom === 1 ? MONTHS[d.getMonth()] : WEEKDAY_INITIALS[d.getDay()];
  return { top, bottom: String(dom) };
}

// Compact relative time: "just now", "5m ago", "2h ago", "3d ago", "2mo ago", "1y ago".
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (!iso || isNaN(then)) throw new Error("relativeTime: invalid date");
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

// Whole days elapsed since the given date (never negative).
export function daysSince(iso: string): number {
  const d = new Date(iso);
  if (!iso || isNaN(d.getTime())) throw new Error("daysSince: invalid date");
  return Math.max(0, diffDays(d, new Date()));
}

// "8 Jul" — UTC getters to match the table's date formatting of the ISO data.
export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (!iso || isNaN(d.getTime())) throw new Error("formatShortDate: invalid date");
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}
