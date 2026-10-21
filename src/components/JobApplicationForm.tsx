import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { JobApplication } from '../types/types';
import { useAuth } from '../contexts/AuthContext';
import { jobPostingService } from '../services/jobPostingService';
import { Wand2 } from 'lucide-react';
import { STATUS_LABELS, STATUS_ORDER } from '../utils/status';
import { MOD_KEY_LABEL, submitOnModEnter } from '../utils/keyboard';
import Dialog from './Dialog';
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
  const [isFetchingPosting, setIsFetchingPosting] = useState(false);
  const [fetchNotice, setFetchNotice] = useState<string | null>(null);

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

  const handleAutofill = async () => {
    const url = formData.job_posting_link.trim();
    if (!url) return;

    setIsFetchingPosting(true);
    setFetchNotice(null);

    const result = await jobPostingService.parseJobPosting(url);

    if (result?.found) {
      setFormData((prev) => ({ ...prev, ...result.fields }));
    } else if (
      result?.error === 'fetch_failed' ||
      result?.error === 'timeout'
    ) {
      setFetchNotice(
        "This site blocked or didn't respond to our request — please fill in the fields manually."
      );
    } else {
      setFetchNotice(
        "Couldn't find structured job details on this page — please fill in the fields manually."
      );
    }

    setIsFetchingPosting(false);
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

  const formLabel = jobApp ? 'Edit application' : 'New application';
  const submitLabel = jobApp ? 'Save changes' : 'Create application';

  return (
    <Dialog
      title={formLabel}
      onClose={onCancel}
      size="lg"
      dismissOnBackdrop={false}
    >
      <form onSubmit={handleSubmit} onKeyDown={submitOnModEnter}>
        {error && <div className="error">{error}</div>}

        <div>
          <label htmlFor="job_posting_link">Job posting link</label>
          <div className={styles.autofillRow}>
            <input
              type="url"
              id="job_posting_link"
              name="job_posting_link"
              value={formData.job_posting_link}
              onChange={handleChange}
              placeholder="https://company.com/job-posting"
            />
            <button
              type="button"
              className="btn"
              onClick={handleAutofill}
              disabled={!formData.job_posting_link.trim() || isFetchingPosting}
            >
              {isFetchingPosting ? <span className="spinner-sm" /> : <Wand2 />}
              Autofill from link
            </button>
          </div>
          {fetchNotice && <p className={styles.fetchNotice}>{fetchNotice}</p>}
        </div>

        <div className="field-grid">
          <div>
            <label htmlFor="position_title">Role *</label>
            <input
              type="text"
              id="position_title"
              name="position_title"
              required
              value={formData.position_title}
              onChange={handleChange}
              data-autofocus={jobApp ? undefined : true}
            />
          </div>

          <div>
            <label htmlFor="company_name">Company *</label>
            <input
              type="text"
              id="company_name"
              name="company_name"
              required
              value={formData.company_name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., San Francisco, CA"
            />
          </div>

          <div>
            <label htmlFor="salary_range">Salary range</label>
            <input
              type="text"
              id="salary_range"
              name="salary_range"
              value={formData.salary_range}
              onChange={handleChange}
              placeholder="e.g., $80k - $120k"
            />
          </div>

          <div>
            <label htmlFor="application_date">Applied on *</label>
            <input
              type="date"
              id="application_date"
              name="application_date"
              required
              value={formData.application_date}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              name="status"
              required
              value={formData.status}
              onChange={handleChange}
            >
              {STATUS_ORDER.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="contact_person">Contact</label>
            <input
              type="text"
              id="contact_person"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleChange}
              placeholder="Recruiter name"
            />
          </div>

          <div>
            <label htmlFor="contact_email">Contact email</label>
            <input
              type="email"
              id="contact_email"
              name="contact_email"
              value={formData.contact_email}
              onChange={handleChange}
              placeholder="recruiter@company.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="job_description">Description</label>
          <textarea
            id="job_description"
            name="job_description"
            value={formData.job_description}
            onChange={handleChange}
            rows={4}
            placeholder="Key responsibilities, requirements, etc."
          />
        </div>

        <div>
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Follow-ups, impressions, etc."
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
