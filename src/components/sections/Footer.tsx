import React, { useState } from 'react';
import { submitNewsletter } from '../../services/newsletter';
export function Footer() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async () => {
    if (!name || !email) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      await submitNewsletter(name, email);
      setStatus('success');
      setName('');
      setEmail('');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  return (
    <footer className="mt-0 border-t border-white/8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 py-8 md:py-12">
        <div>
          <h4 className="font-bold mb-2 text-base md:text-lg">About</h4>
          <p className="text-cyan-200 text-sm">
            Game Centralen is a curated hub for discovering indie game
            studios globally.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-2 text-base md:text-lg">Contact</h4>
          <p className="text-cyan-200 text-sm break-all">hello@gamecentralen.com</p>
        </div>
        <div>
          <h4 className="font-bold mb-2 text-base md:text-lg">Newsletter</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ background: 'rgba(10,16,28,0.65)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#a5f3fc', padding: '10px 12px', fontSize: '14px', outline: 'none' }}
            />
            <input
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ background: 'rgba(10,16,28,0.65)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#a5f3fc', padding: '10px 12px', fontSize: '14px', outline: 'none' }}
            />
            <button
              onClick={handleSubscribe}
              type="button"
              style={{ background: '#0891b2', color: '#fff', fontWeight: 'bold', padding: '10px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px' }}
            >
              {status === 'loading' ? 'Submitting...' : 'Subscribe'}
            </button>
            {status === 'success' && <p style={{ color: '#4ade80', marginTop: '4px', fontSize: '13px' }}>✅ Subscribed!</p>}
            {status === 'error' && <p style={{ color: '#f87171', marginTop: '4px', fontSize: '13px' }}>❌ Please fill both fields.</p>}
          </div>
        </div>
      </div>
      <div className="text-cyan-200 text-center text-xs md:text-sm py-4 pb-6 px-4">
        © {new Date().getFullYear()} Game Centralen. All rights reserved.
      </div>
    </footer>
  );
}
