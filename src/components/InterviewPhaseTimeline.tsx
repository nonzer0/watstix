import { Plus, Briefcase } from 'lucide-react';
import type { InterviewPhase } from '../lib/supabase';
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
        <div className={styles.emptyState}>
          <Briefcase />
          <h4>No Interview Phases Yet</h4>
          <p>Track your interview process by adding phases</p>
          <button onClick={onAdd} className="btn-primary">
            <Plus />
            Add First Phase
          </button>
        </div>
      ) : (
        <>
          <div className={styles.phaseList}>
            {sortedPhases.map((phase) => (
              <InterviewPhaseCard
                key={phase.id}
                phase={phase}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
          <button onClick={onAdd} className={styles.addBtn}>
            <Plus />
            Add Interview Phase
          </button>
        </>
      )}
    </div>
  );
}
