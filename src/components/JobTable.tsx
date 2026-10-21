import { useEffect, useRef } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import type { JobApplication, Status } from '../types/types';
import type { JobSort, SortKey } from '../utils/jobFilters';
import JobRow from './JobRow';
import styles from './JobTable.module.css';

interface JobTableProps {
  jobs: JobApplication[];
  sort: JobSort;
  onSortChange: (key: SortKey) => void;
  onEdit: (job: JobApplication) => void;
  onDelete: (job: JobApplication) => void;
  onStatusChange: (job: JobApplication, status: Status) => void;
  activeJobId?: string | null;
  statusMenuJobId?: string | null;
  onStatusMenuJobIdChange?: (id: string | null) => void;
}

const COLUMNS: {
  key: SortKey | null;
  label: string;
  className?: string;
  srOnly?: boolean;
}[] = [
  {
    key: 'status',
    label: 'Status',
    className: styles.statusCell,
    srOnly: true,
  },
  { key: 'position_title', label: 'Role', className: styles.roleCell },
  { key: 'company_name', label: 'Company', className: styles.companyCell },
  { key: 'location', label: 'Location', className: styles.secondaryCell },
  { key: null, label: 'Salary', className: styles.secondaryCell },
  { key: 'application_date', label: 'Applied', className: styles.dateCell },
  {
    key: 'updated_at',
    label: 'Updated',
    className: `${styles.dateCell} ${styles.wideOnly}`,
  },
  { key: null, label: 'Actions', className: styles.actionsCell, srOnly: true },
];

export default function JobTable({
  jobs,
  sort,
  onSortChange,
  onEdit,
  onDelete,
  onStatusChange,
  activeJobId,
  statusMenuJobId,
  onStatusMenuJobIdChange,
}: JobTableProps) {
  const activeRowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    activeRowRef.current?.scrollIntoView?.({ block: 'nearest' });
  }, [activeJobId]);

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {COLUMNS.map((column) => {
            const isSorted = column.key !== null && sort.key === column.key;
            const ariaSort = isSorted
              ? sort.direction === 'asc'
                ? 'ascending'
                : 'descending'
              : undefined;
            const SortIcon = sort.direction === 'asc' ? ArrowUp : ArrowDown;

            return (
              <th
                key={column.label}
                scope="col"
                className={column.className}
                aria-sort={ariaSort}
              >
                {column.srOnly ? (
                  <span className="visually-hidden">{column.label}</span>
                ) : column.key ? (
                  <button
                    type="button"
                    className={styles.sortButton}
                    onClick={() => onSortChange(column.key!)}
                  >
                    {column.label}
                    {isSorted && <SortIcon className={styles.sortIcon} />}
                  </button>
                ) : (
                  column.label
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {jobs.map((job) => (
          <JobRow
            key={job.id}
            ref={job.id === activeJobId ? activeRowRef : undefined}
            job={job}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            isActive={job.id === activeJobId}
            statusMenuOpen={
              onStatusMenuJobIdChange ? statusMenuJobId === job.id : undefined
            }
            onStatusMenuOpenChange={
              onStatusMenuJobIdChange
                ? (open) => onStatusMenuJobIdChange(open ? job.id : null)
                : undefined
            }
          />
        ))}
      </tbody>
    </table>
  );
}

export function JobTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div
      className={styles.skeleton}
      role="status"
      aria-busy="true"
      aria-label="Loading applications"
    >
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={styles.skeletonRow}>
          <span className={styles.skeletonDot} />
          <span
            className={styles.skeletonBar}
            style={{ width: `${28 + ((i * 17) % 30)}%` }}
          />
          <span
            className={styles.skeletonBar}
            style={{ width: `${14 + ((i * 11) % 12)}%` }}
          />
        </div>
      ))}
    </div>
  );
}
