import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import StatusMenu from '../components/StatusMenu';
import StatusIcon from '../components/StatusIcon';
import { STATUS_LABELS, STATUS_ORDER } from '../utils/status';
import type { Status } from '../types/types';

const meta = {
  title: 'Components/StatusMenu',
  component: StatusMenu,
  tags: ['autodocs'],
  args: { value: 'interviewing', onChange: fn() },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof StatusMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Label: Story = {
  render: (args) => {
    const [value, setValue] = useState<Status>(args.value);
    return (
      <div style={{ height: 260 }}>
        <StatusMenu
          {...args}
          value={value}
          onChange={(status) => {
            setValue(status);
            args.onChange(status);
          }}
        />
      </div>
    );
  },
};

export const IconOnly: Story = { args: { variant: 'icon' } };

export const Open: Story = {
  args: { open: true },
  render: (args) => (
    <div style={{ height: 260 }}>
      <StatusMenu {...args} />
    </div>
  ),
};

export const AllGlyphs: Story = {
  render: () => (
    <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
      {STATUS_ORDER.map((status) => (
        <li
          key={status}
          style={{ display: 'flex', gap: 8, alignItems: 'center' }}
        >
          <StatusIcon status={status} size={16} />
          {STATUS_LABELS[status]}
        </li>
      ))}
    </ul>
  ),
};
