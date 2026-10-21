import { useId, useState } from 'react';
import { ChevronRight, Pencil, Trash2 } from 'lucide-react';
import type { InterviewPhase } from '../types/types';
import { formatDateTime } from '../utils/format';
import { outcomeLabel } from '../utils/outcome';
import styles from './InterviewPhaseCard.module.css';

interface InterviewPhaseCardProps {
  phase: InterviewPhase;
  onEdit: (phase: InterviewPhase) => void;
  onDelete: (id: string) => void;
}

/** One node on the interview timeline; expands to show description and notes. */
export default function InterviewPhaseCard({
  phase,
  onEdit,
  onDelete,
}: InterviewPhaseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  const outcome = phase.outcome?.toLowerCase() || 'pending';
  const hasDetails = Boolean(phase.description || phase.notes);

  const meta = [
    phase.interview_date ? formatDateTime(phase.interview_date) : null,
    phase.interviewer_names.length > 0
      ? phase.interviewer_names.join(', ')
      : null,
  ].filter(Boolean);

  return (
    <li className={styles.item} data-outcome={outcome}>
      <span className={styles.node} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.header}>
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={hasDetails ? expanded : undefined}
            aria-controls={hasDetails ? detailsId : undefined}
            disabled={!hasDetails}
          >
            {hasDetails && (
              <ChevronRight className={styles.chevron} aria-hidden="true" />
            )}
            <span className={styles.title}>{phase.title}</span>
          </button>
          <span className={styles.outcome}>{outcomeLabel(outcome)}</span>
          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => onEdit(phase)}
              className="btn-ghost btn-icon btn-sm"
              aria-label={`Edit ${phase.title}`}
            >
              <Pencil />
            </button>
            <button
              type="button"
              onClick={() => onDelete(phase.id)}
              className="btn-ghost btn-icon btn-sm"
              aria-label={`Delete ${phase.title}`}
            >
              <Trash2 />
            </button>
          </div>
        </div>

        {meta.length > 0 && <p className={styles.meta}>{meta.join(' · ')}</p>}

        {hasDetails && expanded && (
          <div id={detailsId} className={styles.details}>
            {phase.description && <p>{phase.description}</p>}
            {phase.notes && <p className={styles.notes}>{phase.notes}</p>}
          </div>
        )}
      </div>
    </li>
  );
}
