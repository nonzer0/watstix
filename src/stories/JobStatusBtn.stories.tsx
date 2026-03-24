import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { JobStatusBtn } from '../components/JobStatusBtn/JobStatusBtn';
import type { JobApplication, StatusFilter } from '../types/types';

const mockApplications: JobApplication[] = [
  { id: '1', status: 'applied' } as JobApplication,
  { id: '2', status: 'applied' } as JobApplication,
  { id: '3', status: 'interviewing' } as JobApplication,
  { id: '4', status: 'offered' } as JobApplication,
  { id: '5', status: 'rejected' } as JobApplication,
  { id: '6', status: 'accepted' } as JobApplication,
];

const meta = {
  title: 'Components/JobStatusBtn',
  component: JobStatusBtn,
  tags: ['autodocs'],
  args: {
    setStatusFilter: fn(),
    applications: mockApplications,
  },
} satisfies Meta<typeof JobStatusBtn>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inactive: Story = {
  args: {
    status: {
      label: 'Applied',
      value: 'applied',
      color: 'var(--color-status-applied)',
    },
    statusFilter: 'all',
  },
};

export const Active: Story = {
  args: {
    status: {
      label: 'Applied',
      value: 'applied',
      color: 'var(--color-status-applied)',
    },
    statusFilter: 'applied',
  },
};

const allStatuses = [
  {
    value: 'all' as StatusFilter,
    label: 'All',
    color: 'var(--color-status-all)',
  },
  {
    value: 'applied' as StatusFilter,
    label: 'Applied',
    color: 'var(--color-status-applied)',
  },
  {
    value: 'interviewing' as StatusFilter,
    label: 'Interviewing',
    color: 'var(--color-status-interviewing)',
  },
  {
    value: 'offered' as StatusFilter,
    label: 'Offered',
    color: 'var(--color-status-offered)',
  },
  {
    value: 'rejected' as StatusFilter,
    label: 'Rejected',
    color: 'var(--color-status-rejected)',
  },
  {
    value: 'accepted' as StatusFilter,
    label: 'Accepted',
    color: 'var(--color-status-accepted)',
  },
  {
    value: 'withdrawn' as StatusFilter,
    label: 'Withdrawn',
    color: 'var(--color-status-withdrawn)',
  },
];

export const AllStatuses: Story = {
  args: {
    status: { label: 'All', value: 'all', color: 'var(--color-status-all)' },
    statusFilter: 'all',
  },
  render: (args) => {
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '0.75rem',
        }}
      >
        {allStatuses.map((status) => (
          <JobStatusBtn
            {...args}
            key={status.value}
            status={status}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        ))}
      </div>
    );
  },
};
