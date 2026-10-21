import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowUpRight, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import type { JobApplication, InterviewPhase } from '../types/types';
import { useConfirm, useStore, useToastStore } from '../store';
import { interviewPhaseService } from '../services/interviewPhaseService';
import { jobService } from '../services/jobService';
import AppShell from '../components/AppShell';
import JobApplicationForm from '../components/JobApplicationForm';
import InterviewPhaseForm from '../components/InterviewPhaseForm';
import InterviewPhaseTimeline from '../components/InterviewPhaseTimeline';
import StatusMenu from '../components/StatusMenu';
import { useHotkeys } from '../hooks/useHotkeys';
import { useJobActions } from '../hooks/useJobActions';
import { formatLongDate } from '../utils/format';
import { displayHost, mailtoHref, safeExternalUrl } from '../utils/url';
import styles from './JobDetail.module.css';

function Property({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.property}>
      <dt>{label}</dt>
      <dd>{children || <span className={styles.empty}>—</span>}</dd>
    </div>
  );
}

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [editingPhase, setEditingPhase] = useState<InterviewPhase | null>(null);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const jobs = useStore.use.jobs();
  const phases = useStore.use.interviewPhases();
  const setJobs = useStore.use.setJobs();
  const setInterviewPhases = useStore.use.setInterviewPhases();
  const deleteInterviewPhase = useStore.use.deleteInterviewPhase();
  const confirm = useConfirm();
  const showToast = useToastStore.use.showToast();
  const { changeStatus, removeJob } = useJobActions();

  const job = jobs.find((j) => j.id === id);
  const jobPhases = phases.filter((p) => p.job_application_id === id);

  const fetchJobAndPhases = useCallback(async () => {
    if (!id) return;

    try {
      const [jobData, phasesData] = await Promise.all([
        jobService.getJobById(id),
        interviewPhaseService.getPhasesByJobId(id),
      ]);

      // Read the store at call time so this callback stays stable.
      const { jobs: currentJobs, interviewPhases: currentPhases } =
        useStore.getState();
      if (jobData) {
        setJobs(
          currentJobs.some((j) => j.id === id)
            ? currentJobs.map((j) => (j.id === id ? jobData : j))
            : [...currentJobs, jobData]
        );
      }
      setInterviewPhases([
        ...currentPhases.filter((p) => p.job_application_id !== id),
        ...phasesData,
      ]);
    } catch (err) {
      console.error('Failed to fetch job and phases:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id, setJobs, setInterviewPhases]);

  const handleJobFormSuccess = () => {
    setEditingJob(null);
    fetchJobAndPhases();
  };

  const handlePhaseFormSuccess = () => {
    setEditingPhase(null);
    fetchJobAndPhases();
  };

  const handleDeleteJob = async () => {
    if (job && (await removeJob(job))) navigate('/');
  };

  const handleDeletePhase = async (phaseId: string) => {
    const confirmed = await confirm({
      title: 'Delete interview phase?',
      message: 'The phase and its notes will be permanently deleted.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!confirmed) return;

    const success = await interviewPhaseService.deletePhase(phaseId);
    if (success) {
      deleteInterviewPhase(phaseId);
    } else {
      showToast('Could not delete the interview phase.', 'error');
    }
  };

  useHotkeys(
    {
      e: () => job && setEditingJob(job),
      s: () => setStatusMenuOpen(true),
      p: () => setEditingPhase({} as InterviewPhase),
    },
    Boolean(job)
  );

  useEffect(() => {
    fetchJobAndPhases();
  }, [fetchJobAndPhases]);

  const openNewForm = () => setEditingJob({} as JobApplication);

  if (isLoading && !job) {
    return (
      <AppShell>
        <div className={styles.loading} aria-busy="true">
          <div className="spinner" />
        </div>
      </AppShell>
    );
  }

  if (!job) {
    return (
      <AppShell onNew={openNewForm}>
        <div className={styles.notFound}>
          <h1>Application not found</h1>
          <p>It may have been deleted, or the link is incorrect.</p>
          <Link to="/" className="btn">
            Back to applications
          </Link>
        </div>
      </AppShell>
    );
  }

  const postingUrl = safeExternalUrl(job.job_posting_link);
  const emailHref = mailtoHref(job.contact_email);

  return (
    <AppShell onNew={openNewForm}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to="/">Applications</Link>
        <ChevronRight aria-hidden="true" />
        <span aria-current="page">{job.company_name}</span>
      </nav>

      <div className={styles.layout}>
        <header className={styles.header}>
          <h1>{job.position_title}</h1>
          <p className={styles.company}>{job.company_name}</p>
        </header>

        <article className={styles.main}>
          <section className={styles.section}>
            <h2>Description</h2>
            {job.job_description ? (
              <p className={styles.prose}>{job.job_description}</p>
            ) : (
              <p className={styles.empty}>No description.</p>
            )}
          </section>

          <section className={styles.section}>
            <h2>Notes</h2>
            {job.notes ? (
              <p className={styles.prose}>{job.notes}</p>
            ) : (
              <p className={styles.empty}>No notes.</p>
            )}
          </section>

          <section className={styles.section}>
            <h2>
              Interview process
              {jobPhases.length > 0 && (
                <span className={styles.count}>{jobPhases.length}</span>
              )}
            </h2>
            <InterviewPhaseTimeline
              phases={jobPhases}
              onAdd={() => setEditingPhase({} as InterviewPhase)}
              onEdit={setEditingPhase}
              onDelete={handleDeletePhase}
            />
          </section>
        </article>

        <aside className={styles.sidebar} aria-label="Properties">
          <dl className={styles.properties}>
            <Property label="Status">
              <StatusMenu
                value={job.status}
                onChange={(status) => changeStatus(job, status)}
                open={statusMenuOpen}
                onOpenChange={setStatusMenuOpen}
              />
            </Property>
            <Property label="Company">{job.company_name}</Property>
            <Property label="Location">{job.location}</Property>
            <Property label="Salary">
              {job.salary_range && (
                <span className="mono">{job.salary_range}</span>
              )}
            </Property>
            <Property label="Applied">
              <span className="mono">
                {formatLongDate(job.application_date)}
              </span>
            </Property>
            <Property label="Contact">{job.contact_person}</Property>
            <Property label="Email">
              {job.contact_email &&
                (emailHref ? (
                  <a href={emailHref}>{job.contact_email}</a>
                ) : (
                  job.contact_email
                ))}
            </Property>
            <Property label="Posting">
              {postingUrl && (
                <a
                  href={postingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.external}
                >
                  {displayHost(postingUrl)}
                  <ArrowUpRight aria-hidden="true" />
                </a>
              )}
            </Property>
          </dl>

          <dl className={`${styles.properties} ${styles.timestamps}`}>
            <Property label="Created">
              <span className="mono">{formatLongDate(job.created_at)}</span>
            </Property>
            <Property label="Updated">
              <span className="mono">{formatLongDate(job.updated_at)}</span>
            </Property>
          </dl>

          <div className={styles.sidebarActions}>
            <button
              type="button"
              onClick={() => setEditingJob(job)}
              className="btn btn-sm"
              aria-keyshortcuts="E"
            >
              <Pencil />
              Edit
              <kbd className="kbd">E</kbd>
            </button>
            <button
              type="button"
              onClick={handleDeleteJob}
              className={`btn-ghost btn-sm ${styles.deleteButton}`}
            >
              <Trash2 />
              Delete
            </button>
          </div>
        </aside>
      </div>

      {editingJob && (
        <JobApplicationForm
          jobToEdit={editingJob}
          onSuccess={handleJobFormSuccess}
          onCancel={() => setEditingJob(null)}
        />
      )}

      {editingPhase && id && (
        <InterviewPhaseForm
          phaseToEdit={editingPhase}
          jobId={id}
          onSuccess={handlePhaseFormSuccess}
          onCancel={() => setEditingPhase(null)}
        />
      )}
    </AppShell>
  );
}
