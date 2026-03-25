import { useState } from 'react';
import { X } from 'lucide-react';
import type { InterviewPhase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { interviewPhaseService } from '../services/interviewPhaseService';
import { useStore } from '../store';
import styles from './InterviewPhaseForm.module.css';

interface InterviewPhaseFormProps {
  phaseToEdit: InterviewPhase | null;
  jobId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function InterviewPhaseForm({
  phaseToEdit,
  jobId,
  onSuccess,
  onCancel,
}: InterviewPhaseFormProps) {
  const { user } = useAuth();
  const phase = phaseToEdit?.id ? phaseToEdit : undefined;
  const addInterviewPhase = useStore.use.addInterviewPhase();
  const updateInterviewPhase = useStore.use.updateInterviewPhase();
  const interviewPhases = useStore.use.interviewPhases();

  const [formData, setFormData] = useState({
    title: phase?.title || '',
    description: phase?.description || '',
    interview_date: phase?.interview_date
      ? new Date(phase.interview_date).toISOString().slice(0, 16)
      : '',
    interviewer_names: phase?.interviewer_names?.join(', ') || '',
    notes: phase?.notes || '',
    outcome: phase?.outcome || 'pending',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const interviewer_names = formData.interviewer_names
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean);

      const phaseData = {
        title: formData.title,
        description: formData.description,
        interview_date: formData.interview_date
          ? new Date(formData.interview_date).toISOString()
          : undefined,
        interviewer_names,
        notes: formData.notes,
        outcome: formData.outcome,
      };

      if (phase) {
        const success = await interviewPhaseService.updatePhase(
          phase.id,
          phaseData
        );

        if (!success) throw new Error('Failed to update phase');
        updateInterviewPhase(phase.id, phaseData as Partial<InterviewPhase>);
        onSuccess();
        return;
      }

      const jobPhases = interviewPhases.filter(
        (p) => p.job_application_id === jobId
      );
      const maxSortOrder =
        jobPhases.length > 0
          ? Math.max(...jobPhases.map((p) => p.sort_order))
          : -1;

      const newPhase = await interviewPhaseService.createPhase({
        ...phaseData,
        user_id: user?.id,
        job_application_id: jobId,
        sort_order: maxSortOrder + 1,
      });

      if (!newPhase) throw new Error('Failed to create phase');
      addInterviewPhase(newPhase);
      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save interview phase'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const formLabel = phase ? 'Edit Interview Phase' : 'Add Interview Phase';
  const submitLabel = phase ? 'Update' : 'Add Phase';

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{formLabel}</h2>
          <button onClick={onCancel} className={styles.closeBtn}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.formBody}>
          {error && <div className="error">{error}</div>}

          <fieldset>
            <legend>Title *</legend>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Phone Screen, Technical Interview"
            />
          </fieldset>

          <fieldset>
            <legend>Description</legend>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              placeholder="Additional details about this interview phase"
            />
          </fieldset>

          <div className={styles.fieldGrid}>
            <fieldset>
              <legend>Date & Time</legend>
              <input
                type="datetime-local"
                id="interview_date"
                name="interview_date"
                value={formData.interview_date}
                onChange={handleChange}
              />
            </fieldset>

            <fieldset>
              <legend>Outcome</legend>
              <select
                id="outcome"
                name="outcome"
                value={formData.outcome}
                onChange={handleChange}
              >
                <option value="pending">Pending</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </fieldset>
          </div>

          <fieldset>
            <legend>Interviewer Names</legend>
            <input
              type="text"
              id="interviewer_names"
              name="interviewer_names"
              value={formData.interviewer_names}
              onChange={handleChange}
              placeholder="Jane Doe, John Smith (comma-separated)"
            />
          </fieldset>

          <fieldset>
            <legend>Notes & Feedback</legend>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Interview feedback, impressions, follow-up actions..."
            />
          </fieldset>

          <div className={styles.formFooter}>
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Saving...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
