import { Plus } from 'lucide-react';
import type { InterviewPhase } from '../types/types';
import InterviewPhaseCard from './InterviewPhaseCard';
import styles from './InterviewPhaseTimeline.module.css';

interface InterviewPhaseTimelineProps {
  phases: InterviewPhase[];
  onAdd: () => void;
  onEdit: (phase: InterviewPhase) => void;
  onDelete: (id: string) => void;
}

export default function InterviewPhaseTimeline({
  phases,
  onAdd,
  onEdit,
  onDelete,
}: InterviewPhaseTimelineProps) {
  const sortedPhases = [...phases].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className={styles.timeline}>
      {sortedPhases.length === 0 ? (
        <p className={styles.empty}>
          No interview phases yet. Add one when a screen or interview is
          scheduled.
        </p>
      ) : (
        <ol className={styles.list}>
          {sortedPhases.map((phase) => (
            <InterviewPhaseCard
              key={phase.id}
              phase={phase}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ol>
      )}
      <button type="button" onClick={onAdd} className="btn-ghost btn-sm">
        <Plus />
        Add phase
      </button>
    </div>
  );
}
