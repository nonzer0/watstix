import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import StatusFilterBar from '../components/StatusFilterBar';
import { countByStatus } from '../utils/jobFilters';
import type { StatusFilter } from '../types/types';
import { sampleJobs } from './fixtures';

const meta = {
  title: 'Components/StatusFilterBar',
  component: StatusFilterBar,
  tags: ['autodocs'],
  args: { value: 'all', onChange: fn(), counts: countByStatus(sampleJobs) },
} satisfies Meta<typeof StatusFilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  render: (args) => {
    const [value, setValue] = useState<StatusFilter>(args.value);
    return <StatusFilterBar {...args} value={value} onChange={setValue} />;
  },
};

export const EmptyCounts: Story = { args: { counts: countByStatus([]) } };
