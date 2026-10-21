import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import JobDetail from './JobDetail';
import { jobService } from '../services/jobService';
import { interviewPhaseService } from '../services/interviewPhaseService';
import { useStore } from '../store';
import { makeJob } from '../test/fixtures';
import type { InterviewPhase } from '../types/types';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ signOut: vi.fn(), user: { id: 'user-1' } }),
}));
vi.mock('../services/jobService', () => ({
  jobService: {
    getJobById: vi.fn(),
    updateJobStatus: vi.fn(),
    deleteJobById: vi.fn(),
  },
}));
vi.mock('../services/interviewPhaseService', () => ({
  interviewPhaseService: { getPhasesByJobId: vi.fn(), deletePhase: vi.fn() },
}));
vi.mock('../lib/supabase', () => ({ supabase: { from: vi.fn() } }));

const phase = (id: string, jobId: string): InterviewPhase => ({
  id,
  user_id: 'user-1',
  job_application_id: jobId,
  title: `Phase ${id}`,
  interviewer_names: [],
  sort_order: 0,
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-01T00:00:00Z',
});

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/job/:id" element={<JobDetail />} />
      </Routes>
    </MemoryRouter>
  );

describe('JobDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useStore.setState({ jobs: [], interviewPhases: [] });
  });

  it('keeps other jobs’ phases in the store when loading this job', async () => {
    const other = makeJob({ id: 'other' });
    useStore.setState({
      jobs: [other],
      interviewPhases: [phase('p-other', 'other')],
    });
    vi.mocked(jobService.getJobById).mockResolvedValue(
      makeJob({ id: 'j1', position_title: 'Staff Engineer' })
    );
    vi.mocked(interviewPhaseService.getPhasesByJobId).mockResolvedValue([
      phase('p1', 'j1'),
    ]);

    renderAt('/job/j1');

    expect(
      await screen.findByRole('heading', { name: 'Staff Engineer' })
    ).toBeInTheDocument();
    expect(screen.getByText('Phase p1')).toBeInTheDocument();
    const ids = useStore
      .getState()
      .interviewPhases.map((p) => p.id)
      .sort();
    expect(ids).toEqual(['p-other', 'p1']);
    expect(useStore.getState().jobs.map((j) => j.id)).toEqual(['other', 'j1']);
  });

  it('does not render an unsafe posting link', async () => {
    vi.mocked(jobService.getJobById).mockResolvedValue(
      makeJob({ id: 'j1', job_posting_link: 'javascript:alert(1)' })
    );
    vi.mocked(interviewPhaseService.getPhasesByJobId).mockResolvedValue([]);

    renderAt('/job/j1');

    await screen.findByRole('heading', { name: 'Engineer' });
    expect(document.querySelector('a[href^="javascript"]')).toBeNull();
  });

  it('shows a not-found state for a missing job', async () => {
    vi.mocked(jobService.getJobById).mockResolvedValue(null);
    vi.mocked(interviewPhaseService.getPhasesByJobId).mockResolvedValue([]);

    renderAt('/job/missing');

    expect(
      await screen.findByText('Application not found')
    ).toBeInTheDocument();
  });
});
