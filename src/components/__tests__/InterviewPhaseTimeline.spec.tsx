import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { InterviewPhase } from '../../lib/supabase';
import InterviewPhaseTimeline from '../InterviewPhaseTimeline';

const makePhase = (
  id: string,
  sortOrder: number,
  title: string
): InterviewPhase => ({
  id,
  user_id: 'user-1',
  job_application_id: 'job-1',
  title,
  interviewer_names: [],
  sort_order: sortOrder,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
});

describe('InterviewPhaseTimeline', () => {
  it('shows empty state when no phases', () => {
    render(
      <InterviewPhaseTimeline
        phases={[]}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('No Interview Phases Yet')).toBeInTheDocument();
  });

  it('"Add First Phase" button calls onAdd in empty state', () => {
    const onAdd = vi.fn();
    render(
      <InterviewPhaseTimeline
        phases={[]}
        onAdd={onAdd}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /add first phase/i }));
    expect(onAdd).toHaveBeenCalled();
  });

  it('renders phases sorted by sort_order', () => {
    const phases = [
      makePhase('p1', 2, 'Final Round'),
      makePhase('p2', 0, 'Phone Screen'),
      makePhase('p3', 1, 'Technical'),
    ];
    render(
      <InterviewPhaseTimeline
        phases={phases}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0]).toHaveTextContent('Phone Screen');
    expect(headings[1]).toHaveTextContent('Technical');
    expect(headings[2]).toHaveTextContent('Final Round');
  });

  it('"Add Interview Phase" button visible and calls onAdd when phases exist', () => {
    const onAdd = vi.fn();
    render(
      <InterviewPhaseTimeline
        phases={[makePhase('p1', 0, 'Phone Screen')]}
        onAdd={onAdd}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    fireEvent.click(
      screen.getByRole('button', { name: /add interview phase/i })
    );
    expect(onAdd).toHaveBeenCalled();
  });

  it('calls onDelete with phase id when delete is triggered', () => {
    const onDelete = vi.fn();
    render(
      <InterviewPhaseTimeline
        phases={[makePhase('p1', 0, 'Phone Screen')]}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );
    fireEvent.click(screen.getByTitle('Delete phase'));
    expect(onDelete).toHaveBeenCalledWith('p1');
  });

  it('calls onEdit with the phase when edit is triggered', () => {
    const onEdit = vi.fn();
    const phase = makePhase('p1', 0, 'Phone Screen');
    render(
      <InterviewPhaseTimeline
        phases={[phase]}
        onAdd={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTitle('Edit phase'));
    expect(onEdit).toHaveBeenCalledWith(phase);
  });
});
