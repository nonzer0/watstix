import { Calendar, Users, FileText, Trash2, Edit } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { InterviewPhase } from '../lib/supabase';
import styles from './InterviewPhaseCard.module.css';

interface InterviewPhaseCardProps {
  phase: InterviewPhase;
  onEdit: (phase: InterviewPhase) => void;
  onDelete: (id: string) => void;
}

export default function InterviewPhaseCard({
  phase,
  onEdit,
  onDelete,
}: InterviewPhaseCardProps) {
  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  function renderPhaseValue(val: string | null | undefined, Icon: LucideIcon) {
    if (!val) return null;
    return (
      <div className={styles.detail}>
        <Icon />
        <span>{val}</span>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.info}>
          <h3 className={styles.title}>{phase.title}</h3>
          {phase.description && (
            <p className={styles.description}>{phase.description}</p>
          )}
        </div>
        <div className={styles.actions}>
          <button
            onClick={() => onDelete(phase.id)}
            className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
            title="Delete phase"
          >
            <Trash2 />
          </button>
          <button
            onClick={() => onEdit(phase)}
            className={`${styles.iconBtn} ${styles.iconBtnEdit}`}
            title="Edit phase"
          >
            <Edit />
          </button>
        </div>
      </div>

      <div className={styles.details}>
        {renderPhaseValue(formatDateTime(phase.interview_date), Calendar)}
        {phase.interviewer_names.length > 0 &&
          renderPhaseValue(phase.interviewer_names.join(', '), Users)}
        {renderPhaseValue(phase.notes, FileText)}
      </div>

      <div className={styles.footer}>
        {phase.outcome && (
          <span
            className={styles.outcomeBadge}
            data-outcome={phase.outcome.toLowerCase()}
          >
            {phase.outcome.charAt(0).toUpperCase() + phase.outcome.slice(1)}
          </span>
        )}
      </div>
    </div>
  );
}
