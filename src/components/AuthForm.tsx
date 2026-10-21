import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ForgotPasswordModal from './ForgotPasswordModal';
import Logo from './Logo';

import styles from './AuthForm.module.css';

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = isSignUp
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password');
        } else if (error.message.includes('User already registered')) {
          setError('An account with this email already exists');
        } else {
          setError(error.message);
        }
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
  };

  return (
    <div className={styles.page}>
      <main className={styles.column}>
        <Logo size={28} />
        <div className={styles.heading}>
          <h1>{isSignUp ? 'Create your account' : 'Sign in to watstix'}</h1>
          <p>Every application, interview and outcome in one place.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className={styles.labelRow}>
              <label htmlFor="password">Password</label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="link-button"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              type="password"
              id="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            {isSignUp && <p className={styles.hint}>At least 6 characters.</p>}
          </div>

          {isSignUp && (
            <div>
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`btn-primary ${styles.submit}`}
          >
            {loading && <span className="spinner-sm" />}
            {loading
              ? isSignUp
                ? 'Creating account…'
                : 'Signing in…'
              : isSignUp
                ? 'Create account'
                : 'Sign in'}
          </button>
        </form>

        <p className={styles.switch}>
          {isSignUp ? 'Already have an account?' : 'New to watstix?'}{' '}
          <button type="button" onClick={switchMode} className="link-button">
            {isSignUp ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </main>

      {showForgotPassword && (
        <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
      )}
    </div>
  );
}
