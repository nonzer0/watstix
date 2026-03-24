import { JobApplication } from '../../lib/supabase';
import styles from './JobStatusBtn.module.css';

type StatusFilter = 'all' | JobApplication['status'];

interface StatusGridProps {
  status: { label: string; value: StatusFilter; color: string };
  statusFilter: string;
  setStatusFilter: (status: StatusFilter) => void;
  applications: JobApplication[];
}

export function JobStatusBtn({
  status,
  statusFilter,
  setStatusFilter,
  applications,
}: StatusGridProps) {
  const getStatusCount = (status: JobApplication['status']) => {
    return applications.filter((app) => app.status === status).length;
  };

  const isActive = statusFilter === status.value;

  return (
    <button
      onClick={() => setStatusFilter(status.value)}
      aria-pressed={isActive}
      className={`${styles.btn} ${isActive ? styles.active : styles.inactive}`}
      style={isActive ? { backgroundColor: status.color } : undefined}
    >
      <div className={styles.label}>{status.label}</div>
      <div className={styles.count}>
        {status.value === 'all'
          ? applications.length
          : getStatusCount(status.value as JobApplication['status'])}
      </div>
    </button>
  );
}
