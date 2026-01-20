import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { AuthContext } from '../contexts/AuthContext';
import InterviewPhaseForm from '../components/InterviewPhaseForm';
import { InterviewPhase } from '../types/types';

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

const mockPhase: InterviewPhase = {
  id: '1',
  user_id: 'user-1',
  job_application_id: 'job-1',
  title: 'Technical Interview',
  description: 'Coding challenge and system design discussion',
  interview_date: '2024-02-05T10:00:00Z',
  interviewer_names: ['John Smith', 'Lead Engineer'],
  notes: 'Prepare coding examples and review system design patterns',
  outcome: 'pending',
  sort_order: 0,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

const meta = {
  title: 'Components/InterviewPhaseForm',
  component: InterviewPhaseForm,
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
    jobId: 'job-1',
    onSuccess: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof InterviewPhaseForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NewPhase: Story = {
  args: {
    phaseToEdit: {} as InterviewPhase,
  },
};

export const EditPhase: Story = {
  args: {
    phaseToEdit: mockPhase,
  },
};
