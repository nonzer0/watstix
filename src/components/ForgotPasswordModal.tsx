import { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Dialog from './Dialog';
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
    <Dialog title="Reset password" onClose={onClose} size="sm">
      {success ? (
        <div className={styles.stack}>
          <div className="alert-success">
            <CheckCircle />
            <p>
              If an account exists for <strong>{email}</strong>, a reset link is
              on its way. Follow the link in the email to choose a new password.
            </p>
          </div>
          <div className="form-footer">
            <button type="button" onClick={onClose} className="btn-primary">
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <p>We'll email you a link to choose a new password.</p>

          {error && <div className="error">{error}</div>}

          <div>
            <label htmlFor="reset-email">Email</label>
            <div className="input-with-icon">
              <Mail />
              <input
                type="email"
                id="reset-email"
                name="email"
                required
                data-autofocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="form-footer">
            <button type="button" onClick={onClose} className="btn">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
