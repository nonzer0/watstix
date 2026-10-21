import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import JobRow from './JobRow';
import { makeJob } from '../test/fixtures';

const job = makeJob({
  id: 'job-42',
  position_title: 'Staff Engineer',
  company_name: 'Globex',
  job_posting_link: 'https://example.com/jobs/42',
});

describe('JobRow', () => {
  const handlers = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onStatusChange: vi.fn(),
  };

  beforeEach(() => vi.clearAllMocks());

  const renderRow = () =>
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <table>
                <tbody>
                  <JobRow job={job} {...handlers} />
                </tbody>
              </table>
            }
          />
          <Route path="/job/:id" element={<p>Detail page</p>} />
        </Routes>
      </MemoryRouter>
    );

  it('navigates to the detail page when the row is clicked', () => {
    renderRow();
    fireEvent.click(screen.getAllByText('Globex')[1]);
    expect(screen.getByText('Detail page')).toBeInTheDocument();
  });

  it('exposes the role as a real link', () => {
    renderRow();
    expect(
      screen.getByRole('link', { name: 'Staff Engineer' })
    ).toHaveAttribute('href', '/job/job-42');
  });

  it('edits and deletes without navigating', () => {
    renderRow();
    fireEvent.click(
      screen.getByRole('button', { name: /edit staff engineer/i })
    );
    fireEvent.click(
      screen.getByRole('button', { name: /delete staff engineer/i })
    );

    expect(handlers.onEdit).toHaveBeenCalledWith(job);
    expect(handlers.onDelete).toHaveBeenCalledWith(job);
    expect(screen.queryByText('Detail page')).not.toBeInTheDocument();
  });

  it('changes status inline without navigating', () => {
    renderRow();
    fireEvent.click(screen.getByRole('button', { name: /status: applied/i }));
    fireEvent.click(screen.getByRole('option', { name: /offered/i }));

    expect(handlers.onStatusChange).toHaveBeenCalledWith(job, 'offered');
    expect(screen.queryByText('Detail page')).not.toBeInTheDocument();
  });

  it('opens the posting in a new tab safely', () => {
    renderRow();
    const link = screen.getByRole('link', { name: /open job posting/i });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
