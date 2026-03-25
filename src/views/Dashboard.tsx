import { useCallback, useEffect, useState } from 'react';
import { Plus, Briefcase } from 'lucide-react';
import { JobApplication, StatusFilter, StatusType } from '../types/types';
import { interviewPhaseService } from '../services/interviewPhaseService';
import { jobService } from '../services/jobService';
import { Header } from '../components/Header';
import JobApplicationForm from '../components/JobApplicationForm';
import JobApplicationCard from '../components/JobApplicationCard';
import { JobStatusBtn } from '../components/JobStatusBtn';
import { useStore } from '../store';
import { useAuth } from '../contexts/AuthContext';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { signOut } = useAuth();

  const jobs = useStore.use.jobs();
  const setJobs = useStore.use.setJobs();
  const setInterviewPhases = useStore.use.setInterviewPhases();

  const [filteredApplications, setFilteredApplications] = useState<
    JobApplication[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const fetchApplications = useCallback(async () => {
    try {
      const [jobsResp, phasesResp] = await Promise.all([
        jobService.getJobs(),
        interviewPhaseService.getAllPhases(),
      ]);

      setJobs(jobsResp);
      setInterviewPhases(phasesResp);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [setJobs, setInterviewPhases]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredApplications(jobs);
    } else {
      setFilteredApplications(
        jobs.filter((app) => app.status === statusFilter)
      );
    }
  }, [jobs, statusFilter]);

  const handleFormSuccess = () => {
    setEditingJob(null);
    fetchApplications();
  };

  const displayForm = editingJob !== null;

  const statuses: StatusType[] = [
    { value: 'all', label: 'All', color: 'var(--color-status-all)' },
    {
      value: 'applied',
      label: 'Applied',
      color: 'var(--color-status-applied)',
    },
    {
      value: 'interviewing',
      label: 'Interviewing',
      color: 'var(--color-status-interviewing)',
    },
    {
      value: 'offered',
      label: 'Offered',
      color: 'var(--color-status-offered)',
    },
    {
      value: 'rejected',
      label: 'Rejected',
      color: 'var(--color-status-rejected)',
    },
    {
      value: 'accepted',
      label: 'Accepted',
      color: 'var(--color-status-accepted)',
    },
    {
      value: 'withdrawn',
      label: 'Withdrawn',
      color: 'var(--color-status-withdrawn)',
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.topSection}>
          <Header
            setShowForm={() => setEditingJob({} as JobApplication)}
            signOut={signOut}
          />
          <div className={styles.statusGrid}>
            {statuses.map((status) => (
              <JobStatusBtn
                key={status.value}
                status={status}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                applications={jobs}
              />
            ))}
          </div>
        </div>
        {isLoading ? (
          <div className={styles.loadingState}>
            <div
              className="spinner"
              style={{ marginBottom: 'var(--space-md)' }}
            ></div>
            <p>Loading applications...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className={styles.emptyState}>
            <Briefcase />
            <h3>
              {statusFilter === 'all'
                ? 'No Applications Yet'
                : `No ${statusFilter} Applications`}
            </h3>
            <p>
              {statusFilter === 'all'
                ? 'Start tracking your job applications by adding your first one'
                : 'Try selecting a different filter or add a new application'}
            </p>
            {statusFilter === 'all' && (
              <button
                onClick={() => setEditingJob({} as JobApplication)}
                className="btn-primary"
              >
                <Plus />
                Add Your First Application
              </button>
            )}
          </div>
        ) : (
          <div className={styles.cardsGrid}>
            {filteredApplications.map((application) => (
              <JobApplicationCard
                key={application.id}
                application={application}
                onUpdate={fetchApplications}
                onEdit={(job) => setEditingJob(job)}
              />
            ))}
          </div>
        )}
      </div>

      {displayForm && (
        <JobApplicationForm
          jobToEdit={editingJob}
          onSuccess={handleFormSuccess}
          onCancel={() => setEditingJob(null)}
        />
      )}
    </div>
  );
}
