import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { InterviewPhase } from '../../lib/supabase';
import InterviewPhaseForm from '../InterviewPhaseForm';

const {
  mockCreatePhase,
  mockUpdatePhase,
  mockAddInterviewPhase,
  mockUpdateInterviewPhase,
} = vi.hoisted(() => ({
  mockCreatePhase: vi.fn(),
  mockUpdatePhase: vi.fn(),
  mockAddInterviewPhase: vi.fn(),
  mockUpdateInterviewPhase: vi.fn(),
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-123' } }),
}));

vi.mock('../../services/interviewPhaseService', () => ({
  interviewPhaseService: {
    createPhase: mockCreatePhase,
    updatePhase: mockUpdatePhase,
  },
}));

vi.mock('../../store', () => ({
  useStore: {
    use: {
      addInterviewPhase: () => mockAddInterviewPhase,
      updateInterviewPhase: () => mockUpdateInterviewPhase,
      interviewPhases: () => [],
    },
  },
}));

const existingPhase: InterviewPhase = {
  id: 'phase-1',
  user_id: 'user-123',
  job_application_id: 'job-1',
  title: 'Phone Screen',
  notes: 'Introductory call',
  interviewer_names: ['Alice', 'Bob'],
  outcome: 'passed',
  sort_order: 0,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
};

const newPhaseResult: InterviewPhase = {
  id: 'new-phase',
  user_id: 'user-123',
  job_application_id: 'job-1',
  title: '',
  interviewer_names: [],
  sort_order: 0,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
};

describe('InterviewPhaseForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreatePhase.mockResolvedValue(newPhaseResult);
    mockUpdatePhase.mockResolvedValue(true);
  });

  it('shows "Add Interview Phase" heading for new form', () => {
    render(
      <InterviewPhaseForm
        phaseToEdit={{} as InterviewPhase}
        jobId="job-1"
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(
      screen.getByRole('heading', { name: 'Add Interview Phase' })
    ).toBeInTheDocument();
  });

  it('shows "Edit Interview Phase" heading for existing phase', () => {
    render(
      <InterviewPhaseForm
        phaseToEdit={existingPhase}
        jobId="job-1"
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(
      screen.getByRole('heading', { name: 'Edit Interview Phase' })
    ).toBeInTheDocument();
  });

  it('pre-populates title from existing phase', () => {
    render(
      <InterviewPhaseForm
        phaseToEdit={existingPhase}
        jobId="job-1"
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByDisplayValue('Phone Screen')).toBeInTheDocument();
  });

  it('pre-populates notes from existing phase', () => {
    render(
      <InterviewPhaseForm
        phaseToEdit={existingPhase}
        jobId="job-1"
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByDisplayValue('Introductory call')).toBeInTheDocument();
  });

  it('pre-populates interviewer names as comma-separated string', () => {
    render(
      <InterviewPhaseForm
        phaseToEdit={existingPhase}
        jobId="job-1"
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByDisplayValue('Alice, Bob')).toBeInTheDocument();
  });

  it('cancel button calls onCancel', () => {
    const onCancel = vi.fn();
    render(
      <InterviewPhaseForm
        phaseToEdit={{} as InterviewPhase}
        jobId="job-1"
        onSuccess={vi.fn()}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('calls createPhase and addInterviewPhase on new form submit', async () => {
    const onSuccess = vi.fn();
    render(
      <InterviewPhaseForm
        phaseToEdit={{} as InterviewPhase}
        jobId="job-1"
        onSuccess={onSuccess}
        onCancel={vi.fn()}
      />
    );
    fireEvent.submit(
      screen.getByRole('button', { name: /add phase/i }).closest('form')!
    );
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(mockCreatePhase).toHaveBeenCalled();
    expect(mockAddInterviewPhase).toHaveBeenCalledWith(newPhaseResult);
  });

  it('calls updatePhase and updateInterviewPhase on edit form submit', async () => {
    const onSuccess = vi.fn();
    render(
      <InterviewPhaseForm
        phaseToEdit={existingPhase}
        jobId="job-1"
        onSuccess={onSuccess}
        onCancel={vi.fn()}
      />
    );
    fireEvent.submit(
      screen.getByRole('button', { name: /^update$/i }).closest('form')!
    );
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(mockUpdatePhase).toHaveBeenCalledWith('phase-1', expect.any(Object));
    expect(mockUpdateInterviewPhase).toHaveBeenCalledWith(
      'phase-1',
      expect.any(Object)
    );
  });

  it('shows error when createPhase returns null', async () => {
    mockCreatePhase.mockResolvedValue(null);
    render(
      <InterviewPhaseForm
        phaseToEdit={{} as InterviewPhase}
        jobId="job-1"
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    fireEvent.submit(
      screen.getByRole('button', { name: /add phase/i }).closest('form')!
    );
    await waitFor(() =>
      expect(screen.getByText('Failed to create phase')).toBeInTheDocument()
    );
  });

  it('shows "Saving..." while submitting', async () => {
    mockCreatePhase.mockReturnValue(new Promise(() => {}));
    render(
      <InterviewPhaseForm
        phaseToEdit={{} as InterviewPhase}
        jobId="job-1"
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    fireEvent.submit(
      screen.getByRole('button', { name: /add phase/i }).closest('form')!
    );
    await waitFor(() =>
      expect(screen.getByText('Saving...')).toBeInTheDocument()
    );
  });
});
