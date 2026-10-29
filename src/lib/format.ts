const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2025-07-01" -> "Jul 2025" (no timezone shifts). */
export function formatMonthYear(iso: string): string {
  const [year, month] = iso.split('-');
  const idx = Number(month) - 1;
  return MONTHS[idx] ? `${MONTHS[idx]} ${year}` : iso;
}

export function formatRange(start: string, end: string | null, current: boolean): string {
  const to = current ? 'Present' : end ? formatMonthYear(end) : '';
  return to ? `${formatMonthYear(start)} – ${to}` : formatMonthYear(start);
}

/** Whole-month difference rendered like "1 yr 9 mos". */
export function formatDuration(start: string, end: string | null, current: boolean): string {
  const s = new Date(`${start}T00:00:00`);
  const e = current || !end ? new Date() : new Date(`${end}T00:00:00`);
  let months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1;
  if (months < 1) months = 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts: string[] = [];
  if (years) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
  if (rest) parts.push(`${rest} mo${rest > 1 ? 's' : ''}`);
  return parts.join(' ');
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31536000],
  ['month', 2592000],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
];

export function timeAgo(iso: string): string {
  const seconds = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  for (const [unit, size] of UNITS) {
    if (seconds >= size) return formatter.format(-Math.round(seconds / size), unit);
  }
  return formatter.format(-seconds, 'second');
}
