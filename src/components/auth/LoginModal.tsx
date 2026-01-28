import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { PasswordInput } from '../ui/PasswordInput';
import { Button } from '../ui/Button';

interface LoginModalProps {
  onClose: () => void;
  onSwitchToSignup: () => void;
  onSwitchToForgotPassword: () => void;
}

export function LoginModal({ onClose, onSwitchToSignup, onSwitchToForgotPassword }: LoginModalProps) {
  const { login, resendVerificationEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVerificationError, setIsVerificationError] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerificationError(false);
    setResendStatus('idle');
    setLoading(true);

    try {
      await login(email, password);
      onClose();
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      // Detect if it's a verification error
      if (errorMessage.toLowerCase().includes('verify') && errorMessage.toLowerCase().includes('email')) {
        setIsVerificationError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email || !password) {
      setError('Please enter your email and password to resend verification.');
      return;
    }
    setResendStatus('sending');
    setError('');
    try {
      await resendVerificationEmail(email, password);
      setResendStatus('sent');
    } catch (err: any) {
      setResendStatus('idle');
      setError(err?.message || 'Failed to resend verification email.');
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Welcome Back"
      subtitle="Sign in to your Game Centralen account"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
          {error}
        </div>
      )}

      {isVerificationError && resendStatus !== 'sent' && (
        <div className="mb-4 p-3 bg-yellow-500/15 border border-yellow-500/40 rounded-xl text-yellow-200 text-sm">
          <p className="mb-2">Your email is not verified yet. Click below to resend the verification email.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            loading={resendStatus === 'sending'}
            disabled={resendStatus === 'sending'}
            onClick={handleResendVerification}
          >
            {resendStatus === 'sending' ? 'Sending...' : 'Resend verification email'}
          </Button>
        </div>
      )}

      {resendStatus === 'sent' && (
        <div className="mb-4 p-3 bg-green-500/15 border border-green-500/40 rounded-xl text-green-200 text-sm">
          Verification email sent! Please check your inbox and click the link to verify your account.
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

        <div>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            label="Password"
          />
          <div className="mt-2 text-right">
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors underline underline-offset-2"
            >
              Forgot Password?
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          loading={loading}
          fullWidth
          size="lg"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
      
      <div className="mt-6 text-center text-cyan-200 text-sm">
        Don't have an account?{' '}
        <button
          onClick={onSwitchToSignup}
          className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors"
        >
          Sign up
        </button>
      </div>
    </Modal>
  );
}
