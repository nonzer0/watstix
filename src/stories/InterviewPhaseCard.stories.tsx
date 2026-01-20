import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import InterviewPhaseCard from '../components/InterviewPhaseCard';
import { InterviewPhase } from '../types/types';

const mockPhasePending: InterviewPhase = {
  id: '1',
  user_id: 'user-1',
  job_application_id: 'job-1',
  title: 'Phone Screen',
  description: 'Initial phone screening with HR',
  interview_date: '2024-02-01T14:00:00Z',
  interviewer_names: ['Sarah Johnson', 'HR Team'],
  notes: 'Prepare to discuss experience and salary expectations',
  outcome: 'pending',
  sort_order: 0,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

const mockPhasePassed: InterviewPhase = {
  id: '2',
  user_id: 'user-1',
  job_application_id: 'job-1',
  title: 'Technical Interview',
  description: 'Coding challenge and system design discussion',
  interview_date: '2024-02-05T10:00:00Z',
  interviewer_names: ['John Smith', 'Lead Engineer'],
  notes:
    'Went well! Discussed scalability and completed the coding challenge successfully.',
  outcome: 'passed',
  sort_order: 1,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-02-05T15:00:00Z',
};

const mockPhaseFailed: InterviewPhase = {
  id: '3',
  user_id: 'user-1',
  job_application_id: 'job-1',
  title: 'Final Round',
  description: 'Meeting with VP of Engineering',
  interview_date: '2024-02-10T15:00:00Z',
  interviewer_names: ['David Lee', 'VP Engineering'],
  notes: 'Did not align on team structure and responsibilities.',
  outcome: 'failed',
  sort_order: 2,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-02-10T17:00:00Z',
};

const mockPhaseCancelled: InterviewPhase = {
  id: '4',
  user_id: 'user-1',
  job_application_id: 'job-1',
  title: 'Culture Fit Interview',
  description: 'Meeting with team members',
  interview_date: '2024-02-08T11:00:00Z',
  interviewer_names: ['Team Members'],
  notes: 'Cancelled due to scheduling conflicts, will reschedule.',
  outcome: 'cancelled',
  sort_order: 3,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-02-07T10:00:00Z',
};

const mockPhaseMinimal: InterviewPhase = {
  id: '5',
  user_id: 'user-1',
  job_application_id: 'job-1',
  title: 'Quick Chat',
  description: '',
  interview_date: undefined,
  interviewer_names: [],
  notes: '',
  outcome: '',
  sort_order: 4,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

const meta = {
  title: 'Components/InterviewPhaseCard',
  component: InterviewPhaseCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-md p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    onEdit: fn(),
    onDelete: fn(),
  },
} satisfies Meta<typeof InterviewPhaseCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pending: Story = {
  args: {
    phase: mockPhasePending,
  },
};

export const Passed: Story = {
  args: {
    phase: mockPhasePassed,
  },
};

export const Failed: Story = {
  args: {
    phase: mockPhaseFailed,
  },
};

export const Cancelled: Story = {
  args: {
    phase: mockPhaseCancelled,
  },
};

export const MinimalData: Story = {
  args: {
    phase: mockPhaseMinimal,
  },
};

export const MultipleInterviewers: Story = {
  args: {
    phase: {
      ...mockPhasePending,
      interviewer_names: [
        'Sarah Johnson',
        'John Smith',
        'David Lee',
        'Emily Chen',
      ],
    },
  },
};

export const LongNotes: Story = {
  args: {
    phase: {
      ...mockPhasePassed,
      notes:
        'This was a comprehensive technical interview that covered multiple areas including system design, data structures, algorithms, and behavioral questions. The interviewer was very thorough and asked follow-up questions to dive deeper into my thought process. Overall, it was a challenging but positive experience.',
    },
  },
};
