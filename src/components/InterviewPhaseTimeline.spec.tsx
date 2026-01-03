import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InterviewPhaseTimeline from './InterviewPhaseTimeline';
import type { InterviewPhase } from '../lib/supabase';

vi.mock('./InterviewPhaseCard', () => ({
  default: ({
    phase,
    onEdit,
    onDelete,
  }: {
    phase: InterviewPhase;
    onEdit: (phase: InterviewPhase) => void;
    onDelete: (id: string) => void;
  }) => (
    <div data-testid={`phase-card-${phase.id}`}>
      <h3>{phase.title}</h3>
      <button onClick={() => onEdit(phase)}>Edit Phase</button>
      <button onClick={() => onDelete(phase.id)}>Delete Phase</button>
    </div>
  ),
}));

describe('InterviewPhaseTimeline', () => {
  const mockOnAdd = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  const mockPhases: InterviewPhase[] = [
    {
      id: 'phase-1',
      user_id: 'user-1',
      job_application_id: 'job-1',
      title: 'Phone Screen',
      interviewer_names: ['Jane Doe'],
      sort_order: 0,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    } as InterviewPhase,
    {
      id: 'phase-2',
      user_id: 'user-1',
      job_application_id: 'job-1',
      title: 'Technical Interview',
      interviewer_names: ['John Smith'],
      sort_order: 1,
      created_at: '2024-01-02',
      updated_at: '2024-01-02',
    } as InterviewPhase,
    {
      id: 'phase-3',
      user_id: 'user-1',
      job_application_id: 'job-1',
      title: 'Final Interview',
      interviewer_names: ['CEO'],
      sort_order: 2,
      created_at: '2024-01-03',
      updated_at: '2024-01-03',
    } as InterviewPhase,
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('empty state', () => {
    it('should display empty state when no phases exist', () => {
      render(
        <InterviewPhaseTimeline
          phases={[]}
          onAdd={mockOnAdd}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('No Interview Phases Yet')).toBeInTheDocument();
      expect(
        screen.getByText('Track your interview process by adding phases')
      ).toBeInTheDocument();
    });

    it("should display 'Add First Phase' button in empty state", () => {
      render(
        <InterviewPhaseTimeline
          phases={[]}
          onAdd={mockOnAdd}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(
        screen.getByRole('button', { name: /Add First Phase/i })
      ).toBeInTheDocument();
    });

    it("should call onAdd when 'Add First Phase' button is clicked", async () => {
      const user = userEvent.setup();

      render(
        <InterviewPhaseTimeline
          phases={[]}
          onAdd={mockOnAdd}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const addButton = screen.getByRole('button', {
        name: /Add First Phase/i,
      });
      await user.click(addButton);

      expect(mockOnAdd).toHaveBeenCalledTimes(1);
    });
  });

  describe('displaying phases', () => {
    it('should render phase cards when phases exist', () => {
      render(
        <InterviewPhaseTimeline
          phases={mockPhases}
          onAdd={mockOnAdd}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('phase-card-phase-1')).toBeInTheDocument();
      expect(screen.getByTestId('phase-card-phase-2')).toBeInTheDocument();
      expect(screen.getByTestId('phase-card-phase-3')).toBeInTheDocument();
    });

    it('should render correct number of phase cards', () => {
      render(
        <InterviewPhaseTimeline
          phases={mockPhases}
          onAdd={mockOnAdd}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const phaseCards = screen.getAllByTestId(/phase-card-/);
      expect(phaseCards).toHaveLength(3);
    });

    it("should display 'Add Interview Phase' button when phases exist", () => {
      render(
        <InterviewPhaseTimeline
          phases={mockPhases}
          onAdd={mockOnAdd}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(
        screen.getByRole('button', { name: /Add Interview Phase/i })
      ).toBeInTheDocument();
    });

    it("should call onAdd when 'Add Interview Phase' button is clicked", async () => {
      const user = userEvent.setup();

      render(
        <InterviewPhaseTimeline
          phases={mockPhases}
          onAdd={mockOnAdd}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const addButton = screen.getByRole('button', {
        name: /Add Interview Phase/i,
      });
      await user.click(addButton);

      expect(mockOnAdd).toHaveBeenCalledTimes(1);
    });
  });

  describe('phase sorting', () => {
    it('should sort phases by sort_order in ascending order', () => {
      const unsortedPhases = [
        { ...mockPhases[2], sort_order: 2 },
        { ...mockPhases[0], sort_order: 0 },
        { ...mockPhases[1], sort_order: 1 },
      ];

      render(
        <InterviewPhaseTimeline
          phases={unsortedPhases}
          onAdd={mockOnAdd}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const phaseCards = screen.getAllByTestId(/phase-card-/);

      // Check the order by inspecting the data-testid
      expect(phaseCards[0]).toHaveAttribute(
        'data-testid',
        'phase-card-phase-1'
      );
      expect(phaseCards[1]).toHaveAttribute(
        'data-testid',
        'phase-card-phase-2'
      );
      expect(phaseCards[2]).toHaveAttribute(
        'data-testid',
        'phase-card-phase-3'
      );
    });

    it('should handle phases with same sort_order', () => {
      const phasesWithSameOrder = [
        { ...mockPhases[0], sort_order: 0 },
        { ...mockPhases[1], sort_order: 0 },
      ];

      render(
        <InterviewPhaseTimeline
          phases={phasesWithSameOrder}
          onAdd={mockOnAdd}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const phaseCards = screen.getAllByTestId(/phase-card-/);
      expect(phaseCards).toHaveLength(2);
    });
  });

  describe('phase card interactions', () => {
    it('should pass onEdit handler to phase cards', async () => {
      const user = userEvent.setup();

      render(
        <InterviewPhaseTimeline
          phases={[mockPhases[0]]}
          onAdd={mockOnAdd}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByRole('button', { name: /Edit Phase/i });
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(mockPhases[0]);
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('should pass onDelete handler to phase cards', async () => {
      const user = userEvent.setup();

      render(
        <InterviewPhaseTimeline
          phases={[mockPhases[0]]}
          onAdd={mockOnAdd}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByRole('button', {
        name: /Delete Phase/i,
      });
      await user.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith('phase-1');
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('rendering with single phase', () => {
    it('should render correctly with a single phase', () => {
      render(
        <InterviewPhaseTimeline
          phases={[mockPhases[0]]}
          onAdd={mockOnAdd}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('phase-card-phase-1')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Add Interview Phase/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByText('No Interview Phases Yet')
      ).not.toBeInTheDocument();
    });
  });

  describe('immutability', () => {
    it('should not mutate original phases array', () => {
      const originalPhases = [...mockPhases];
      const phasesCopy = [...mockPhases];

      render(
        <InterviewPhaseTimeline
          phases={originalPhases}
          onAdd={mockOnAdd}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Original array should not be mutated
      expect(originalPhases).toEqual(phasesCopy);
    });
  });
});
