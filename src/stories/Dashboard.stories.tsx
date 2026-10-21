import type { Meta, StoryObj } from '@storybook/react-vite';
import { mocked } from 'storybook/test';
import Dashboard from '../views/Dashboard';
import { jobService } from '../services/jobService';
import { interviewPhaseService } from '../services/interviewPhaseService';
import { useStore } from '../store';
import { samplePhases, sampleJobs } from './fixtures';
import { withAppProviders } from './storyProviders';

const meta = {
  title: 'Views/Dashboard',
  component: Dashboard,
  parameters: { layout: 'fullscreen' },
  decorators: [withAppProviders('/')],
  beforeEach: () => {
    useStore.setState({ jobs: [], interviewPhases: [] });
    mocked(jobService.getJobs).mockResolvedValue(sampleJobs);
    mocked(jobService.updateJobStatus).mockResolvedValue(true);
    mocked(jobService.deleteJobById).mockResolvedValue(true);
    mocked(interviewPhaseService.getAllPhases).mockResolvedValue(samplePhases);
  },
} satisfies Meta<typeof Dashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithApplications: Story = {};

export const Empty: Story = {
  beforeEach: () => {
    mocked(jobService.getJobs).mockResolvedValue([]);
  },
};

export const Loading: Story = {
  beforeEach: () => {
    mocked(jobService.getJobs).mockReturnValue(new Promise(() => {}));
  },
};

export const StatusUpdateFails: Story = {
  beforeEach: () => {
    mocked(jobService.updateJobStatus).mockResolvedValue(false);
  },
};
