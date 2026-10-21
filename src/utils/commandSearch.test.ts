import { describe, it, expect } from 'vitest';
import { fuzzyScore, rankCommands } from './commandSearch';

const items = [
  { label: 'New application' },
  { label: 'Staff Software Engineer, Platform', keywords: 'Northwind' },
  { label: 'Senior Frontend Engineer', keywords: 'Globex' },
  { label: 'Toggle theme' },
];

const labels = (list: { label: string }[]) => list.map((i) => i.label);

describe('fuzzyScore', () => {
  it('scores everything 0 for an empty query', () => {
    expect(fuzzyScore(items[0], '  ')).toBe(0);
  });

  it('returns null when characters are missing', () => {
    expect(fuzzyScore(items[0], 'xyz')).toBeNull();
  });

  it('prefers substrings at word starts', () => {
    expect(fuzzyScore({ label: 'Toggle theme' }, 'theme')!).toBeGreaterThan(
      fuzzyScore({ label: 'Toggletheme' }, 'theme')!
    );
  });
});

describe('rankCommands', () => {
  it('keeps the original order for an empty query', () => {
    expect(rankCommands(items, '')).toEqual(items);
  });

  it('matches against keywords such as company names', () => {
    expect(labels(rankCommands(items, 'globex'))).toEqual([
      'Senior Frontend Engineer',
    ]);
  });

  it('supports abbreviations across words and keywords', () => {
    expect(labels(rankCommands(items, 'eng north'))).toEqual([
      'Staff Software Engineer, Platform',
    ]);
  });

  it('ranks label substrings above scattered matches', () => {
    expect(labels(rankCommands(items, 'engineer'))[0]).toMatch(/Engineer/);
    expect(labels(rankCommands(items, 'theme'))).toEqual(['Toggle theme']);
  });
});
