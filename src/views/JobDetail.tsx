import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Calendar,
  User,
  Mail,
  Edit,
  ExternalLink,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { JobApplication, InterviewPhase } from '../lib/supabase';
import { useStore } from '../store';
import { interviewPhaseService } from '../services/interviewPhaseService';
import { jobService } from '../services/jobService';
import { Loading } from '../components/Loading';
import JobApplicationForm from '../components/JobApplicationForm';
import InterviewPhaseForm from '../components/InterviewPhaseForm';
import InterviewPhaseTimeline from '../components/InterviewPhaseTimeline';
import styles from './JobDetail.module.css';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [editingPhase, setEditingPhase] = useState<InterviewPhase | null>(null);

  const jobs = useStore.use.jobs();
  const phases = useStore.use.interviewPhases();
  const setJobs = useStore.use.setJobs();
  const setInterviewPhases = useStore.use.setInterviewPhases();
  const deleteInterviewPhase = useStore.use.deleteInterviewPhase();

  const job = jobs.find((j) => j.id === id);
  const jobPhases = phases
    .filter((p) => p.job_application_id === id)
    .sort((a, b) => a.sort_order - b.sort_order);

  const fetchJobAndPhases = useCallback(async () => {
    if (!id) return;

    try {
      const [jobData, phasesData] = await Promise.all([
        jobService.getJobById(id),
        interviewPhaseService.getPhasesByJobId(id),
      ]);

      if (jobData && !jobs.find((j) => j.id === id)) {
        setJobs([...jobs, jobData]);
      }

      setInterviewPhases(phasesData);
    } catch (err) {
      console.error('Failed to fetch job and phases:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id, jobs, setJobs, setInterviewPhases]);

  useEffect(() => {
    fetchJobAndPhases();
  }, [fetchJobAndPhases]);

  const handleJobFormSuccess = () => {
    setEditingJob(null);
    fetchJobAndPhases();
  };

  const handlePhaseFormSuccess = () => {
    setEditingPhase(null);
    fetchJobAndPhases();
  };

  const handleDeletePhase = async (phaseId: string) => {
    if (!confirm('Are you sure you want to delete this interview phase?'))
      return;

    const success = await interviewPhaseService.deletePhase(phaseId);
    if (success) {
      deleteInterviewPhase(phaseId);
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

  if (isLoading) {
    return <Loading />;
  }

  if (!job) {
    return (
      <div className={styles.notFoundPage}>
        <div>
          <h2>Job Application Not Found</h2>
          <button onClick={() => navigate('/')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <button onClick={() => navigate('/')} className={styles.backBtn}>
          <ArrowLeft />
          Back to Dashboard
        </button>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.jobInfo}>
              <h1>{job.position_title}</h1>
              <p className={styles.company}>{job.company_name}</p>
              <span className={styles.statusBadge} data-status={job.status}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
            </div>
            <button onClick={() => setEditingJob(job)} className="btn-primary">
              <Edit />
              Edit Job
            </button>
          </div>

          <div className={styles.detailsGrid}>
            {renderJobValue(job.location, MapPin)}
            {renderJobValue(job.salary_range, DollarSign)}
            {renderJobValue(formatDate(job.application_date), Calendar)}
            {renderJobValue(job.contact_person, User)}
            {renderJobValue(job.contact_email, Mail)}
          </div>

          {job.job_posting_link && (
            <div className={styles.section}>
              <a
                href={job.job_posting_link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.postingLink}
              >
                <span>View Job Posting</span>
                <ExternalLink />
              </a>
            </div>
          )}

          {job.job_description && (
            <div className={styles.section}>
              <h3>Job Description</h3>
              <div className={styles.textBlock}>{job.job_description}</div>
            </div>
          )}

          {job.notes && (
            <div>
              <h3>Notes</h3>
              <div className={`${styles.textBlock} ${styles.notesBlock}`}>
                {job.notes}
              </div>
            </div>
          )}
        </div>

        <div className={styles.card}>
          <h2>Interview Process</h2>
          <InterviewPhaseTimeline
            phases={jobPhases}
            onAdd={() => setEditingPhase({} as InterviewPhase)}
            onEdit={setEditingPhase}
            onDelete={handleDeletePhase}
          />
        </div>
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
    </div>
  );
}
