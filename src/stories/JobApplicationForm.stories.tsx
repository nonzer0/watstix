import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { AuthContext } from '../contexts/AuthContext';
import JobApplicationForm from '../components/JobApplicationForm';
import { JobApplication } from '../lib/supabase';

const mockUser = {
  id: 'user-1',
  email: 'user@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
};

const mockAuthContextValue = {
  user: mockUser,
  session: null,
  loading: false,
  signUp: fn(),
  signIn: fn(),
  signOut: fn(),
  resetPassword: fn(),
  updatePassword: fn(),
};

const mockJobApplication: JobApplication = {
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
  job_description: 'We are looking for an experienced software engineer.',
  notes: 'Applied through LinkedIn.',
  contact_person: 'Jane Smith',
  contact_email: 'jane.smith@techcorp.com',
};

const meta = {
  title: 'Components/JobApplicationForm',
  component: JobApplicationForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <AuthContext.Provider value={mockAuthContextValue}>
        <Story />
      </AuthContext.Provider>
    ),
  ],
  args: {
    onSuccess: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof JobApplicationForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NewApplication: Story = {
  args: {
    jobToEdit: {} as JobApplication,
  },
};

export const EditOffered: Story = {
  args: {
    jobToEdit: {
      ...mockJobApplication,
      status: 'offered',
      notes: 'Received offer with great benefits package!',
    },
  },
};
