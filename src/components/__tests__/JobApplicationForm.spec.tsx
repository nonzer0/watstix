import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { JobApplication } from '../../lib/supabase';
import JobApplicationForm from '../JobApplicationForm';

const { mockInsert, mockUpdate, mockEq } = vi.hoisted(() => ({
  mockInsert: vi.fn(),
  mockUpdate: vi.fn(),
  mockEq: vi.fn(),
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-123' } }),
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: () => ({
      insert: mockInsert,
      update: mockUpdate,
    }),
  },
}));

const existingJob: JobApplication = {
  id: 'job-1',
  user_id: 'user-123',
  company_name: 'Acme Corp',
  position_title: 'Senior Engineer',
  application_date: '2026-01-15',
  status: 'interviewing',
  created_at: '2026-01-15',
  updated_at: '2026-01-15',
};

describe('JobApplicationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockEq.mockResolvedValue({ error: null });
  });

  it('shows "Add Job Application" heading for new form', () => {
    render(
      <JobApplicationForm
        jobToEdit={{} as JobApplication}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(
      screen.getByRole('heading', { name: 'Add Job Application' })
    ).toBeInTheDocument();
  });

  it('shows "Edit Job Application" heading for existing job', () => {
    render(
      <JobApplicationForm
        jobToEdit={existingJob}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(
      screen.getByRole('heading', { name: 'Edit Job Application' })
    ).toBeInTheDocument();
  });

  it('pre-populates fields with existing job data', () => {
    render(
      <JobApplicationForm
        jobToEdit={existingJob}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Senior Engineer')).toBeInTheDocument();
  });

  it('cancel button calls onCancel', () => {
    const onCancel = vi.fn();
    render(
      <JobApplicationForm
        jobToEdit={{} as JobApplication}
        onSuccess={vi.fn()}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('calls insert and onSuccess for new application', async () => {
    const onSuccess = vi.fn();
    render(
      <JobApplicationForm
        jobToEdit={{} as JobApplication}
        onSuccess={onSuccess}
        onCancel={vi.fn()}
      />
    );
    fireEvent.submit(
      screen.getByRole('button', { name: /add application/i }).closest('form')!
    );
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(mockInsert).toHaveBeenCalled();
  });

  it('calls update and onSuccess for existing application', async () => {
    const onSuccess = vi.fn();
    render(
      <JobApplicationForm
        jobToEdit={existingJob}
        onSuccess={onSuccess}
        onCancel={vi.fn()}
      />
    );
    fireEvent.submit(
      screen.getByRole('button', { name: /^update$/i }).closest('form')!
    );
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith('id', 'job-1');
  });

  it('shows error message when insert fails', async () => {
    mockInsert.mockRejectedValue(new Error('Insert failed'));
    render(
      <JobApplicationForm
        jobToEdit={{} as JobApplication}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    fireEvent.submit(
      screen.getByRole('button', { name: /add application/i }).closest('form')!
    );
    await waitFor(() =>
      expect(screen.getByText('Insert failed')).toBeInTheDocument()
    );
  });

  it('shows "Adding..." while submitting new application', async () => {
    mockInsert.mockReturnValue(new Promise(() => {}));
    // Pass null (not {}) so the loading label reads "Adding..." not "Updating..."
    render(
      <JobApplicationForm
        jobToEdit={null}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    fireEvent.submit(
      screen.getByRole('button', { name: /add application/i }).closest('form')!
    );
    await waitFor(() =>
      expect(screen.getByText('Adding...')).toBeInTheDocument()
    );
  });

  it('shows "Updating..." while submitting edit', async () => {
    mockEq.mockReturnValue(new Promise(() => {}));
    render(
      <JobApplicationForm
        jobToEdit={existingJob}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    fireEvent.submit(
      screen.getByRole('button', { name: /^update$/i }).closest('form')!
    );
    await waitFor(() =>
      expect(screen.getByText('Updating...')).toBeInTheDocument()
    );
  });
});
