import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { PasswordInput } from '../ui/PasswordInput';
import { Button } from '../ui/Button';

interface SignupModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export function SignupModal({ onClose, onSwitchToLogin }: SignupModalProps) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, name);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Join the Community"
      subtitle="Create your Game Centralen account"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Full Name"
          required
          label="Full Name"
        />

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
          minLength={8}
          label="Password"
          helperText="Must be at least 8 characters"
        />

        <PasswordInput
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
          label="Confirm Password"
        />

        <Button
          type="submit"
          disabled={loading}
          loading={loading}
          fullWidth
          size="lg"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </Button>
      </form>
      
      <div className="mt-6 text-center text-cyan-200 text-sm">
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors"
        >
          Sign in
        </button>
      </div>
    </Modal>
  );
}
