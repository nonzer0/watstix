import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { InterviewPhase } from '../../lib/supabase';
import InterviewPhaseCard from '../InterviewPhaseCard';

const mockPhase: InterviewPhase = {
  id: 'phase-1',
  user_id: 'user-1',
  job_application_id: 'job-1',
  title: 'Technical Interview',
  description: 'Coding challenge round',
  interview_date: '2026-01-15T10:00:00.000Z',
  interviewer_names: ['Alice', 'Bob'],
  notes: 'Went really well',
  outcome: 'passed',
  sort_order: 0,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
};

describe('InterviewPhaseCard', () => {
  it('renders the phase title', () => {
    render(
      <InterviewPhaseCard
        phase={mockPhase}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(
      screen.getByRole('heading', { level: 3, name: 'Technical Interview' })
    ).toBeInTheDocument();
  });

  it('renders description when present', () => {
    render(
      <InterviewPhaseCard
        phase={mockPhase}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('Coding challenge round')).toBeInTheDocument();
  });

  it('does not render description when absent', () => {
    const phase = { ...mockPhase, description: undefined };
    render(
      <InterviewPhaseCard phase={phase} onEdit={vi.fn()} onDelete={vi.fn()} />
    );
    expect(
      screen.queryByText('Coding challenge round')
    ).not.toBeInTheDocument();
  });

  it('renders interviewer names joined by comma', () => {
    render(
      <InterviewPhaseCard
        phase={mockPhase}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('Alice, Bob')).toBeInTheDocument();
  });

  it('does not render interviewers section when array is empty', () => {
    const phase = { ...mockPhase, interviewer_names: [] };
    render(
      <InterviewPhaseCard phase={phase} onEdit={vi.fn()} onDelete={vi.fn()} />
    );
    expect(screen.queryByText(/Alice/)).not.toBeInTheDocument();
  });

  it('renders notes', () => {
    render(
      <InterviewPhaseCard
        phase={mockPhase}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('Went really well')).toBeInTheDocument();
  });

  it('renders outcome badge with capitalized text', () => {
    render(
      <InterviewPhaseCard
        phase={mockPhase}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('Passed')).toBeInTheDocument();
  });

  it('does not render outcome badge when absent', () => {
    const phase = { ...mockPhase, outcome: undefined };
    render(
      <InterviewPhaseCard phase={phase} onEdit={vi.fn()} onDelete={vi.fn()} />
    );
    expect(screen.queryByText('Passed')).not.toBeInTheDocument();
  });

  it('calls onDelete with phase id when delete button clicked', () => {
    const onDelete = vi.fn();
    render(
      <InterviewPhaseCard
        phase={mockPhase}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );
    fireEvent.click(screen.getByTitle('Delete phase'));
    expect(onDelete).toHaveBeenCalledWith('phase-1');
  });

  it('calls onEdit with the full phase when edit button clicked', () => {
    const onEdit = vi.fn();
    render(
      <InterviewPhaseCard
        phase={mockPhase}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTitle('Edit phase'));
    expect(onEdit).toHaveBeenCalledWith(mockPhase);
  });
});
