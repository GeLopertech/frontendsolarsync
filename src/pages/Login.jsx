import { useState } from 'react';
import { Sun } from 'lucide-react';
import { communities } from '../data/seed';

export default function Login({ onLogin, onShowSignup }) {
  const [email,     setEmail]     = useState('demo@solarsync.ai');
  const [pass,      setPass]      = useState('SolarSync2025!');
  const [community, setCommunity] = useState('');
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [view,      setView]      = useState('login'); // 'login' | 'forgot'
  const [fpEmail,   setFpEmail]   = useState('');
  const [fpSent,    setFpSent]    = useState(false);

  const handleLogin = async () => {
    if (!email || !pass) { setError('Please enter email and password.'); return; }
    if (!community)      { setError('Please select your community.'); return; }
    setError(''); setLoading(true);
    try { await onLogin(email, pass); }
    catch (err) { setError(err.message || 'Login failed.'); }
    finally { setLoading(false); }
  };

  const handleForgot = () => {
    if (!fpEmail) { setError('Enter your email address.'); return; }
    setError('');
    // TODO: call POST /api/auth/forgot-password in production
    setTimeout(() => setFpSent(true), 800);
  };

  const selectedCommunity = communities.find(c => c.value === community);

  /* ── FORGOT PASSWORD SCREEN ── */
  if (view === 'forgot') {
    return (
      <div className="min-h-screen flex items-center justify-center px-5" style={{ background: '#050505' }}>
        <div className="w-full max-w-sm animate-fade-in" style={{ position: 'relative', zIndex: 1 }}>
          <div className="glass-neon rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                   style={{ background: 'rgba(57,255,20,0.12)', border: '1px solid var(--border-neon)' }}>
                <Sun size={20} style={{ color: '#39FF14' }} />
              </div>
              <div>
                <div className="font-outfit font-bold text-base" style={{ color: '#39FF14' }}>SolarSync AI</div>
                <div className="text-[10px] tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Reset Password</div>
              </div>
            </div>

            {fpSent ? (
              <div className="text-center py-4">
                <div style={{ fontSize: 44, marginBottom: 12 }}>📬</div>
                <div className="font-outfit font-bold text-base mb-2" style={{ color: '#39FF14' }}>Check your inbox</div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  A reset link was sent to <span style={{ color: 'var(--text-primary)' }}>{fpEmail}</span>
                </p>
                <button className="btn-neon w-full py-3 text-sm mt-6 font-outfit font-semibold"
                  onClick={() => { setView('login'); setFpSent(false); setFpEmail(''); }}>
                  ← Back to Sign in
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-outfit font-bold text-xl mb-1" style={{ color: 'var(--text-primary)' }}>Forgot password?</h2>
                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>We'll send a reset link to your email</p>

                {error && (
                  <div className="mb-4 px-4 py-3 rounded-xl text-xs"
                       style={{ background: 'rgba(255,59,92,0.1)', border: '1px solid rgba(255,59,92,0.3)', color: '#FF3B5C' }}>
                    {error}
                  </div>
                )}
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email address</label>
                    <input className="form-input" type="email" placeholder="you@example.com"
                      value={fpEmail} onChange={e => setFpEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleForgot()} />
                  </div>
                  <button className="btn-neon w-full py-3 text-sm font-outfit font-semibold" onClick={handleForgot}>
                    Send reset link →
                  </button>
                  <button style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}
                    onClick={() => { setView('login'); setError(''); }}>
                    ← Back to sign in
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── LOGIN SCREEN ── */
  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ background: '#050505' }}>
      <div style={{ position: 'fixed', top: '20%', left: '10%', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(57,255,20,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '15%', right: '10%', width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,240,255,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div className="w-full max-w-sm animate-fade-in" style={{ position: 'relative', zIndex: 1 }}>
        <div className="glass-neon rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: 'rgba(57,255,20,0.12)', border: '1px solid var(--border-neon)', boxShadow: 'var(--glow-neon)' }}>
              <Sun size={20} style={{ color: '#39FF14' }} />
            </div>
            <div>
              <div className="font-outfit font-bold text-base" style={{ color: '#39FF14', textShadow: '0 0 12px rgba(57,255,20,0.5)' }}>SolarSync AI</div>
              <div className="text-[10px] tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Intelligent Energy Orchestrator</div>
            </div>
          </div>

          <h2 className="font-outfit font-bold text-xl mb-1" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Sign in to your energy dashboard</p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-xs"
                 style={{ background: 'rgba(255,59,92,0.1)', border: '1px solid rgba(255,59,92,0.3)', color: '#FF3B5C' }}>
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email address</label>
              <input className="form-input" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()} disabled={loading} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Password</label>
                <span className="text-xs cursor-pointer" style={{ color: 'var(--electric)' }}
                  onClick={() => { setView('forgot'); setError(''); }}>
                  Forgot password?
                </span>
              </div>
              <input className="form-input" type="password" placeholder="••••••••"
                value={pass} onChange={e => setPass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()} disabled={loading} />
            </div>

            {/* Community selector */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Community <span style={{ color: '#FF3B5C' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <select className="form-select" value={community}
                  onChange={e => setCommunity(e.target.value)} disabled={loading}>
                  <option value="">— Select your community —</option>
                  {communities.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', pointerEvents: 'none', fontSize: 12 }}>▾</span>
              </div>
              {selectedCommunity && (
                <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                  {selectedCommunity.members} members · {selectedCommunity.label.split(' ')[0]}
                </p>
              )}
            </div>

            <button className="btn-neon w-full py-3 text-sm mt-1 font-outfit font-semibold"
              onClick={handleLogin} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? '⏳ Signing in…' : 'Sign in →'}
            </button>
          </div>

          <div className="mt-4 px-4 py-3 rounded-xl text-xs text-center"
               style={{ background: 'rgba(57,255,20,0.05)', border: '1px solid rgba(57,255,20,0.15)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Demo: </span>
            <span style={{ color: '#39FF14', fontFamily: 'JetBrains Mono' }}>demo@solarsync.ai</span>
            <span style={{ color: 'var(--text-muted)' }}> / </span>
            <span style={{ color: '#39FF14', fontFamily: 'JetBrains Mono' }}>SolarSync2025!</span>
          </div>

          <p className="text-center text-sm mt-5" style={{ color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <span className="cursor-pointer font-medium" style={{ color: 'var(--electric)' }} onClick={onShowSignup}>Sign up</span>
          </p>
        </div>
      </div>
    </div>
  );
}
