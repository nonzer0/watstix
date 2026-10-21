import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { MemoryRouter } from 'react-router-dom';
import JobTable, { JobTableSkeleton } from '../components/JobTable';
import { DEFAULT_SORT } from '../utils/jobFilters';
import { sampleJobs } from './fixtures';

const meta = {
  title: 'Components/JobTable',
  component: JobTable,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: {
    jobs: sampleJobs,
    sort: DEFAULT_SORT,
    onSortChange: fn(),
    onEdit: fn(),
    onDelete: fn(),
    onStatusChange: fn(),
  },
} satisfies Meta<typeof JobTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ActiveRow: Story = { args: { activeJobId: sampleJobs[2].id } };

export const Loading: Story = { render: () => <JobTableSkeleton /> };
