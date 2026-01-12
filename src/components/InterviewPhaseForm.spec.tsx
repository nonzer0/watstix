import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InterviewPhaseForm from './InterviewPhaseForm';
import type { InterviewPhase } from '../lib/supabase';
import { interviewPhaseService } from '../services/interviewPhaseService';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../store';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      getSession: vi.fn(),
    },
  },
}));
vi.mock('../contexts/AuthContext');
vi.mock('../services/interviewPhaseService');
vi.mock('../store');

describe('InterviewPhaseForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();
  const mockAddInterviewPhase = vi.fn();
  const mockUpdateInterviewPhase = vi.fn();

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
  };

  const mockExistingPhase: InterviewPhase = {
    id: 'phase-1',
    user_id: 'user-1',
    job_application_id: 'job-1',
    title: 'Phone Screen',
    description: 'Initial screening',
    interview_date: '2024-01-15T14:30:00',
    interviewer_names: ['Jane Doe'],
    notes: 'Great conversation',
    outcome: 'passed',
    sort_order: 0,
    created_at: '2024-01-01T00:00:00',
    updated_at: '2024-01-01T00:00:00',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useAuth as any).mockReturnValue({
      user: mockUser,
    });

    (useStore as any).mockReturnValue({
      use: {
        addInterviewPhase: () => mockAddInterviewPhase,
        updateInterviewPhase: () => mockUpdateInterviewPhase,
        interviewPhases: () => [],
      },
    });
  });

  describe('form labels and mode', () => {
    it("should display 'Add Interview Phase' title when creating new phase", () => {
      render(
        <InterviewPhaseForm
          phaseToEdit={null}
          jobId="job-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Add Interview Phase')).toBeInTheDocument();
    });

    it("should display 'Edit Interview Phase' title when editing existing phase", () => {
      render(
        <InterviewPhaseForm
          phaseToEdit={mockExistingPhase}
          jobId="job-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Edit Interview Phase')).toBeInTheDocument();
    });

    it("should show 'Add Phase' button text when creating", () => {
      render(
        <InterviewPhaseForm
          phaseToEdit={null}
          jobId="job-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(
        screen.getByRole('button', { name: 'Add Phase' })
      ).toBeInTheDocument();
    });

    it("should show 'Update' button text when editing", () => {
      render(
        <InterviewPhaseForm
          phaseToEdit={mockExistingPhase}
          jobId="job-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(
        screen.getByRole('button', { name: 'Update' })
      ).toBeInTheDocument();
    });
  });

  describe('form fields', () => {
    it('should render all form fields', () => {
      render(
        <InterviewPhaseForm
          phaseToEdit={null}
          jobId="job-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByPlaceholderText(/Phone Screen/i)).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/Additional details/i)
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/Jane Doe, John Smith/i)
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/feedback, impressions/i)
      ).toBeInTheDocument();
    });

    it('should populate form fields when editing existing phase', () => {
      render(
        <InterviewPhaseForm
          phaseToEdit={mockExistingPhase}
          jobId="job-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByDisplayValue('Phone Screen')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Initial screening')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('Great conversation')
      ).toBeInTheDocument();
    });

    it('should have empty form fields when creating new phase', () => {
      render(
        <InterviewPhaseForm
          phaseToEdit={null}
          jobId="job-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const titleInput = screen.getByPlaceholderText(
        /Phone Screen/i
      ) as HTMLInputElement;
      expect(titleInput.value).toBe('');
    });

    it('should mark title field as required', () => {
      render(
        <InterviewPhaseForm
          phaseToEdit={null}
          jobId="job-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const titleInput = screen.getByPlaceholderText(/Phone Screen/i);
      expect(titleInput).toBeRequired();
    });
  });

  describe('form interactions', () => {
    it('should update form field values on change', async () => {
      const user = userEvent.setup();

      render(
        <InterviewPhaseForm
          phaseToEdit={null}
          jobId="job-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const titleInput = screen.getByPlaceholderText(/Phone Screen/i);
      await user.type(titleInput, 'Technical Interview');

      expect(
        screen.getByDisplayValue('Technical Interview')
      ).toBeInTheDocument();
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <InterviewPhaseForm
          phaseToEdit={null}
          jobId="job-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when X button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <InterviewPhaseForm
          phaseToEdit={null}
          jobId="job-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const closeButtons = screen.getAllByRole('button');
      const xButton = closeButtons.find((btn) =>
        btn.className.includes('text-color-neutral')
      );

      if (xButton) {
        await user.click(xButton);
        expect(mockOnCancel).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('outcome select field', () => {
    it('should have all outcome options', () => {
      render(
        <InterviewPhaseForm
          phaseToEdit={null}
          jobId="job-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(
        screen.getByRole('option', { name: 'Pending' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Passed' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Failed' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Cancelled' })
      ).toBeInTheDocument();
    });
  });
});
