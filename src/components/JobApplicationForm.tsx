import { useState } from "react";
import { supabase, JobApplication } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { X } from "lucide-react";

interface JobApplicationFormProps {
  jobToEdit: JobApplication | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function JobApplicationForm({
  jobToEdit,
  onSuccess,
  onCancel,
}: JobApplicationFormProps) {
  const { user } = useAuth();
  const jobApp = jobToEdit?.id ? jobToEdit : undefined;

  const [formData, setFormData] = useState({
    company_name: jobApp?.company_name || "",
    position_title: jobApp?.position_title || "",
    job_description: jobApp?.job_description || "",
    job_posting_link: jobApp?.job_posting_link || "",
    location: jobApp?.location || "",
    salary_range: jobApp?.salary_range || "",
    application_date:
      jobApp?.application_date || new Date().toISOString().split("T")[0],
    status: jobApp?.status || "applied",
    contact_person: jobApp?.contact_person || "",
    contact_email: jobApp?.contact_email || "",
    notes: jobApp?.notes || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (jobApp) {
        const { error: updateError } = await supabase
          .from("job_applications")
          .update({ ...formData })
          .eq("id", jobApp.id);

        if (updateError) throw updateError;

        onSuccess();
        return;
      }

      const { error: submitError } = await supabase
        .from("job_applications")
        .insert([{ ...formData, user_id: user?.id }]);

      if (submitError) throw submitError;

      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add job application",
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

  const formLabel = jobApp ? "Edit Job Application" : "Add Job Application";
  const submitLabel = jobApp ? "Update" : "Add Application";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{formLabel}</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="company_name" className="input-label">
                Company Name *
              </label>
              <input
                type="text"
                id="company_name"
                name="company_name"
                required
                value={formData.company_name}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="position_title" className="input-label">
                Position *
              </label>
              <input
                type="text"
                id="position_title"
                name="position_title"
                required
                value={formData.position_title}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="location" className="input-label">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., San Francisco, CA"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="salary_range" className="input-label">
                Salary Range
              </label>
              <input
                type="text"
                id="salary_range"
                name="salary_range"
                value={formData.salary_range}
                onChange={handleChange}
                placeholder="e.g., $80k - $120k"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="application_date" className="input-label">
                Application Date *
              </label>
              <input
                type="date"
                id="application_date"
                name="application_date"
                required
                value={formData.application_date}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="status" className="input-label">
                Status *
              </label>
              <select
                id="status"
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="input-field"
              >
                <option value="applied">Applied</option>
                <option value="interviewing">Interviewing</option>
                <option value="offered">Offered</option>
                <option value="rejected">Rejected</option>
                <option value="accepted">Accepted</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>

            <div>
              <label htmlFor="contact_person" className="input-label">
                Contact Person
              </label>
              <input
                type="text"
                id="contact_person"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
                placeholder="Recruiter name"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="contact_email" className="input-label">
                Contact Email
              </label>
              <input
                type="email"
                id="contact_email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleChange}
                placeholder="recruiter@company.com"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label htmlFor="job_posting_link" className="input-label">
              Job Posting Link
            </label>
            <input
              type="url"
              id="job_posting_link"
              name="job_posting_link"
              value={formData.job_posting_link}
              onChange={handleChange}
              placeholder="https://company.com/job-posting"
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="job_description" className="input-label">
              Job Description
            </label>
            <textarea
              id="job_description"
              name="job_description"
              value={formData.job_description}
              onChange={handleChange}
              rows={4}
              placeholder="Key responsibilities, requirements, etc."
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="notes" className="input-label">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Additional notes, follow-up actions, etc."
              className="input-field"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Adding..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
