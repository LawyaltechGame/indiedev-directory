import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { PasswordInput } from '../ui/PasswordInput';
import { Button } from '../ui/Button';

interface LoginModalProps {
  onClose: () => void;
  onSwitchToSignup: () => void;
}

export function LoginModal({ onClose, onSwitchToSignup }: LoginModalProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Welcome Back"
      subtitle="Sign in to your IndieDev Directory account"
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

        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          label="Password"
        />

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
