import { forwardRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ExternalLink, Pencil, Trash2 } from 'lucide-react';
import type { JobApplication, Status } from '../types/types';
import { formatShortDate } from '../utils/format';
import StatusMenu from './StatusMenu';
import styles from './JobTable.module.css';

interface JobRowProps {
  job: JobApplication;
  onEdit: (job: JobApplication) => void;
  onDelete: (job: JobApplication) => void;
  onStatusChange: (job: JobApplication, status: Status) => void;
  isActive?: boolean;
  statusMenuOpen?: boolean;
  onStatusMenuOpenChange?: (open: boolean) => void;
}

const JobRow = forwardRef<HTMLTableRowElement, JobRowProps>(function JobRow(
  {
    job,
    onEdit,
    onDelete,
    onStatusChange,
    isActive,
    statusMenuOpen,
    onStatusMenuOpenChange,
  },
  ref
) {
  const navigate = useNavigate();
  const href = `/job/${job.id}`;

  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Controls handle their own clicks; don't hijack text selection either.
    if (target.closest('a, button, [role="listbox"]')) return;
    if (window.getSelection()?.toString()) return;
    navigate(href);
  };

  return (
    <tr
      ref={ref}
      className={styles.row}
      onClick={handleRowClick}
      data-active={isActive || undefined}
    >
      <td className={styles.statusCell}>
        <StatusMenu
          variant="icon"
          value={job.status}
          onChange={(status) => onStatusChange(job, status)}
          open={statusMenuOpen}
          onOpenChange={onStatusMenuOpenChange}
        />
      </td>
      <td className={styles.roleCell}>
        <Link to={href} className={styles.roleLink}>
          {job.position_title}
        </Link>
        <span className={styles.mobileMeta}>
          {job.company_name}
          <span aria-hidden="true"> · </span>
          <span className="mono">{formatShortDate(job.application_date)}</span>
        </span>
      </td>
      <td className={styles.companyCell}>{job.company_name}</td>
      <td className={styles.secondaryCell}>{job.location}</td>
      <td className={`${styles.secondaryCell} mono`}>{job.salary_range}</td>
      <td className={`${styles.dateCell} mono`}>
        {formatShortDate(job.application_date)}
      </td>
      <td className={`${styles.dateCell} ${styles.wideOnly} mono`}>
        {formatShortDate(job.updated_at)}
      </td>
      <td className={styles.actionsCell}>
        <div className={styles.actions}>
          {job.job_posting_link && (
            <a
              href={job.job_posting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost btn-icon btn-sm"
              aria-label={`Open job posting for ${job.position_title}`}
              title="Open job posting"
            >
              <ExternalLink />
            </a>
          )}
          <button
            type="button"
            className="btn-ghost btn-icon btn-sm"
            onClick={() => onEdit(job)}
            aria-label={`Edit ${job.position_title}`}
            title="Edit (E)"
          >
            <Pencil />
          </button>
          <button
            type="button"
            className="btn-ghost btn-icon btn-sm"
            onClick={() => onDelete(job)}
            aria-label={`Delete ${job.position_title}`}
            title="Delete"
          >
            <Trash2 />
          </button>
        </div>
      </td>
    </tr>
  );
});

export default JobRow;
