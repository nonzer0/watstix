import { useState } from "react";
import { X } from "lucide-react";
import type { InterviewPhase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { interviewPhaseService } from "../services/interviewPhaseService";
import { useStore } from "../store";

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
    title: phase?.title || "",
    description: phase?.description || "",
    interview_date: phase?.interview_date
      ? new Date(phase.interview_date).toISOString().slice(0, 16)
      : "",
    interviewer_names: phase?.interviewer_names?.join(", ") || "",
    notes: phase?.notes || "",
    outcome: phase?.outcome || "pending",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const interviewer_names = formData.interviewer_names
        .split(",")
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
          phaseData,
        );

        if (!success) throw new Error("Failed to update phase");
        updateInterviewPhase(phase.id, phaseData as Partial<InterviewPhase>);
        onSuccess();
        return;
      }

      const jobPhases = interviewPhases.filter(
        (p) => p.job_application_id === jobId,
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

      if (!newPhase) throw new Error("Failed to create phase");
      addInterviewPhase(newPhase);
      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save interview phase",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const formLabel = phase ? "Edit Interview Phase" : "Add Interview Phase";
  const submitLabel = phase ? "Update" : "Add Phase";

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-base-200 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-base-200 border-b border-base-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-color-neutral">{formLabel}</h2>
          <button
            onClick={onCancel}
            className="text-color-neutral hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm">
              {error}
            </div>
          )}

          <div>
            <fieldset className="fieldset">
              <legend className="legend">Title *</legend>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Phone Screen, Technical Interview"
                className="input input-neutral"
              />
            </fieldset>
          </div>

          <div>
            <fieldset className="fieldset">
              <legend className="legend">Description</legend>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                placeholder="Additional details about this interview phase"
                className="textarea textarea-neutral w-full"
              />
            </fieldset>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <fieldset className="fieldset">
                <legend className="legend">Date & Time</legend>
                <input
                  type="datetime-local"
                  id="interview_date"
                  name="interview_date"
                  value={formData.interview_date}
                  onChange={handleChange}
                  className="input input-neutral"
                />
              </fieldset>
            </div>

            <div>
              <fieldset className="fieldset">
                <legend className="legend">Outcome</legend>
                <select
                  id="outcome"
                  name="outcome"
                  value={formData.outcome}
                  onChange={handleChange}
                  className="input input-neutral"
                >
                  <option value="pending">Pending</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </fieldset>
            </div>
          </div>

          <div>
            <fieldset className="fieldset">
              <legend className="legend">Interviewer Names</legend>
              <input
                type="text"
                id="interviewer_names"
                name="interviewer_names"
                value={formData.interviewer_names}
                onChange={handleChange}
                placeholder="Jane Doe, John Smith (comma-separated)"
                className="input input-neutral w-full"
              />
            </fieldset>
          </div>

          <div>
            <fieldset className="fieldset">
              <legend className="legend">Notes & Feedback</legend>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Interview feedback, impressions, follow-up actions..."
                className="textarea textarea-neutral w-full"
              />
            </fieldset>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary btn-lg px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-lg px-4"
            >
              {isSubmitting ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
