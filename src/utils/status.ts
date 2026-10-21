import type { Status, StatusFilter } from '../types/types';

/** Pipeline order: open stages first, then outcomes. */
export const STATUS_ORDER: readonly Status[] = [
  'applied',
  'interviewing',
  'offered',
  'accepted',
  'rejected',
  'withdrawn',
];

export const STATUS_FILTERS: readonly StatusFilter[] = ['all', ...STATUS_ORDER];

export const STATUS_LABELS: Record<Status, string> = {
  applied: 'Applied',
  interviewing: 'Interviewing',
  offered: 'Offered',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

const OPEN_STATUSES: ReadonlySet<Status> = new Set([
  'applied',
  'interviewing',
  'offered',
]);

export function isOpenStatus(status: Status): boolean {
  return OPEN_STATUSES.has(status);
}

export function statusFilterLabel(filter: StatusFilter): string {
  return filter === 'all' ? 'All' : STATUS_LABELS[filter];
}

export function isStatus(value: unknown): value is Status {
  return (
    typeof value === 'string' && (STATUS_ORDER as string[]).includes(value)
  );
}
