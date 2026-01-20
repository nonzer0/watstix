import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { AuthContext } from '../contexts/AuthContext';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

// Mock auth context value
const mockAuthContextValue = {
  user: null,
  session: null,
  loading: false,
  signUp: fn(),
  signIn: fn(),
  signOut: fn(),
  resetPassword: fn().mockResolvedValue({ error: null }),
  updatePassword: fn(),
};

const meta = {
  title: 'Components/ForgotPasswordModal',
  component: ForgotPasswordModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <AuthContext.Provider value={mockAuthContextValue}>
        <Story />
      </AuthContext.Provider>
    ),
  ],
  args: {
    onClose: fn(),
  },
} satisfies Meta<typeof ForgotPasswordModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onClose: fn(),
  },
};

export const WithError: Story = {
  decorators: [
    (Story) => {
      const errorAuthContext = {
        ...mockAuthContextValue,
        resetPassword: fn().mockResolvedValue({
          error: { message: 'Failed to send reset email' },
        }),
      };
      return (
        <AuthContext.Provider value={errorAuthContext}>
          <Story />
        </AuthContext.Provider>
      );
    },
  ],
  args: {
    onClose: fn(),
  },
};
