import { useState } from 'react';
import { X, Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import styles from './ForgotPasswordModal.module.css';

interface ForgotPasswordModalProps {
  onClose: () => void;
}

export default function ForgotPasswordModal({
  onClose,
}: ForgotPasswordModalProps) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic email validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const { error: resetError } = await resetPassword(email);

      if (resetError) {
        throw resetError;
      }

      setSuccess(true);
    } catch (err) {
      // Don't reveal if email exists (security best practice)
      setError('Failed to send reset email. Please try again.');
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className={styles.modal}>
        <div className="modal-header">
          <h2>Reset Password</h2>
          <button onClick={onClose} className="modal-close">
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-body">
          {error && <div className="error">{error}</div>}

          {success ? (
            <>
              <div className="alert-success">
                <CheckCircle />
                <div>
                  <p>
                    <strong>Check your email</strong>
                  </p>
                  <p>
                    We've sent a password reset link to <strong>{email}</strong>
                    . Click the link in the email to reset your password.
                  </p>
                </div>
              </div>
              <div className={styles.successFooter}>
                <button type="button" onClick={onClose} className="btn-primary">
                  Close
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <p>
                  Enter your email address and we'll send you a link to reset
                  your password.
                </p>
                <fieldset>
                  <legend>Email</legend>
                  <div className="input-with-icon">
                    <Mail />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                </fieldset>
              </div>

              <div className="form-footer">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
