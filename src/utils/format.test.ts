import { describe, it, expect } from 'vitest';
import { formatLongDate, formatShortDate, parseDate } from './format';

describe('parseDate', () => {
  it('treats date-only strings as local calendar dates', () => {
    const date = parseDate('2026-10-14');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(9);
    expect(date.getDate()).toBe(14);
  });
});

describe('formatShortDate', () => {
  const now = new Date(2026, 9, 21);

  it('omits the year within the current year', () => {
    expect(formatShortDate('2026-10-14', now)).toBe('Oct 14');
  });

  it('includes the year otherwise', () => {
    expect(formatShortDate('2025-03-02', now)).toBe('Mar 2, 2025');
  });

  it('returns an empty string for invalid input', () => {
    expect(formatShortDate('not a date', now)).toBe('');
  });
});

describe('formatLongDate', () => {
  it('always includes the year', () => {
    expect(formatLongDate('2026-10-14')).toBe('Oct 14, 2026');
  });
});
