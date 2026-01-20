import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import InterviewPhaseTimeline from '../components/InterviewPhaseTimeline';
import { InterviewPhase } from '../types/types';

const mockPhases: InterviewPhase[] = [
  {
    id: '1',
    user_id: 'user-1',
    job_application_id: 'job-1',
    title: 'Phone Screen',
    description: 'Initial phone screening with HR',
    interview_date: '2024-02-01T14:00:00Z',
    interviewer_names: ['Sarah Johnson'],
    notes: 'Went well, discussed experience and expectations',
    outcome: 'passed',
    sort_order: 0,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-02-01T15:00:00Z',
  },
  {
    id: '2',
    user_id: 'user-1',
    job_application_id: 'job-1',
    title: 'Technical Interview',
    description: 'Coding challenge and system design',
    interview_date: '2024-02-05T10:00:00Z',
    interviewer_names: ['John Smith', 'Lead Engineer'],
    notes: 'Completed coding challenge successfully',
    outcome: 'passed',
    sort_order: 1,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-02-05T12:00:00Z',
  },
  {
    id: '3',
    user_id: 'user-1',
    job_application_id: 'job-1',
    title: 'Team Interview',
    description: 'Meet with potential team members',
    interview_date: '2024-02-10T11:00:00Z',
    interviewer_names: ['Emily Chen', 'David Lee', 'Michael Brown'],
    notes: 'Great team dynamics, looking forward to working together',
    outcome: 'pending',
    sort_order: 2,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '4',
    user_id: 'user-1',
    job_application_id: 'job-1',
    title: 'Final Round with VP',
    description: 'Discussion about role and company vision',
    interview_date: '2024-02-15T15:00:00Z',
    interviewer_names: ['Alex Johnson', 'VP Engineering'],
    notes: 'Scheduled for next week',
    outcome: 'pending',
    sort_order: 3,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
];

const meta = {
  title: 'Components/InterviewPhaseTimeline',
  component: InterviewPhaseTimeline,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-2xl p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    onAdd: fn(),
    onEdit: fn(),
    onDelete: fn(),
  },
} satisfies Meta<typeof InterviewPhaseTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    phases: [],
  },
};

export const SinglePhase: Story = {
  args: {
    phases: [mockPhases[0]],
  },
};

export const MultiplePhases: Story = {
  args: {
    phases: mockPhases,
  },
};

export const AllPassed: Story = {
  args: {
    phases: mockPhases.map((phase) => ({
      ...phase,
      outcome: 'passed',
    })),
  },
};

export const MixedOutcomes: Story = {
  args: {
    phases: [
      { ...mockPhases[0], outcome: 'passed' },
      { ...mockPhases[1], outcome: 'passed' },
      { ...mockPhases[2], outcome: 'failed' },
      {
        ...mockPhases[3],
        outcome: 'cancelled',
        notes: 'Rescheduled to next week',
      },
    ],
  },
};
