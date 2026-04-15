import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { JobApplication } from '../../lib/supabase';
import JobApplicationCard from '../JobApplicationCard';

const {
  mockNavigate,
  mockDeleteJob,
  mockUpdateJob,
  mockDeleteJobById,
  mockEq,
} = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockDeleteJob: vi.fn(),
  mockUpdateJob: vi.fn(),
  mockDeleteJobById: vi.fn(),
  mockEq: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../store', () => ({
  useStore: {
    use: {
      deleteJob: () => mockDeleteJob,
      updateJob: () => mockUpdateJob,
    },
  },
}));

vi.mock('../../services/jobService', () => ({
  jobService: { deleteJobById: mockDeleteJobById },
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: () => ({ update: () => ({ eq: mockEq }) }),
  },
}));

const mockApp: JobApplication = {
  id: 'job-1',
  user_id: 'user-1',
  company_name: 'Acme Corp',
  position_title: 'Software Engineer',
  application_date: '2026-01-15',
  status: 'applied',
  created_at: '2026-01-15',
  updated_at: '2026-01-15',
};

describe('JobApplicationCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteJobById.mockResolvedValue(true);
    mockEq.mockResolvedValue({ error: null });
  });

  it('renders position title and company name', () => {
    render(<JobApplicationCard application={mockApp} onEdit={vi.fn()} />);
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('renders job posting link when present', () => {
    const app = {
      ...mockApp,
      job_posting_link: 'https://jobs.example.com/123',
    };
    render(<JobApplicationCard application={app} onEdit={vi.fn()} />);
    expect(screen.getByText('View Job Posting')).toBeInTheDocument();
  });

  it('does not render job posting link when absent', () => {
    render(<JobApplicationCard application={mockApp} onEdit={vi.fn()} />);
    expect(screen.queryByText('View Job Posting')).not.toBeInTheDocument();
  });

  it('renders job description when present', () => {
    const app = { ...mockApp, job_description: 'Build cool stuff' };
    render(<JobApplicationCard application={app} onEdit={vi.fn()} />);
    expect(screen.getByText('Build cool stuff')).toBeInTheDocument();
  });

  it('renders notes when present', () => {
    const app = { ...mockApp, notes: 'Great company culture' };
    render(<JobApplicationCard application={app} onEdit={vi.fn()} />);
    expect(screen.getByText('Great company culture')).toBeInTheDocument();
  });

  it('navigates to job detail page when card is clicked', () => {
    render(<JobApplicationCard application={mockApp} onEdit={vi.fn()} />);
    fireEvent.click(screen.getByText('Software Engineer'));
    expect(mockNavigate).toHaveBeenCalledWith('/job/job-1');
  });

  it('calls onEdit and does not navigate when edit button clicked', () => {
    const onEdit = vi.fn();
    render(<JobApplicationCard application={mockApp} onEdit={onEdit} />);
    fireEvent.click(screen.getByTitle('Edit application'));
    expect(onEdit).toHaveBeenCalledWith(mockApp);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('calls deleteJobById and deleteJob after confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<JobApplicationCard application={mockApp} onEdit={vi.fn()} />);
    fireEvent.click(screen.getByTitle('Delete application'));
    await waitFor(() =>
      expect(mockDeleteJobById).toHaveBeenCalledWith('job-1')
    );
    expect(mockDeleteJob).toHaveBeenCalledWith('job-1');
  });

  it('does not delete when confirmation is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<JobApplicationCard application={mockApp} onEdit={vi.fn()} />);
    fireEvent.click(screen.getByTitle('Delete application'));
    expect(mockDeleteJobById).not.toHaveBeenCalled();
  });

  it('delete button does not trigger card navigation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<JobApplicationCard application={mockApp} onEdit={vi.fn()} />);
    fireEvent.click(screen.getByTitle('Delete application'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
