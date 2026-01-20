import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { JobStatusBtn } from '../components/JobStatusBtn';
import { JobApplication } from '../lib/supabase';

const mockApplications: JobApplication[] = [
  {
    id: '1',
    user_id: 'user-1',
    company_name: 'Tech Corp',
    position_title: 'Software Engineer',
    status: 'applied',
    application_date: '2024-01-15',
    created_at: '2024-01-15',
    updated_at: '2024-01-15',
    location: 'San Francisco',
    salary_range: '120k-150k',
    job_posting_link: 'https://example.com/job1',
    notes: 'Great opportunity',
  },
  {
    id: '2',
    user_id: 'user-1',
    company_name: 'StartupXYZ',
    position_title: 'Senior Developer',
    status: 'interviewing',
    application_date: '2024-01-10',
    created_at: '2024-01-10',
    updated_at: '2024-01-10',
    location: 'Remote',
    salary_range: '100k-130k',
    job_posting_link: 'https://example.com/job2',
    notes: 'Exciting startup',
  },
  {
    id: '3',
    user_id: 'user-1',
    company_name: 'BigCo',
    position_title: 'Frontend Engineer',
    status: 'rejected',
    application_date: '2024-01-05',
    created_at: '2024-01-05',
    updated_at: '2024-01-05',
    location: 'New York',
    salary_range: '110k-140k',
    job_posting_link: 'https://example.com/job3',
    notes: 'Not a good fit',
  },
];

const meta = {
  title: 'Components/JobStatusBtn',
  component: JobStatusBtn,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    statusFilter: 'all',
    setStatusFilter: fn(),
    applications: mockApplications,
  },
} satisfies Meta<typeof JobStatusBtn>;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {
  args: {
    status: { label: 'All', value: 'all', color: 'bg-gray-600' },
    statusFilter: 'all',
  },
};

export const AllSelected: Story = {
  args: {
    status: { label: 'All', value: 'all', color: 'bg-gray-600' },
    statusFilter: 'all',
  },
};

export const Applied: Story = {
  args: {
    status: { label: 'Applied', value: 'applied', color: 'bg-blue-600' },
    statusFilter: 'all',
  },
};

export const AppliedSelected: Story = {
  args: {
    status: { label: 'Applied', value: 'applied', color: 'bg-blue-600' },
    statusFilter: 'applied',
  },
};

export const Interviewing: Story = {
  args: {
    status: {
      label: 'Interviewing',
      value: 'interviewing',
      color: 'bg-yellow-600',
    },
    statusFilter: 'all',
  },
};

export const InterviewingSelected: Story = {
  args: {
    status: {
      label: 'Interviewing',
      value: 'interviewing',
      color: 'bg-yellow-600',
    },
    statusFilter: 'interviewing',
  },
};

export const Offered: Story = {
  args: {
    status: { label: 'Offered', value: 'offered', color: 'bg-green-600' },
    statusFilter: 'all',
  },
};

export const Rejected: Story = {
  args: {
    status: { label: 'Rejected', value: 'rejected', color: 'bg-red-600' },
    statusFilter: 'all',
  },
};

export const RejectedSelected: Story = {
  args: {
    status: { label: 'Rejected', value: 'rejected', color: 'bg-red-600' },
    statusFilter: 'rejected',
  },
};

export const Accepted: Story = {
  args: {
    status: { label: 'Accepted', value: 'accepted', color: 'bg-emerald-600' },
    statusFilter: 'all',
  },
};

export const Withdrawn: Story = {
  args: {
    status: { label: 'Withdrawn', value: 'withdrawn', color: 'bg-gray-500' },
    statusFilter: 'all',
  },
};
