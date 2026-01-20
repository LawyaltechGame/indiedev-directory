import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface ForgotPasswordModalProps {
  onClose: () => void;
  onBackToLogin: () => void;
}

export function ForgotPasswordModal({ onClose, onBackToLogin }: ForgotPasswordModalProps) {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      await requestPasswordReset(email, redirectUrl);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Modal
        isOpen={true}
        onClose={onClose}
        title="Check Your Email"
        subtitle="Password reset instructions sent"
      >
        <div className="space-y-4">
          <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-200 text-sm">
            <p className="font-semibold mb-2">Email sent successfully!</p>
            <p>
              We've sent password reset instructions to <strong>{email}</strong>.
              Please check your inbox and follow the link to reset your password.
            </p>
          </div>

          <div className="text-sm text-cyan-200 text-center">
            <p className="mb-2">Didn't receive the email?</p>
            <ul className="text-left space-y-1 text-xs text-cyan-300/80">
              <li>• Check your spam/junk folder</li>
              <li>• Make sure you entered the correct email address</li>
              <li>• Wait a few minutes and try again</li>
            </ul>
          </div>

          <Button
            onClick={onBackToLogin}
            fullWidth
            size="lg"
          >
            Back to Sign In
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Reset Password"
      subtitle="Enter your email to receive reset instructions"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@studio.com"
          required
          label="Email"
        />

        <Button
          type="submit"
          disabled={loading}
          loading={loading}
          fullWidth
          size="lg"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>
      
      <div className="mt-6 text-center text-cyan-200 text-sm">
        Remember your password?{' '}
        <button
          onClick={onBackToLogin}
          className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors"
        >
          Sign in
        </button>
      </div>
    </Modal>
  );
}
