import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InterviewPhaseCard from './InterviewPhaseCard';
import type { InterviewPhase } from '../lib/supabase';

describe('InterviewPhaseCard', () => {
  const mockPhase: InterviewPhase = {
    id: 'phase-1',
    user_id: 'user-1',
    job_application_id: 'job-1',
    title: 'Phone Screen',
    description: 'Initial phone screening interview',
    interview_date: '2024-01-15T14:30:00',
    interviewer_names: ['Jane Doe', 'John Smith'],
    notes: 'Great conversation about the role',
    outcome: 'passed',
    sort_order: 0,
    created_at: '2024-01-01T00:00:00',
    updated_at: '2024-01-01T00:00:00',
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  it('should render the phase title', () => {
    render(
      <InterviewPhaseCard
        phase={mockPhase}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Phone Screen')).toBeInTheDocument();
  });

  it('should render the phase description when provided', () => {
    render(
      <InterviewPhaseCard
        phase={mockPhase}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(
      screen.getByText('Initial phone screening interview')
    ).toBeInTheDocument();
  });

  it('should not render description when not provided', () => {
    const phaseWithoutDescription = { ...mockPhase, description: undefined };

    render(
      <InterviewPhaseCard
        phase={phaseWithoutDescription}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(
      screen.queryByText('Initial phone screening interview')
    ).not.toBeInTheDocument();
  });

  it('should render formatted interview date', () => {
    render(
      <InterviewPhaseCard
        phase={mockPhase}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Date should be formatted as "Jan 15, 2024, 2:30 PM" or similar
    expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
  });

  it('should render interviewer names', () => {
    render(
      <InterviewPhaseCard
        phase={mockPhase}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Jane Doe, John Smith')).toBeInTheDocument();
  });

  it('should not render interviewer names when array is empty', () => {
    const phaseWithoutInterviewers = { ...mockPhase, interviewer_names: [] };

    render(
      <InterviewPhaseCard
        phase={phaseWithoutInterviewers}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.queryByText('Jane Doe, John Smith')).not.toBeInTheDocument();
  });

  it('should render notes when provided', () => {
    render(
      <InterviewPhaseCard
        phase={mockPhase}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(
      screen.getByText('Great conversation about the role')
    ).toBeInTheDocument();
  });

  it('should not render notes when not provided', () => {
    const phaseWithoutNotes = { ...mockPhase, notes: undefined };

    render(
      <InterviewPhaseCard
        phase={phaseWithoutNotes}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(
      screen.queryByText('Great conversation about the role')
    ).not.toBeInTheDocument();
  });

  describe('outcome badge', () => {
    it('should render passed outcome with correct styling', () => {
      render(
        <InterviewPhaseCard
          phase={mockPhase}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const outcomeBadge = screen.getByText('Passed');
      expect(outcomeBadge).toBeInTheDocument();
      expect(outcomeBadge).toHaveClass(
        'bg-green-100',
        'text-green-800',
        'border-green-200'
      );
    });

    it('should render failed outcome with correct styling', () => {
      const failedPhase = { ...mockPhase, outcome: 'failed' };

      render(
        <InterviewPhaseCard
          phase={failedPhase}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const outcomeBadge = screen.getByText('Failed');
      expect(outcomeBadge).toBeInTheDocument();
      expect(outcomeBadge).toHaveClass(
        'bg-red-100',
        'text-red-800',
        'border-red-200'
      );
    });

    it('should render cancelled outcome with correct styling', () => {
      const cancelledPhase = { ...mockPhase, outcome: 'cancelled' };

      render(
        <InterviewPhaseCard
          phase={cancelledPhase}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const outcomeBadge = screen.getByText('Cancelled');
      expect(outcomeBadge).toBeInTheDocument();
      expect(outcomeBadge).toHaveClass(
        'bg-yellow-100',
        'text-yellow-800',
        'border-yellow-200'
      );
    });

    it('should render pending outcome with correct styling', () => {
      const pendingPhase = { ...mockPhase, outcome: 'pending' };

      render(
        <InterviewPhaseCard
          phase={pendingPhase}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const outcomeBadge = screen.getByText('Pending');
      expect(outcomeBadge).toBeInTheDocument();
      expect(outcomeBadge).toHaveClass(
        'bg-gray-100',
        'text-gray-800',
        'border-gray-200'
      );
    });

    it('should not render outcome badge when outcome is not provided', () => {
      const phaseWithoutOutcome = { ...mockPhase, outcome: undefined };

      render(
        <InterviewPhaseCard
          phase={phaseWithoutOutcome}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText('Passed')).not.toBeInTheDocument();
      expect(screen.queryByText('Failed')).not.toBeInTheDocument();
      expect(screen.queryByText('Pending')).not.toBeInTheDocument();
    });

    it('should capitalize outcome text', () => {
      render(
        <InterviewPhaseCard
          phase={mockPhase}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Passed')).toBeInTheDocument();
      expect(screen.queryByText('passed')).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should call onEdit with phase when edit button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <InterviewPhaseCard
          phase={mockPhase}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByTitle('Edit phase');
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(mockPhase);
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete with phase id when delete button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <InterviewPhaseCard
          phase={mockPhase}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByTitle('Delete phase');
      await user.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith('phase-1');
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('should handle missing interview_date gracefully', () => {
      const phaseWithoutDate = { ...mockPhase, interview_date: undefined };

      render(
        <InterviewPhaseCard
          phase={phaseWithoutDate}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Phone Screen')).toBeInTheDocument();
      expect(screen.queryByText(/Jan 15, 2024/)).not.toBeInTheDocument();
    });

    it('should handle unknown outcome with default styling', () => {
      const phaseWithUnknownOutcome = {
        ...mockPhase,
        outcome: 'unknown-status',
      };

      render(
        <InterviewPhaseCard
          phase={phaseWithUnknownOutcome}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const outcomeBadge = screen.getByText('Unknown-status');
      expect(outcomeBadge).toHaveClass(
        'bg-gray-100',
        'text-gray-800',
        'border-gray-200'
      );
    });
  });
});
