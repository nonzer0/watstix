import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { BrowserRouter } from 'react-router-dom';
import JobApplicationCard from '../components/JobApplicationCard';
import { JobApplication } from '../lib/supabase';

const mockApplicationApplied: JobApplication = {
  id: '1',
  user_id: 'user-1',
  company_name: 'Tech Corp',
  position_title: 'Senior Software Engineer',
  status: 'applied',
  application_date: '2024-01-15',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  location: 'San Francisco, CA',
  salary_range: '$120,000 - $150,000',
  job_posting_link: 'https://example.com/job1',
  job_description:
    'We are looking for an experienced software engineer to join our team. You will work on cutting-edge technologies and help build scalable systems.',
  notes: 'Applied through LinkedIn. Recruiter seemed very interested.',
  contact_person: 'Jane Smith',
  contact_email: 'jane.smith@techcorp.com',
};

const mockApplicationMinimal: JobApplication = {
  id: '5',
  user_id: 'user-1',
  company_name: 'Minimal Inc',
  position_title: 'Software Developer',
  status: 'applied',
  application_date: '2024-01-20',
  created_at: '2024-01-20T10:00:00Z',
  updated_at: '2024-01-20T10:00:00Z',
};

const meta = {
  title: 'Components/JobApplicationCard',
  component: JobApplicationCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div className="max-w-md p-4">
          <Story />
        </div>
      </BrowserRouter>
    ),
  ],
  args: {
    onUpdate: fn(),
    onEdit: fn(),
  },
} satisfies Meta<typeof JobApplicationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Applied: Story = {
  args: {
    application: mockApplicationApplied,
  },
};

export const MinimalData: Story = {
  args: {
    application: mockApplicationMinimal,
  },
};
