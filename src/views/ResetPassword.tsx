import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Briefcase, Lock, CheckCircle } from 'lucide-react';
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
      <div className={styles.loadingPage}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!hasValidToken) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.icon}>
              <Briefcase />
            </div>
            <h1>Invalid Reset Link</h1>
          </div>
          <div className={styles.card}>
            {error && <div className="error">{error}</div>}
            <button onClick={() => navigate('/')} className="btn-primary">
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.icon}>
            <Briefcase />
          </div>
          <h1>Reset Password</h1>
          <p>Enter your new password below</p>
        </div>

        <div className={styles.card}>
          {success ? (
            <div className="alert-success">
              <CheckCircle />
              <div>
                <p>
                  <strong>Password updated successfully!</strong>
                </p>
                <p>Redirecting to login...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="error">{error}</div>}

              <div>
                <label htmlFor="newPassword">New Password</label>
                <div className={styles.inputIcon}>
                  <Lock />
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>
                <p className={styles.hint}>Minimum 6 characters</p>
              </div>

              <div>
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className={styles.inputIcon}>
                  <Lock />
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? (
                  <>
                    <div className={styles.spinnerSm}></div>
                    Updating Password...
                  </>
                ) : (
                  <>
                    <Lock />
                    Update Password
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
