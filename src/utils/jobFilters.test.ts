import { describe, it, expect } from 'vitest';
import { makeJob } from '../test/fixtures';
import {
  DEFAULT_SORT,
  countByStatus,
  filterByStatus,
  searchJobs,
  sortJobs,
  toggleSort,
  visibleJobs,
} from './jobFilters';

const jobs = [
  makeJob({
    id: 'a',
    position_title: 'Staff Engineer',
    company_name: 'Globex',
    location: 'Remote',
    status: 'interviewing',
    application_date: '2026-10-05',
    updated_at: '2026-10-06T00:00:00Z',
  }),
  makeJob({
    id: 'b',
    position_title: 'Product Designer',
    company_name: 'acme',
    location: 'New York',
    status: 'applied',
    application_date: '2026-10-09',
    updated_at: '2026-10-09T00:00:00Z',
  }),
  makeJob({
    id: 'c',
    position_title: 'Engineering Manager',
    company_name: 'Initech',
    contact_person: 'Bill Lumbergh',
    status: 'rejected',
    application_date: '2026-09-20',
    updated_at: '2026-10-10T00:00:00Z',
  }),
];

const ids = (list: { id: string }[]) => list.map((j) => j.id);

describe('filterByStatus', () => {
  it('returns all jobs for "all"', () => {
    expect(filterByStatus(jobs, 'all')).toBe(jobs);
  });

  it('keeps only the matching status', () => {
    expect(ids(filterByStatus(jobs, 'rejected'))).toEqual(['c']);
  });
});

describe('searchJobs', () => {
  it('returns everything for a blank query', () => {
    expect(searchJobs(jobs, '   ')).toBe(jobs);
  });

  it('matches case-insensitively across role, company, location and contact', () => {
    expect(ids(searchJobs(jobs, 'ACME'))).toEqual(['b']);
    expect(ids(searchJobs(jobs, 'remote'))).toEqual(['a']);
    expect(ids(searchJobs(jobs, 'lumbergh'))).toEqual(['c']);
  });

  it('requires every term to match', () => {
    expect(ids(searchJobs(jobs, 'engineer globex'))).toEqual(['a']);
    expect(ids(searchJobs(jobs, 'engineer'))).toEqual(['a', 'c']);
  });
});

describe('sortJobs', () => {
  it('sorts by application date, newest first by default', () => {
    expect(ids(sortJobs(jobs, DEFAULT_SORT))).toEqual(['b', 'a', 'c']);
  });

  it('sorts text case-insensitively', () => {
    expect(
      ids(sortJobs(jobs, { key: 'company_name', direction: 'asc' }))
    ).toEqual(['b', 'a', 'c']);
  });

  it('sorts status by pipeline order, not alphabetically', () => {
    expect(ids(sortJobs(jobs, { key: 'status', direction: 'asc' }))).toEqual([
      'b',
      'a',
      'c',
    ]);
  });

  it('places missing values first ascending', () => {
    expect(ids(sortJobs(jobs, { key: 'location', direction: 'asc' }))[0]).toBe(
      'c'
    );
  });

  it('does not mutate its input', () => {
    const copy = [...jobs];
    sortJobs(jobs, { key: 'company_name', direction: 'desc' });
    expect(jobs).toEqual(copy);
  });
});

describe('toggleSort', () => {
  it('flips direction for the same key', () => {
    expect(toggleSort(DEFAULT_SORT, 'application_date')).toEqual({
      key: 'application_date',
      direction: 'asc',
    });
  });

  it('starts dates descending and text ascending', () => {
    expect(toggleSort(DEFAULT_SORT, 'updated_at').direction).toBe('desc');
    expect(toggleSort(DEFAULT_SORT, 'company_name').direction).toBe('asc');
  });
});

describe('countByStatus', () => {
  it('counts every status, including zeroes', () => {
    expect(countByStatus(jobs)).toEqual({
      all: 3,
      applied: 1,
      interviewing: 1,
      offered: 0,
      accepted: 0,
      rejected: 1,
      withdrawn: 0,
    });
  });
});

describe('visibleJobs', () => {
  it('applies status, query and sort together', () => {
    expect(
      ids(
        visibleJobs(jobs, {
          status: 'all',
          query: 'engineer',
          sort: { key: 'position_title', direction: 'asc' },
        })
      )
    ).toEqual(['c', 'a']);
  });
});
