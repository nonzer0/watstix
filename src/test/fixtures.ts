import type { JobApplication } from '../types/types';

export function makeJob(
  overrides: Partial<JobApplication> = {}
): JobApplication {
  return {
    id: 'job-1',
    user_id: 'user-1',
    company_name: 'Acme',
    position_title: 'Engineer',
    application_date: '2026-10-01',
    status: 'applied',
    created_at: '2026-10-01T12:00:00Z',
    updated_at: '2026-10-01T12:00:00Z',
    ...overrides,
  };
}
