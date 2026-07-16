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
