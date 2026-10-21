export type Searchable = {
  label: string;
  keywords?: string;
};

const WORD_BOUNDARY = /[\s,\-/·]/;

/**
 * Higher is better; null means no match. Exact substrings in the label rank
 * first, then in-order character matches that favour runs and word starts.
 */
export function fuzzyScore(item: Searchable, query: string): number | null {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const label = item.label.toLowerCase();
  const labelIndex = label.indexOf(q);
  if (labelIndex !== -1) {
    const atWordStart =
      labelIndex === 0 || WORD_BOUNDARY.test(label[labelIndex - 1]);
    return 1000 + (atWordStart ? 200 : 0) - labelIndex;
  }

  const haystack = `${label} ${item.keywords?.toLowerCase() ?? ''}`;
  let score = 0;
  let from = 0;
  let previous = -2;
  for (const ch of q) {
    if (ch === ' ') continue;
    const found = haystack.indexOf(ch, from);
    if (found === -1) return null;
    score += found === previous + 1 ? 15 : 1;
    if (found === 0 || WORD_BOUNDARY.test(haystack[found - 1])) score += 10;
    previous = found;
    from = found + 1;
  }
  return score;
}

/** Filters to matches and sorts best-first; ties keep their original order. */
export function rankCommands<T extends Searchable>(
  items: T[],
  query: string
): T[] {
  return items
    .map((item, index) => ({ item, index, score: fuzzyScore(item, query) }))
    .filter(
      (entry): entry is { item: T; index: number; score: number } =>
        entry.score !== null
    )
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.item);
}
