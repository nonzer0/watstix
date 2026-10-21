import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  DollarSign,
  Calendar,
  User,
  Mail,
  Trash2,
  Edit,
  ExternalLink,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { JobApplication } from '../types/types';
import { jobService } from '../services/jobService';
import { useConfirm, useStore, useToastStore } from '../store';
import styles from './JobApplicationCard.module.css';

interface JobApplicationCardProps {
  application: JobApplication;
  onEdit: (job: JobApplication) => void;
}

export default function JobApplicationCard({
  application,
  onEdit,
}: JobApplicationCardProps) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteJob = useStore.use.deleteJob();
  const updateJob = useStore.use.updateJob();
  const confirm = useConfirm();
  const showToast = useToastStore.use.showToast();

  const handleCardClick = () => {
    navigate(`/job/${application.id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = await confirm({
      title: 'Delete application?',
      message: `${application.position_title} at ${application.company_name} and its interview phases will be permanently deleted.`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!confirmed) return;

    setIsDeleting(true);
    const success = await jobService.deleteJobById(application.id);
    if (success) {
      deleteJob(application.id);
    } else {
      setIsDeleting(false);
      showToast('Could not delete the application.', 'error');
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(application);
  };

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    e.stopPropagation();
    const newStatus = e.target.value as JobApplication['status'];
    const success = await jobService.updateJobStatus(application.id, newStatus);
    if (success) {
      updateJob(application.id, { status: newStatus });
    } else {
      showToast('Could not update the status.', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  function renderJobValue(val: string | null | undefined, Icon: LucideIcon) {
    if (!val) return null;
    return (
      <div className={styles.detail}>
        <Icon />
        <span>{val}</span>
      </div>
    );
  }

  return (
    <div onClick={handleCardClick} className={styles.card}>
      <div className={styles.header}>
        <div className={styles.info}>
          <h3 className={styles.title}>{application.position_title}</h3>
          <p className={styles.company}>{application.company_name}</p>
        </div>
        <div className={styles.actions}>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
            title="Delete application"
          >
            <Trash2 />
          </button>
          <button
            onClick={handleEdit}
            className={`${styles.iconBtn} ${styles.iconBtnEdit}`}
            title="Edit application"
          >
            <Edit />
          </button>
        </div>
      </div>

      <div className={styles.details}>
        {renderJobValue(application.location, MapPin)}
        {renderJobValue(application.salary_range, DollarSign)}
        {renderJobValue(application.application_date, Calendar)}
        {renderJobValue(application.contact_person, User)}
        {renderJobValue(application.contact_email, Mail)}
      </div>

      {application.job_posting_link && (
        <a
          href={application.job_posting_link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={styles.postingLink}
        >
          View Job Posting
          <ExternalLink />
        </a>
      )}

      {application.job_description && (
        <div className={styles.descriptionBlock}>
          <p className={styles.clampedText}>{application.job_description}</p>
        </div>
      )}

      {application.notes && (
        <div className={styles.notesBlock}>
          <p>{application.notes}</p>
        </div>
      )}

      <div className={styles.footer}>
        <select
          value={application.status}
          data-status={application.status}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onChange={handleStatusChange}
          className={styles.statusSelect}
        >
          <option value="applied">Applied</option>
          <option value="interviewing">Interviewing</option>
          <option value="offered">Offered</option>
          <option value="rejected">Rejected</option>
          <option value="accepted">Accepted</option>
          <option value="withdrawn">Withdrawn</option>
        </select>

        <span className={styles.meta}>
          Updated {formatDate(application.updated_at)}
        </span>
      </div>
    </div>
  );
}
