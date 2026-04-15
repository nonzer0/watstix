import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ForgotPasswordModal from '../ForgotPasswordModal';

const { mockResetPassword } = vi.hoisted(() => ({
  mockResetPassword: vi.fn(),
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ resetPassword: mockResetPassword }),
}));

describe('ForgotPasswordModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResetPassword.mockResolvedValue({ error: null });
  });

  it('renders email input', () => {
    render(<ForgotPasswordModal onClose={vi.fn()} />);
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });

  it('cancel button calls onClose', () => {
    const onClose = vi.fn();
    render(<ForgotPasswordModal onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('X close button calls onClose', () => {
    const onClose = vi.fn();
    render(<ForgotPasswordModal onClose={onClose} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it('shows validation error for invalid email', async () => {
    render(<ForgotPasswordModal onClose={vi.fn()} />);
    const form = screen
      .getByPlaceholderText('you@example.com')
      .closest('form')!;
    fireEvent.submit(form);
    await waitFor(() =>
      expect(
        screen.getByText('Please enter a valid email address')
      ).toBeInTheDocument()
    );
  });

  it('calls resetPassword with the entered email', async () => {
    render(<ForgotPasswordModal onClose={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.submit(
      screen.getByPlaceholderText('you@example.com').closest('form')!
    );
    await waitFor(() =>
      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com')
    );
  });

  it('shows success state after successful reset', async () => {
    render(<ForgotPasswordModal onClose={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.submit(
      screen.getByPlaceholderText('you@example.com').closest('form')!
    );
    await waitFor(() =>
      expect(screen.getByText('Check your email')).toBeInTheDocument()
    );
  });

  it('close button in success state calls onClose', async () => {
    const onClose = vi.fn();
    render(<ForgotPasswordModal onClose={onClose} />);
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.submit(
      screen.getByPlaceholderText('you@example.com').closest('form')!
    );
    await waitFor(() => screen.getByText('Check your email'));
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows error when resetPassword throws', async () => {
    mockResetPassword.mockRejectedValue(new Error('Network error'));
    render(<ForgotPasswordModal onClose={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.submit(
      screen.getByPlaceholderText('you@example.com').closest('form')!
    );
    await waitFor(() =>
      expect(
        screen.getByText('Failed to send reset email. Please try again.')
      ).toBeInTheDocument()
    );
  });
});
