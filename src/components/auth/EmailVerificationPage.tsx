import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'success' | 'error'>('success');
  const [message, setMessage] = useState<string>('Your email has been verified. You can now sign in to your account.');

  useEffect(() => {
    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');

    if (!userId || !secret) {
      setStatus('error');
      setMessage('Invalid verification link. Please use the link from your email.');
      return;
    }
    // Appwrite has already processed the verification before redirecting here.
    // We just show a friendly success message.
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-bg text-white flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center bg-[rgba(20,28,42,0.9)] border border-white/8 rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl"
          style={{
            background:
              status === 'success'
                ? 'rgba(34,197,94,0.2)'
                : 'rgba(248,113,113,0.2)',
          }}
        >
          {status === 'success' ? '✓' : '!'}
        </div>
        <h1 className="text-2xl font-bold mb-3 bg-linear-to-r from-cyan-100 to-cyan-300 bg-clip-text text-transparent">
          Email Verification
        </h1>
        <p className="text-cyan-200 mb-6 text-sm">{message}</p>
        <button
          onClick={() => navigate('/')}
          className="h-11 px-5 bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] rounded-xl font-extrabold border-0 cursor-pointer transition-all duration-200 hover:from-cyan-400 hover:to-cyan-500 shadow-[0_8px_22px_rgba(34,211,238,0.35)]"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

