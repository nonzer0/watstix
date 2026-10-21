import { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Plus, SunMoon } from 'lucide-react';
import Dialog from '../components/Dialog';
import ConfirmDialog from '../components/ConfirmDialog';
import Toaster from '../components/Toaster';
import CommandPalette from '../components/CommandPalette';
import StatusIcon from '../components/StatusIcon';
import { useConfirmStore, useToastStore } from '../store';
import { sampleJobs } from './fixtures';

const meta = {
  title: 'Components/Overlays',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicDialog: Story = {
  render: () => (
    <Dialog title="Dialog title" onClose={fn()}>
      <p>
        Dialogs use the native element: Esc closes, focus is trapped and
        restored.
      </p>
    </Dialog>
  ),
};

function ConfirmDemo() {
  useEffect(() => {
    useConfirmStore.getState().confirm({
      title: 'Delete application?',
      message:
        'Staff Engineer at Northwind and its interview phases will be permanently deleted.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    return () => useConfirmStore.getState().settle(false);
  }, []);
  return <ConfirmDialog />;
}

export const Confirm: Story = { render: () => <ConfirmDemo /> };

function ToastDemo() {
  useEffect(() => {
    const { showToast } = useToastStore.getState();
    showToast('Moved to Interviewing');
    showToast('Application deleted', 'success');
    showToast('Could not update the status.', 'error');
    return () => useToastStore.setState({ toasts: [] });
  }, []);
  return <Toaster />;
}

export const Toasts: Story = { render: () => <ToastDemo /> };

export const Palette: Story = {
  render: () => (
    <CommandPalette
      onClose={fn()}
      commands={[
        {
          id: 'new',
          label: 'New application',
          group: 'Actions',
          icon: <Plus />,
          shortcut: 'N',
          perform: fn(),
        },
        {
          id: 'theme',
          label: 'Change theme',
          group: 'Actions',
          icon: <SunMoon />,
          perform: fn(),
        },
        ...sampleJobs.map((job) => ({
          id: job.id,
          label: job.position_title,
          detail: job.company_name,
          group: 'Applications',
          icon: <StatusIcon status={job.status} />,
          perform: fn(),
        })),
      ]}
    />
  ),
};
