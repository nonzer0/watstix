import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { AuthError } from '@supabase/supabase-js';
import ResetPassword from '../ResetPassword';

const { mockNavigate, mockUpdatePassword, mockGetSession } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockUpdatePassword: vi.fn(),
  mockGetSession: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ updatePassword: mockUpdatePassword }),
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: { getSession: mockGetSession },
  },
}));

const mockSession = { user: { id: 'user-1' }, access_token: 'token' };

describe('ResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdatePassword.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    // Ensure fake timers never leak between tests
    vi.useRealTimers();
  });

  describe('loading state', () => {
    it('shows spinner while checking session', () => {
      mockGetSession.mockReturnValue(new Promise(() => {}));
      const { container } = render(<ResetPassword />);
      expect(container.querySelector('.spinner')).toBeInTheDocument();
    });
  });

  describe('no valid session', () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({ data: { session: null } });
    });

    it('shows "Invalid Reset Link" heading', async () => {
      render(<ResetPassword />);
      await waitFor(() =>
        expect(
          screen.getByRole('heading', { name: 'Invalid Reset Link' })
        ).toBeInTheDocument()
      );
    });

    it('shows error message about invalid link', async () => {
      render(<ResetPassword />);
      await waitFor(() =>
        expect(
          screen.getByText(
            'Invalid or expired reset link. Please request a new one.'
          )
        ).toBeInTheDocument()
      );
    });

    it('"Back to Login" button navigates to /', async () => {
      render(<ResetPassword />);
      await waitFor(() =>
        screen.getByRole('button', { name: /back to login/i })
      );
      fireEvent.click(screen.getByRole('button', { name: /back to login/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('valid session', () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({ data: { session: mockSession } });
    });

    it('shows the reset password form', async () => {
      render(<ResetPassword />);
      await waitFor(() =>
        expect(screen.getByLabelText('New Password')).toBeInTheDocument()
      );
      expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    });

    it('shows error when password is too short', async () => {
      render(<ResetPassword />);
      await waitFor(() => screen.getByLabelText('New Password'));
      fireEvent.change(screen.getByLabelText('New Password'), {
        target: { value: '123' },
      });
      fireEvent.submit(screen.getByLabelText('New Password').closest('form')!);
      expect(
        screen.getByText('Password must be at least 6 characters')
      ).toBeInTheDocument();
    });

    it('shows error when passwords do not match', async () => {
      render(<ResetPassword />);
      await waitFor(() => screen.getByLabelText('New Password'));
      fireEvent.change(screen.getByLabelText('New Password'), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText('Confirm New Password'), {
        target: { value: 'different456' },
      });
      fireEvent.submit(screen.getByLabelText('New Password').closest('form')!);
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    it('calls updatePassword with the new password', async () => {
      render(<ResetPassword />);
      await waitFor(() => screen.getByLabelText('New Password'));
      fireEvent.change(screen.getByLabelText('New Password'), {
        target: { value: 'newpass123' },
      });
      fireEvent.change(screen.getByLabelText('Confirm New Password'), {
        target: { value: 'newpass123' },
      });
      fireEvent.submit(screen.getByLabelText('New Password').closest('form')!);
      await waitFor(() =>
        expect(mockUpdatePassword).toHaveBeenCalledWith('newpass123')
      );
    });

    it('shows success message after password update', async () => {
      render(<ResetPassword />);
      await waitFor(() => screen.getByLabelText('New Password'));
      fireEvent.change(screen.getByLabelText('New Password'), {
        target: { value: 'newpass123' },
      });
      fireEvent.change(screen.getByLabelText('Confirm New Password'), {
        target: { value: 'newpass123' },
      });
      fireEvent.submit(screen.getByLabelText('New Password').closest('form')!);
      await waitFor(() =>
        expect(
          screen.getByText('Password updated successfully!')
        ).toBeInTheDocument()
      );
    });

    it('navigates to / after 2 seconds on success', async () => {
      render(<ResetPassword />);
      // Wait for the form using real timers before switching to fake
      await waitFor(() => screen.getByLabelText('New Password'));

      vi.useFakeTimers();
      const form = screen.getByLabelText('New Password').closest('form')!;
      fireEvent.change(screen.getByLabelText('New Password'), {
        target: { value: 'newpass123' },
      });
      fireEvent.change(screen.getByLabelText('Confirm New Password'), {
        target: { value: 'newpass123' },
      });

      // Use act to flush the submit event + async updatePassword resolution + state updates
      await act(async () => {
        fireEvent.submit(form);
      });

      // Now advance the fake 2-second timer and flush
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('shows expired error when update returns expired message', async () => {
      mockUpdatePassword.mockResolvedValue({
        error: { message: 'JWT expired' } as AuthError,
      });
      render(<ResetPassword />);
      await waitFor(() => screen.getByLabelText('New Password'));
      fireEvent.change(screen.getByLabelText('New Password'), {
        target: { value: 'newpass123' },
      });
      fireEvent.change(screen.getByLabelText('Confirm New Password'), {
        target: { value: 'newpass123' },
      });
      fireEvent.submit(screen.getByLabelText('New Password').closest('form')!);
      await waitFor(() =>
        expect(
          screen.getByText(
            'Reset link has expired. Please request a new password reset.'
          )
        ).toBeInTheDocument()
      );
    });

    it('shows generic error message from updatePassword', async () => {
      mockUpdatePassword.mockResolvedValue({
        error: { message: 'Something went wrong' } as AuthError,
      });
      render(<ResetPassword />);
      await waitFor(() => screen.getByLabelText('New Password'));
      fireEvent.change(screen.getByLabelText('New Password'), {
        target: { value: 'newpass123' },
      });
      fireEvent.change(screen.getByLabelText('Confirm New Password'), {
        target: { value: 'newpass123' },
      });
      fireEvent.submit(screen.getByLabelText('New Password').closest('form')!);
      await waitFor(() =>
        expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      );
    });
  });
});
