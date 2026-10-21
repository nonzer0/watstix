import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CheckCircle } from 'lucide-react';
import Logo from '../components/Logo';
import styles from './ResetPassword.module.css';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasValidToken, setHasValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    // Check if user has a valid session (came from reset email link)
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setHasValidToken(true);
        } else {
          setError('Invalid or expired reset link. Please request a new one.');
        }
      } catch (err) {
        setError('Failed to verify reset link. Please try again.');
        console.error('Session check error:', err);
      } finally {
        setCheckingToken(false);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await updatePassword(newPassword);

      if (updateError) {
        if (updateError.message.includes('expired')) {
          setError(
            'Reset link has expired. Please request a new password reset.'
          );
        } else {
          setError(updateError.message);
        }
      } else {
        setSuccess(true);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Password update error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className={styles.page}>
        <div className="spinner" aria-label="Checking reset link" />
      </div>
    );
  }

  if (!hasValidToken) {
    return (
      <div className={styles.page}>
        <main className={styles.column}>
          <Logo size={28} />
          <div className={styles.heading}>
            <h1>Reset link invalid</h1>
            <p>{error ?? 'This link has expired or was already used.'}</p>
          </div>
          <button onClick={() => navigate('/')} className="btn">
            Back to sign in
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.column}>
        <Logo size={28} />
        <div className={styles.heading}>
          <h1>Choose a new password</h1>
          <p>You'll be signed in once it's saved.</p>
        </div>

        {success ? (
          <div className="alert-success" role="status">
            <CheckCircle />
            <p>Password updated. Redirecting…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error" role="alert">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="newPassword">New password</label>
              <input
                type="password"
                id="newPassword"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoFocus
                placeholder="••••••••"
              />
              <p className={styles.hint}>At least 6 characters.</p>
            </div>

            <div>
              <label htmlFor="confirmPassword">Confirm new password</label>
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

            <button
              type="submit"
              disabled={loading}
              className={`btn-primary ${styles.submit}`}
            >
              {loading && <span className="spinner-sm" />}
              {loading ? 'Saving…' : 'Save password'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
