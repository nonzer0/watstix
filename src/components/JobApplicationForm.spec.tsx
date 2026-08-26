import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import JobApplicationForm from './JobApplicationForm';
import { jobPostingService } from '../services/jobPostingService';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

vi.mock('../services/jobPostingService', () => ({
  jobPostingService: { parseJobPosting: vi.fn() },
}));

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn() },
}));

const LINK_PLACEHOLDER = 'https://company.com/job-posting';

describe('JobApplicationForm autofill', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderForm = () =>
    render(
      <JobApplicationForm
        jobToEdit={null}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    );

  const enterLink = (url: string) => {
    fireEvent.change(screen.getByPlaceholderText(LINK_PLACEHOLDER), {
      target: { value: url },
    });
  };

  const clickAutofill = () => {
    fireEvent.click(
      screen.getByRole('button', { name: /autofill from link/i })
    );
  };

  it('disables the autofill button until a job posting link is entered', () => {
    renderForm();

    expect(
      screen.getByRole('button', { name: /autofill from link/i })
    ).toBeDisabled();

    enterLink('https://example.com/jobs/123');

    expect(
      screen.getByRole('button', { name: /autofill from link/i })
    ).not.toBeDisabled();
  });

  it('fills in the fields returned by the parse-job-posting service on success', async () => {
    vi.mocked(jobPostingService.parseJobPosting).mockResolvedValue({
      found: true,
      fields: { company_name: 'Acme Corp', position_title: 'Engineer' },
    });

    renderForm();
    enterLink('https://example.com/jobs/123');
    clickAutofill();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Engineer')).toBeInTheDocument();
    });
    expect(jobPostingService.parseJobPosting).toHaveBeenCalledWith(
      'https://example.com/jobs/123'
    );
  });

  it('shows a "blocked" notice when the site refuses or times out the request', async () => {
    vi.mocked(jobPostingService.parseJobPosting).mockResolvedValue({
      found: false,
      fields: {},
      error: 'fetch_failed',
    });

    renderForm();
    enterLink('https://example.com/jobs/123');
    clickAutofill();

    await waitFor(() => {
      expect(
        screen.getByText(/blocked or didn't respond to our request/i)
      ).toBeInTheDocument();
    });
  });

  it('shows a "not found" notice when the page has no structured job data', async () => {
    vi.mocked(jobPostingService.parseJobPosting).mockResolvedValue({
      found: false,
      fields: {},
    });

    renderForm();
    enterLink('https://example.com/jobs/123');
    clickAutofill();

    await waitFor(() => {
      expect(
        screen.getByText(/couldn't find structured job details/i)
      ).toBeInTheDocument();
    });
  });

  it('shows a "not found" notice when the service call itself fails (returns null)', async () => {
    vi.mocked(jobPostingService.parseJobPosting).mockResolvedValue(null);

    renderForm();
    enterLink('https://example.com/jobs/123');
    clickAutofill();

    await waitFor(() => {
      expect(
        screen.getByText(/couldn't find structured job details/i)
      ).toBeInTheDocument();
    });
  });
});
