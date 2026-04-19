import { useState } from 'react';
import { Sun } from 'lucide-react';
import { communities } from '../data/seed';

export default function Login({ onLogin, onShowSignup }) {
  const [email, setEmail] = useState('alex@solarsync.io');
  const [pass, setPass] = useState('password123');

  return (
    <div className="min-h-screen flex items-center justify-center px-5"
         style={{ background: '#050505' }}>
      {/* BG grid already on body */}

      {/* Glow orbs */}
      <div style={{
        position: 'fixed', top: '20%', left: '10%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(57,255,20,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: '15%', right: '10%',
        width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,240,255,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div className="w-full max-w-sm animate-fade-in" style={{ position: 'relative', zIndex: 1 }}>
        <div className="glass-neon rounded-2xl p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: 'rgba(57,255,20,0.12)', border: '1px solid var(--border-neon)', boxShadow: 'var(--glow-neon)' }}>
              <Sun size={20} style={{ color: '#39FF14' }} />
            </div>
            <div>
              <div className="font-outfit font-bold text-base" style={{ color: '#39FF14', textShadow: '0 0 12px rgba(57,255,20,0.5)' }}>
                SolarSync AI
              </div>
              <div className="text-[10px] tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                Intelligent Energy Orchestrator
              </div>
            </div>
          </div>

          <h2 className="font-outfit font-bold text-xl mb-1" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Sign in to your energy dashboard</p>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Sans' }}>
                Email address
              </label>
              <input
                id="login-email"
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Sans' }}>
                Password
              </label>
              <input
                id="login-password"
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={pass}
                onChange={e => setPass(e.target.value)}
              />
            </div>
            <button
              id="login-submit-btn"
              className="btn-neon w-full py-3 text-sm mt-1 font-outfit font-semibold"
              onClick={onLogin}
            >
              Sign in →
            </button>
          </div>

          <p className="text-center text-sm mt-5" style={{ color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <span className="cursor-pointer font-medium" style={{ color: 'var(--electric)' }} onClick={onShowSignup}>
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
