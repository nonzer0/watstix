import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import type { AuthError } from '@supabase/supabase-js';
import AuthForm from '../components/AuthForm';
import { AuthContext } from '../contexts/AuthContext';

// Mock AuthContext for Storybook
const mockAuthContext = {
  user: null,
  session: null,
  loading: false,
  signIn: fn(async () => ({ error: null })),
  signUp: fn(async () => ({ error: null })),
  signOut: fn(async () => {}),
  resetPassword: fn(async () => ({ error: null })),
  updatePassword: fn(async () => ({ error: null })),
};

const meta = {
  title: 'Components/AuthForm',
  component: AuthForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <AuthContext.Provider value={mockAuthContext}>
        <Story />
      </AuthContext.Provider>
    ),
  ],
} satisfies Meta<typeof AuthForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSignInError: Story = {
  decorators: [
    (Story) => {
      const errorContext = {
        ...mockAuthContext,
        signIn: fn(async () => ({
          error: { message: 'Invalid login credentials' } as AuthError,
        })),
      };
      return (
        <AuthContext.Provider value={errorContext}>
          <Story />
        </AuthContext.Provider>
      );
    },
  ],
};

export const WithSignUpError: Story = {
  decorators: [
    (Story) => {
      const errorContext = {
        ...mockAuthContext,
        signUp: fn(async () => ({
          error: { message: 'User already registered' } as AuthError,
        })),
      };
      return (
        <AuthContext.Provider value={errorContext}>
          <Story />
        </AuthContext.Provider>
      );
    },
  ],
};
