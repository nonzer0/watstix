import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, LogIn, UserPlus } from 'lucide-react';
import ForgotPasswordModal from './ForgotPasswordModal';

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

  return (
    <div className={styles.outer_wrapper}>
      <div className={styles.main_section}>
        <div className={styles.header}>
          <div className={styles.icon}>
            <Briefcase />
          </div>
          <h1>Job Application Tracker</h1>
          <p>Track and manage your job applications in one place</p>
        </div>

        <div className={styles.card}>
          <div className={styles.tabList}>
            <button
              onClick={() => {
                setIsSignUp(false);
                setError(null);
              }}
              className={`${styles.tab} ${
                !isSignUp ? styles.tabActive : styles.tabInactive
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsSignUp(true);
                setError(null);
              }}
              className={`${styles.tab} ${
                isSignUp ? styles.tabActive : styles.tabInactive
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className={styles.error}>{error}</div>}

            <div>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
              {!isSignUp && (
                <div className={styles.forgotPassword}>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="link-button"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
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
              className={`btn-primary ${styles.submitButton}`}
            >
              {loading ? (
                <>
                  <div className={styles.spinner}></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                <>
                  {isSignUp ? (
                    <UserPlus className={styles.buttonIcon} />
                  ) : (
                    <LogIn className={styles.buttonIcon} />
                  )}
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </>
              )}
            </button>
          </form>

          <div className={styles.divider}>
            <div className={styles.footer}>
              <p>
                {isSignUp
                  ? 'Already have an account?'
                  : "Don't have an account?"}{' '}
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                  }}
                  className="link-button"
                >
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {showForgotPassword && (
        <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
      )}
    </div>
  );
}
