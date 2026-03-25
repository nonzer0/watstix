import { useState } from 'react';
import { supabase, JobApplication } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';
import styles from './JobApplicationForm.module.css';

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
    company_name: jobApp?.company_name || '',
    position_title: jobApp?.position_title || '',
    job_description: jobApp?.job_description || '',
    job_posting_link: jobApp?.job_posting_link || '',
    location: jobApp?.location || '',
    salary_range: jobApp?.salary_range || '',
    application_date:
      jobApp?.application_date || new Date().toISOString().split('T')[0],
    status: jobApp?.status || 'applied',
    contact_person: jobApp?.contact_person || '',
    contact_email: jobApp?.contact_email || '',
    notes: jobApp?.notes || '',
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
          .from('job_applications')
          .update({ ...formData })
          .eq('id', jobApp.id);

        if (updateError) throw updateError;

        onSuccess();
        return;
      }

      const { error: submitError } = await supabase
        .from('job_applications')
        .insert([{ ...formData, user_id: user?.id }]);

      if (submitError) throw submitError;

      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to add job application'
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

  const formLabel = jobApp ? 'Edit Job Application' : 'Add Job Application';
  const submitLabel = jobApp ? 'Update' : 'Add Application';

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

          <div className={styles.fieldGrid}>
            <fieldset>
              <legend>Company Name *</legend>
              <input
                type="text"
                id="company_name"
                name="company_name"
                required
                value={formData.company_name}
                onChange={handleChange}
              />
            </fieldset>

            <fieldset>
              <legend>Position *</legend>
              <input
                type="text"
                id="position_title"
                name="position_title"
                required
                value={formData.position_title}
                onChange={handleChange}
              />
            </fieldset>

            <fieldset>
              <legend>Location</legend>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., San Francisco, CA"
              />
            </fieldset>

            <fieldset>
              <legend>Salary Range</legend>
              <input
                type="text"
                id="salary_range"
                name="salary_range"
                value={formData.salary_range}
                onChange={handleChange}
                placeholder="e.g., $80k - $120k"
              />
            </fieldset>

            <fieldset>
              <legend>Application Date *</legend>
              <input
                type="date"
                id="application_date"
                name="application_date"
                required
                value={formData.application_date}
                onChange={handleChange}
              />
            </fieldset>

            <fieldset>
              <legend>Status *</legend>
              <select
                id="status"
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
              >
                <option value="applied">Applied</option>
                <option value="interviewing">Interviewing</option>
                <option value="offered">Offered</option>
                <option value="rejected">Rejected</option>
                <option value="accepted">Accepted</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </fieldset>

            <fieldset>
              <legend>Contact Person</legend>
              <input
                type="text"
                id="contact_person"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
                placeholder="Recruiter name"
              />
            </fieldset>

            <fieldset>
              <legend>Contact Email</legend>
              <input
                type="email"
                id="contact_email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleChange}
                placeholder="recruiter@company.com"
              />
            </fieldset>
          </div>

          <fieldset>
            <legend>Job Posting Link</legend>
            <input
              type="url"
              id="job_posting_link"
              name="job_posting_link"
              value={formData.job_posting_link}
              onChange={handleChange}
              placeholder="https://company.com/job-posting"
            />
          </fieldset>

          <fieldset>
            <legend>Job Description</legend>
            <textarea
              id="job_description"
              name="job_description"
              value={formData.job_description}
              onChange={handleChange}
              rows={4}
              placeholder="Key responsibilities, requirements, etc."
            />
          </fieldset>

          <fieldset>
            <legend>Notes</legend>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Additional notes, follow-up actions, etc."
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
              {isSubmitting ? 'Adding...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
