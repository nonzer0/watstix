import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuthForm from '../AuthForm';

const { mockSignIn, mockSignUp } = vi.hoisted(() => ({
  mockSignIn: vi.fn(),
  mockSignUp: vi.fn(),
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ signIn: mockSignIn, signUp: mockSignUp }),
}));

vi.mock('../ForgotPasswordModal', () => ({
  default: () => <div data-testid="forgot-password-modal" />,
}));

// The Sign Up tab has text "Sign Up" (capital U).
// The footer link has text "Sign up" (lowercase u).
// Use case-sensitive regex to distinguish them.
const SIGN_UP_TAB = /^Sign Up$/;

describe('AuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignIn.mockResolvedValue({ error: null });
    mockSignUp.mockResolvedValue({ error: null });
  });

  it('renders Sign In and Sign Up tabs', () => {
    render(<AuthForm />);
    expect(
      screen.getAllByRole('button', { name: /sign in/i }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('button', { name: /sign up/i }).length
    ).toBeGreaterThan(0);
  });

  it('shows Email and Password fields in sign-in mode', () => {
    render(<AuthForm />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('shows Confirm Password field after switching to sign-up mode', () => {
    render(<AuthForm />);
    fireEvent.click(screen.getByRole('button', { name: SIGN_UP_TAB }));
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
  });

  it('shows "Forgot Password?" link in sign-in mode', () => {
    render(<AuthForm />);
    expect(
      screen.getByRole('button', { name: /forgot password/i })
    ).toBeInTheDocument();
  });

  it('does not show "Forgot Password?" link in sign-up mode', () => {
    render(<AuthForm />);
    fireEvent.click(screen.getByRole('button', { name: SIGN_UP_TAB }));
    expect(
      screen.queryByRole('button', { name: /forgot password/i })
    ).not.toBeInTheDocument();
  });

  it('shows ForgotPasswordModal when "Forgot Password?" is clicked', () => {
    render(<AuthForm />);
    fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
    expect(screen.getByTestId('forgot-password-modal')).toBeInTheDocument();
  });

  it('shows error when password is too short', async () => {
    render(<AuthForm />);
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: '12345' },
    });
    fireEvent.submit(screen.getByLabelText('Email').closest('form')!);
    await waitFor(() =>
      expect(
        screen.getByText('Password must be at least 6 characters')
      ).toBeInTheDocument()
    );
  });

  it('shows error when sign-up passwords do not match', async () => {
    render(<AuthForm />);
    fireEvent.click(screen.getByRole('button', { name: SIGN_UP_TAB }));
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'different456' },
    });
    fireEvent.submit(screen.getByLabelText('Email').closest('form')!);
    await waitFor(() =>
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    );
  });

  it('calls signIn with email and password', async () => {
    render(<AuthForm />);
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'mypassword' },
    });
    fireEvent.submit(screen.getByLabelText('Email').closest('form')!);
    await waitFor(() =>
      expect(mockSignIn).toHaveBeenCalledWith('user@example.com', 'mypassword')
    );
  });

  it('calls signUp with email and password', async () => {
    render(<AuthForm />);
    fireEvent.click(screen.getByRole('button', { name: SIGN_UP_TAB }));
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'mypassword' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'mypassword' },
    });
    fireEvent.submit(screen.getByLabelText('Email').closest('form')!);
    await waitFor(() =>
      expect(mockSignUp).toHaveBeenCalledWith('new@example.com', 'mypassword')
    );
  });

  it('maps "Invalid login credentials" to user-friendly message', async () => {
    mockSignIn.mockResolvedValue({
      error: { message: 'Invalid login credentials' },
    });
    render(<AuthForm />);
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'mypassword' },
    });
    fireEvent.submit(screen.getByLabelText('Email').closest('form')!);
    await waitFor(() =>
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
    );
  });

  it('maps "User already registered" to user-friendly message', async () => {
    mockSignUp.mockResolvedValue({
      error: { message: 'User already registered' },
    });
    render(<AuthForm />);
    fireEvent.click(screen.getByRole('button', { name: SIGN_UP_TAB }));
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'mypassword' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'mypassword' },
    });
    fireEvent.submit(screen.getByLabelText('Email').closest('form')!);
    await waitFor(() =>
      expect(
        screen.getByText('An account with this email already exists')
      ).toBeInTheDocument()
    );
  });

  it('clears error when switching tabs', async () => {
    mockSignIn.mockResolvedValue({
      error: { message: 'Invalid login credentials' },
    });
    render(<AuthForm />);
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'mypassword' },
    });
    fireEvent.submit(screen.getByLabelText('Email').closest('form')!);
    await waitFor(() => screen.getByText('Invalid email or password'));
    fireEvent.click(screen.getByRole('button', { name: SIGN_UP_TAB }));
    expect(
      screen.queryByText('Invalid email or password')
    ).not.toBeInTheDocument();
  });
});
