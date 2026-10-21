import { Layers } from 'lucide-react';
import type { StatusFilter } from '../types/types';
import { STATUS_FILTERS, statusFilterLabel } from '../utils/status';
import StatusIcon from './StatusIcon';
import styles from './StatusFilterBar.module.css';

interface StatusFilterBarProps {
  value: StatusFilter;
  onChange: (filter: StatusFilter) => void;
  counts: Record<StatusFilter, number>;
}

export default function StatusFilterBar({
  value,
  onChange,
  counts,
}: StatusFilterBarProps) {
  return (
    <div className={styles.bar} role="group" aria-label="Filter by status">
      {STATUS_FILTERS.map((filter) => (
        <button
          key={filter}
          type="button"
          onClick={() => onChange(filter)}
          aria-pressed={value === filter}
          className={styles.segment}
          data-empty={counts[filter] === 0 || undefined}
        >
          {filter === 'all' ? (
            <Layers className={styles.allIcon} aria-hidden="true" />
          ) : (
            <StatusIcon status={filter} />
          )}
          <span>{statusFilterLabel(filter)}</span>
          <span className={styles.count}>{counts[filter]}</span>
        </button>
      ))}
    </div>
  );
}
