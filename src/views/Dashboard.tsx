import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Plus, Search } from 'lucide-react';
import type { JobApplication, StatusFilter } from '../types/types';
import { interviewPhaseService } from '../services/interviewPhaseService';
import { jobService } from '../services/jobService';
import AppShell from '../components/AppShell';
import type { Command } from '../components/CommandPalette';
import StatusIcon from '../components/StatusIcon';
import JobApplicationForm from '../components/JobApplicationForm';
import JobTable, { JobTableSkeleton } from '../components/JobTable';
import StatusFilterBar from '../components/StatusFilterBar';
import { useHotkeys } from '../hooks/useHotkeys';
import { useJobActions } from '../hooks/useJobActions';
import { useStore } from '../store';
import {
  DEFAULT_SORT,
  countByStatus,
  toggleSort,
  visibleJobs,
  type JobSort,
  type SortKey,
} from '../utils/jobFilters';
import { STATUS_FILTERS, statusFilterLabel } from '../utils/status';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const jobs = useStore.use.jobs();
  const setJobs = useStore.use.setJobs();
  const setInterviewPhases = useStore.use.setInterviewPhases();
  const { changeStatus, removeJob } = useJobActions();

  const [isLoading, setIsLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<JobSort>(DEFAULT_SORT);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [statusMenuJobId, setStatusMenuJobId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const counts = useMemo(() => countByStatus(jobs), [jobs]);
  const rows = useMemo(
    () => visibleJobs(jobs, { status: statusFilter, query, sort }),
    [jobs, statusFilter, query, sort]
  );

  const activeIndex = rows.findIndex((job) => job.id === activeJobId);
  const activeJob = activeIndex === -1 ? null : rows[activeIndex];

  const moveActive = (delta: number) => {
    if (rows.length === 0) return;
    const next =
      activeIndex === -1
        ? delta > 0
          ? 0
          : rows.length - 1
        : Math.min(rows.length - 1, Math.max(0, activeIndex + delta));
    setActiveJobId(rows[next].id);
  };

  const filterCommands = useMemo<Command[]>(
    () =>
      STATUS_FILTERS.map((filter) => ({
        id: `filter-${filter}`,
        label: `Show ${statusFilterLabel(filter).toLowerCase()}`,
        keywords: 'filter status',
        group: 'Filters',
        icon: filter === 'all' ? <Layers /> : <StatusIcon status={filter} />,
        perform: () => setStatusFilter(filter),
      })),
    []
  );

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

  const openNewForm = useCallback(
    () => setEditingJob({} as JobApplication),
    []
  );

  const handleFormSuccess = () => {
    setEditingJob(null);
    fetchApplications();
  };

  const handleSortChange = (key: SortKey) => setSort((s) => toggleSort(s, key));

  const clearFilters = () => {
    setStatusFilter('all');
    setQuery('');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setQuery('');
      e.currentTarget.blur();
    }
  };

  useHotkeys({
    '/': () => searchRef.current?.focus(),
    j: () => moveActive(1),
    ArrowDown: () => moveActive(1),
    k: () => moveActive(-1),
    ArrowUp: () => moveActive(-1),
    Enter: () => activeJob && navigate(`/job/${activeJob.id}`),
    o: () => activeJob && navigate(`/job/${activeJob.id}`),
    e: () => activeJob && setEditingJob(activeJob),
    s: () => activeJob && setStatusMenuJobId(activeJob.id),
    Escape: () => {
      if (activeJob) setActiveJobId(null);
      else clearFilters();
    },
  });

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return (
    <AppShell onNew={openNewForm} commands={filterCommands}>
      <div className={styles.heading}>
        <h1>Applications</h1>
        {!isLoading && <span className={styles.total}>{counts.all}</span>}
      </div>

      <div className={styles.toolbar}>
        <StatusFilterBar
          value={statusFilter}
          onChange={setStatusFilter}
          counts={counts}
        />
        <div className={`input-with-icon ${styles.search}`}>
          <Search />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Filter by role, company…"
            aria-label="Filter applications"
            aria-keyshortcuts="/"
          />
          {!query && <kbd className={`kbd ${styles.searchKbd}`}>/</kbd>}
        </div>
      </div>

      {isLoading ? (
        <JobTableSkeleton />
      ) : jobs.length === 0 ? (
        <div className={styles.empty}>
          <h2>No applications yet</h2>
          <p>Add the first role you've applied to and track it from here.</p>
          <button type="button" onClick={openNewForm} className="btn-primary">
            <Plus />
            New application
          </button>
        </div>
      ) : rows.length === 0 ? (
        <div className={styles.empty}>
          <h2>No matching applications</h2>
          <p>Nothing matches the current filters.</p>
          <button type="button" onClick={clearFilters} className="btn">
            Clear filters
          </button>
        </div>
      ) : (
        <JobTable
          jobs={rows}
          sort={sort}
          onSortChange={handleSortChange}
          onEdit={setEditingJob}
          onDelete={removeJob}
          onStatusChange={changeStatus}
          activeJobId={activeJob?.id ?? null}
          statusMenuJobId={statusMenuJobId}
          onStatusMenuJobIdChange={setStatusMenuJobId}
        />
      )}

      {editingJob && (
        <JobApplicationForm
          jobToEdit={editingJob}
          onSuccess={handleFormSuccess}
          onCancel={() => setEditingJob(null)}
        />
      )}
    </AppShell>
  );
}
