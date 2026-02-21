import { useState } from 'react';
import { X, Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-base-200 rounded-lg shadow-xl max-w-md w-full">
        <div className="sticky top-0 bg-base-200 border-b border-base-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-color-neutral">
            Reset Password
          </h2>
          <button
            onClick={onClose}
            className="text-color-neutral hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm">
              {error}
            </div>
          )}

          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-sm flex items-start gap-3">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Check your email</p>
                <p className="text-sm mt-1">
                  We've sent a password reset link to <strong>{email}</strong>.
                  Click the link in the email to reset your password.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div>
                <p className="text-sm text-color-neutral mb-4">
                  Enter your email address and we'll send you a link to reset
                  your password.
                </p>
                <fieldset className="fieldset">
                  <legend className="legend">Email</legend>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input input-neutral pl-10"
                    />
                  </div>
                </fieldset>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary btn-lg px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg px-4"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </>
          )}

          {success && (
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-primary btn-lg px-4"
              >
                Close
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
