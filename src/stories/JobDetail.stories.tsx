import type { Meta, StoryObj } from '@storybook/react-vite';
import { mocked } from 'storybook/test';
import JobDetail from '../views/JobDetail';
import { jobService } from '../services/jobService';
import { interviewPhaseService } from '../services/interviewPhaseService';
import { useStore } from '../store';
import { samplePhases, sampleJobs } from './fixtures';
import { withAppProviders } from './storyProviders';

const meta = {
  title: 'Views/JobDetail',
  component: JobDetail,
  parameters: { layout: 'fullscreen' },
  decorators: [withAppProviders('/job/:id', '/job/j1')],
  beforeEach: () => {
    useStore.setState({ jobs: [], interviewPhases: [] });
    mocked(jobService.getJobById).mockResolvedValue(sampleJobs[0]);
    mocked(jobService.updateJobStatus).mockResolvedValue(true);
    mocked(interviewPhaseService.getPhasesByJobId).mockResolvedValue(
      samplePhases
    );
    mocked(interviewPhaseService.deletePhase).mockResolvedValue(true);
  },
} satisfies Meta<typeof JobDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithInterviewPhases: Story = {};

export const Sparse: Story = {
  beforeEach: () => {
    mocked(jobService.getJobById).mockResolvedValue(sampleJobs[1]);
    mocked(interviewPhaseService.getPhasesByJobId).mockResolvedValue([]);
  },
};

export const NotFound: Story = {
  beforeEach: () => {
    mocked(jobService.getJobById).mockResolvedValue(null);
    mocked(interviewPhaseService.getPhasesByJobId).mockResolvedValue([]);
  },
};
