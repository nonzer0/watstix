import { useState } from 'react';
import type { InterviewPhase } from '../types/types';
import { useAuth } from '../contexts/AuthContext';
import { interviewPhaseService } from '../services/interviewPhaseService';
import { useStore } from '../store';
import { OUTCOME_LABELS, OUTCOMES } from '../utils/outcome';
import { MOD_KEY_LABEL, submitOnModEnter } from '../utils/keyboard';
import Dialog from './Dialog';

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

  const formLabel = phase ? 'Edit interview phase' : 'New interview phase';
  const submitLabel = phase ? 'Save changes' : 'Add phase';

  return (
    <Dialog title={formLabel} onClose={onCancel} dismissOnBackdrop={false}>
      <form onSubmit={handleSubmit} onKeyDown={submitOnModEnter}>
        {error && <div className="error">{error}</div>}

        <div>
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Phone screen, Technical interview"
            autoFocus
          />
        </div>

        <div className="field-grid">
          <div>
            <label htmlFor="interview_date">Date & time</label>
            <input
              type="datetime-local"
              id="interview_date"
              name="interview_date"
              value={formData.interview_date}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="outcome">Outcome</label>
            <select
              id="outcome"
              name="outcome"
              value={formData.outcome}
              onChange={handleChange}
            >
              {OUTCOMES.map((outcome) => (
                <option key={outcome} value={outcome}>
                  {OUTCOME_LABELS[outcome]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="interviewer_names">Interviewers</label>
          <input
            type="text"
            id="interviewer_names"
            name="interviewer_names"
            value={formData.interviewer_names}
            onChange={handleChange}
            placeholder="Jane Doe, John Smith (comma-separated)"
          />
        </div>

        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={2}
            placeholder="Format, focus areas, who to ask for"
          />
        </div>

        <div>
          <label htmlFor="notes">Notes & feedback</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            placeholder="Impressions, feedback, follow-up actions"
          />
        </div>

        <div className="form-footer">
          <span className="form-hint">
            <kbd className="kbd">{MOD_KEY_LABEL}</kbd>
            <kbd className="kbd">↵</kbd> to save
          </span>
          <button type="button" onClick={onCancel} className="btn">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Saving…' : submitLabel}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
