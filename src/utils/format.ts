const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Date-only strings (YYYY-MM-DD) are calendar dates, not instants; parsing
 * them with `new Date()` treats them as UTC midnight and can shift the day.
 */
export function parseDate(value: string): Date {
  if (DATE_ONLY.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
}

/** "Oct 14" within the current year, "Oct 14, 2025" otherwise. */
export function formatShortDate(value: string, now: Date = new Date()): string {
  const date = parseDate(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
  });
}

export function formatLongDate(value: string): string {
  const date = parseDate(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(value: string): string {
  const date = parseDate(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
