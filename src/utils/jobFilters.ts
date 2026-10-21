import type { JobApplication, Status, StatusFilter } from '../types/types';
import { STATUS_FILTERS, STATUS_ORDER } from './status';

export type SortKey =
  | 'status'
  | 'position_title'
  | 'company_name'
  | 'location'
  | 'application_date'
  | 'updated_at';

export type SortDirection = 'asc' | 'desc';

export type JobSort = { key: SortKey; direction: SortDirection };

export const DEFAULT_SORT: JobSort = {
  key: 'application_date',
  direction: 'desc',
};

const DATE_KEYS: ReadonlySet<SortKey> = new Set([
  'application_date',
  'updated_at',
]);

export function filterByStatus(
  jobs: JobApplication[],
  filter: StatusFilter
): JobApplication[] {
  return filter === 'all' ? jobs : jobs.filter((job) => job.status === filter);
}

/** Every whitespace-separated term must appear in role, company, location or contact. */
export function searchJobs(
  jobs: JobApplication[],
  query: string
): JobApplication[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return jobs;

  return jobs.filter((job) => {
    const haystack = [
      job.position_title,
      job.company_name,
      job.location,
      job.contact_person,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

function compareJobs(a: JobApplication, b: JobApplication, key: SortKey) {
  if (key === 'status') {
    return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
  }
  const left = a[key] ?? '';
  const right = b[key] ?? '';
  // ISO date strings order correctly as strings.
  if (DATE_KEYS.has(key)) return left < right ? -1 : left > right ? 1 : 0;
  return left.localeCompare(right, undefined, { sensitivity: 'base' });
}

export function sortJobs(
  jobs: JobApplication[],
  sort: JobSort
): JobApplication[] {
  const sign = sort.direction === 'asc' ? 1 : -1;
  return [...jobs].sort(
    (a, b) =>
      sign * compareJobs(a, b, sort.key) ||
      compareJobs(b, a, 'updated_at') ||
      a.id.localeCompare(b.id)
  );
}

/** Same key flips direction; a new key starts newest-first for dates, A→Z otherwise. */
export function toggleSort(current: JobSort, key: SortKey): JobSort {
  if (current.key === key) {
    return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
  }
  return { key, direction: DATE_KEYS.has(key) ? 'desc' : 'asc' };
}

export function countByStatus(
  jobs: JobApplication[]
): Record<StatusFilter, number> {
  const counts = Object.fromEntries(
    STATUS_FILTERS.map((filter) => [filter, 0])
  ) as Record<StatusFilter, number>;
  counts.all = jobs.length;
  for (const job of jobs) {
    counts[job.status as Status] += 1;
  }
  return counts;
}

export function visibleJobs(
  jobs: JobApplication[],
  options: { status: StatusFilter; query: string; sort: JobSort }
): JobApplication[] {
  return sortJobs(
    searchJobs(filterByStatus(jobs, options.status), options.query),
    options.sort
  );
}
