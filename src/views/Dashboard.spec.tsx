import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './Dashboard';
import { jobService } from '../services/jobService';
import { interviewPhaseService } from '../services/interviewPhaseService';
import { useStore } from '../store';
import { makeJob } from '../test/fixtures';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ signOut: vi.fn(), user: { id: 'user-1' } }),
}));
vi.mock('../services/jobService', () => ({
  jobService: {
    getJobs: vi.fn(),
    updateJobStatus: vi.fn(),
    deleteJobById: vi.fn(),
  },
}));
vi.mock('../services/interviewPhaseService', () => ({
  interviewPhaseService: { getAllPhases: vi.fn() },
}));
vi.mock('../lib/supabase', () => ({ supabase: { from: vi.fn() } }));

const jobs = [
  makeJob({
    id: 'a',
    position_title: 'Staff Engineer',
    company_name: 'Northwind',
    application_date: '2026-10-10',
  }),
  makeJob({
    id: 'b',
    position_title: 'Designer',
    company_name: 'Globex',
    application_date: '2026-10-01',
    status: 'rejected',
  }),
];

const press = (key: string) => fireEvent.keyDown(window, { key });

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useStore.setState({ jobs: [], interviewPhases: [] });
    vi.mocked(jobService.getJobs).mockResolvedValue(jobs);
    vi.mocked(interviewPhaseService.getAllPhases).mockResolvedValue([]);
  });

  const renderDashboard = async () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/job/:id" element={<p>Detail for job</p>} />
        </Routes>
      </MemoryRouter>
    );
    await screen.findByRole('link', { name: 'Staff Engineer' });
  };

  it('lists applications newest first', async () => {
    await renderDashboard();
    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('Staff Engineer');
    expect(rows[1]).toHaveTextContent('Designer');
  });

  it('filters by status and text', async () => {
    await renderDashboard();

    const filters = within(
      screen.getByRole('group', { name: /filter by status/i })
    );
    fireEvent.click(filters.getByRole('button', { name: /rejected/i }));
    expect(
      screen.queryByRole('link', { name: 'Staff Engineer' })
    ).not.toBeInTheDocument();

    fireEvent.click(filters.getByRole('button', { name: /^all/i }));
    fireEvent.change(
      screen.getByRole('searchbox', { name: /filter applications/i }),
      {
        target: { value: 'zzz' },
      }
    );
    expect(screen.getByText('No matching applications')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(screen.getByRole('link', { name: 'Designer' })).toBeInTheDocument();
  });

  it('moves through rows with J/K and opens the active one with Enter', async () => {
    await renderDashboard();

    press('j');
    press('j');
    press('k');
    press('Enter');

    expect(screen.getByText('Detail for job')).toBeInTheDocument();
  });

  it('focuses the filter with /', async () => {
    await renderDashboard();
    press('/');
    expect(
      screen.getByRole('searchbox', { name: /filter applications/i })
    ).toHaveFocus();
  });

  it('changes status optimistically and rolls back on failure', async () => {
    vi.mocked(jobService.updateJobStatus).mockResolvedValue(false);
    await renderDashboard();

    press('j');
    press('s');
    fireEvent.keyDown(screen.getByRole('listbox'), { key: '3' });

    expect(useStore.getState().jobs.find((j) => j.id === 'a')?.status).toBe(
      'offered'
    );
    await vi.waitFor(() =>
      expect(useStore.getState().jobs.find((j) => j.id === 'a')?.status).toBe(
        'applied'
      )
    );
    expect(jobService.updateJobStatus).toHaveBeenCalledWith('a', 'offered');
  });
});
