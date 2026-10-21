import { useCallback } from 'react';
import type { JobApplication, Status } from '../types/types';
import { jobService } from '../services/jobService';
import { useConfirm, useStore, useToastStore } from '../store';
import { STATUS_LABELS } from '../utils/status';

/** Shared delete / status-change behaviour for the table and the detail page. */
export function useJobActions() {
  const deleteJob = useStore.use.deleteJob();
  const updateJob = useStore.use.updateJob();
  const confirm = useConfirm();
  const showToast = useToastStore.use.showToast();

  const changeStatus = useCallback(
    async (job: JobApplication, status: Status) => {
      const previous = job.status;
      updateJob(job.id, { status });
      const success = await jobService.updateJobStatus(job.id, status);
      if (success) {
        showToast(`Moved to ${STATUS_LABELS[status]}`);
      } else {
        updateJob(job.id, { status: previous });
        showToast('Could not update the status.', 'error');
      }
    },
    [updateJob, showToast]
  );

  const removeJob = useCallback(
    async (job: JobApplication): Promise<boolean> => {
      const confirmed = await confirm({
        title: 'Delete application?',
        message: `${job.position_title} at ${job.company_name} and its interview phases will be permanently deleted.`,
        confirmLabel: 'Delete',
        destructive: true,
      });
      if (!confirmed) return false;

      const success = await jobService.deleteJobById(job.id);
      if (success) {
        deleteJob(job.id);
        showToast('Application deleted');
      } else {
        showToast('Could not delete the application.', 'error');
      }
      return success;
    },
    [confirm, deleteJob, showToast]
  );

  return { changeStatus, removeJob };
}
