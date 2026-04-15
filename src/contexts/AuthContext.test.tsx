import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Session, User } from '@supabase/supabase-js';
import { AuthProvider, useAuth } from './AuthContext';

type AuthStateChangeCallback = (event: string, session: Session | null) => void;

let capturedAuthStateCallback: AuthStateChangeCallback | null = null;

const {
  mockGetSession,
  mockOnAuthStateChange,
  mockSignUp,
  mockSignInWithPassword,
  mockSignOut,
  mockResetPasswordForEmail,
  mockUpdateUser,
  mockUnsubscribe,
} = vi.hoisted(() => {
  const mockUnsubscribe = vi.fn();
  return {
    mockGetSession: vi.fn(),
    mockOnAuthStateChange: vi.fn(),
    mockSignUp: vi.fn(),
    mockSignInWithPassword: vi.fn(),
    mockSignOut: vi.fn(),
    mockResetPasswordForEmail: vi.fn(),
    mockUpdateUser: vi.fn(),
    mockUnsubscribe,
  };
});

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signUp: mockSignUp,
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
      resetPasswordForEmail: mockResetPasswordForEmail,
      updateUser: mockUpdateUser,
    },
  },
}));

const mockUser: User = {
  id: 'user-123',
  email: 'user@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2026-01-01T00:00:00.000Z',
};

const mockSession: Session = {
  access_token: 'token',
  refresh_token: 'refresh',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser,
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedAuthStateCallback = null;
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockImplementation((cb: AuthStateChangeCallback) => {
      capturedAuthStateCallback = cb;
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });
  });

  it('starts with loading true', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.loading).toBe(true);
  });

  it('sets loading to false and user to null when no session', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it('sets user and session from initial getSession', async () => {
    mockGetSession.mockResolvedValue({ data: { session: mockSession } });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.session).toEqual(mockSession);
  });

  it('updates user when onAuthStateChange fires with a new session', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      capturedAuthStateCallback!('SIGNED_IN', mockSession);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.session).toEqual(mockSession);
  });

  it('clears user when onAuthStateChange fires with null session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: mockSession } });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.user).toEqual(mockUser));

    await act(async () => {
      capturedAuthStateCallback!('SIGNED_OUT', null);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it('calls supabase.auth.signUp with email and password', async () => {
    mockSignUp.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signUp('a@example.com', 'pass123');
    });

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'a@example.com',
      password: 'pass123',
    });
  });

  it('calls supabase.auth.signInWithPassword with email and password', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signIn('a@example.com', 'pass123');
    });

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'a@example.com',
      password: 'pass123',
    });
  });

  it('calls supabase.auth.signOut', async () => {
    mockSignOut.mockResolvedValue({});
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('calls supabase.auth.resetPasswordForEmail with email', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.resetPassword('a@example.com');
    });

    expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
      'a@example.com',
      expect.objectContaining({
        redirectTo: expect.stringContaining('/reset-password'),
      })
    );
  });

  it('calls supabase.auth.updateUser with new password', async () => {
    mockUpdateUser.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updatePassword('newpass123');
    });

    expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'newpass123' });
  });

  it('unsubscribes from auth state changes on unmount', async () => {
    const { unmount } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(mockOnAuthStateChange).toHaveBeenCalled());
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
