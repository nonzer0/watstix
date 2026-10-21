import { describe, it, expect } from 'vitest';
import {
  STATUS_FILTERS,
  STATUS_LABELS,
  STATUS_ORDER,
  isOpenStatus,
  isStatus,
  statusFilterLabel,
} from './status';

describe('status utils', () => {
  it('orders open pipeline stages before closed outcomes', () => {
    const firstClosed = STATUS_ORDER.findIndex((s) => !isOpenStatus(s));
    expect(STATUS_ORDER.slice(0, firstClosed).every(isOpenStatus)).toBe(true);
    expect(STATUS_ORDER.slice(firstClosed).some(isOpenStatus)).toBe(false);
  });

  it('has a label for every status', () => {
    for (const status of STATUS_ORDER) {
      expect(STATUS_LABELS[status]).toBeTruthy();
    }
  });

  it('prefixes filters with "all"', () => {
    expect(STATUS_FILTERS[0]).toBe('all');
    expect(STATUS_FILTERS.slice(1)).toEqual(STATUS_ORDER);
  });

  it('labels filters', () => {
    expect(statusFilterLabel('all')).toBe('All');
    expect(statusFilterLabel('interviewing')).toBe('Interviewing');
  });

  it('classifies open statuses', () => {
    expect(isOpenStatus('applied')).toBe(true);
    expect(isOpenStatus('offered')).toBe(true);
    expect(isOpenStatus('accepted')).toBe(false);
    expect(isOpenStatus('rejected')).toBe(false);
  });

  it('narrows unknown values to Status', () => {
    expect(isStatus('applied')).toBe(true);
    expect(isStatus('all')).toBe(false);
    expect(isStatus(3)).toBe(false);
  });
});
