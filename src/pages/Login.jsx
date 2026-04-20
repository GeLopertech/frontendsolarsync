import { useState } from 'react';
import { Sun } from 'lucide-react';
import { communities } from '../data/seed';
import { useUserProfile } from '../context/UserContext';

const EB_RATES = {
  sunnyvale: { name: 'TANGEDCO', rate: 6.5,  currency: '₹', slab: '0–100 units ₹0, 101–200 ₹1.5, 201–500 ₹3, >500 ₹6.5' },
  greenpark:  { name: 'KSEB',    rate: 7.2,  currency: '₹', slab: '0–50 units ₹2.9, 51–100 ₹3.25, >100 ₹7.2' },
  solarhill:  { name: 'BESCOM',  rate: 6.85, currency: '₹', slab: '0–30 units free, 31–100 ₹5, >100 ₹6.85' },
  ecoblock:   { name: 'TNEB',    rate: 6.2,  currency: '₹', slab: '0–100 units ₹0, 101–200 ₹1.5, >200 ₹6.2' },
  brightzone: { name: 'MSEDCL',  rate: 7.5,  currency: '₹', slab: '0–100 units ₹3.24, 101–300 ₹6.07, >300 ₹7.5' },
};

export default function Login({ onLogin, onShowSignup }) {
  const { saveProfile } = useUserProfile();
  const [email,       setEmail]       = useState('demo@solarsync.ai');
  const [pass,        setPass]        = useState('SolarSync2025!');
  const [community,   setCommunity]   = useState('');
  const [connType,    setConnType]    = useState('both');   // 'solar' | 'grid' | 'both'
  const [usageLimit,  setUsageLimit]  = useState('300');    // monthly kWh limit
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [view,        setView]        = useState('login');  // 'login' | 'forgot'
  const [fpEmail,     setFpEmail]     = useState('');
  const [fpSent,      setFpSent]      = useState(false);

  const selectedCommunity = communities.find(c => c.value === community);
  const ebInfo = EB_RATES[community] || null;

  const handleLogin = async () => {
    if (!email || !pass)  { setError('Please enter email and password.'); return; }
    if (!community)       { setError('Please select your community.'); return; }
    setError(''); setLoading(true);
    try {
      await onLogin(email, pass);
      // Save user profile choices
      saveProfile({
        community,
        communityLabel: selectedCommunity?.label || community,
        communityMembers: selectedCommunity?.members || 0,
        connType,        // 'solar' | 'grid' | 'both'
        usageLimitKwh: parseFloat(usageLimit) || 300,
        ebRate: ebInfo?.rate || 6.5,
        ebName: ebInfo?.name || 'EB',
        currency: ebInfo?.currency || '₹',
      });
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = () => {
    if (!fpEmail) { setError('Enter your email address.'); return; }
    setError('');
    setTimeout(() => setFpSent(true), 800);
  };

  /* ── FORGOT PASSWORD ── */
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
                  Reset link sent to <span style={{ color: 'var(--text-primary)' }}>{fpEmail}</span>
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
                       style={{ background: 'rgba(255,59,92,0.1)', border: '1px solid rgba(255,59,92,0.3)', color: '#FF3B5C' }}>{error}</div>
                )}
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email address</label>
                    <input className="form-input" type="email" placeholder="you@example.com"
                      value={fpEmail} onChange={e => setFpEmail(e.target.value)} />
                  </div>
                  <button className="btn-neon w-full py-3 text-sm font-outfit font-semibold" onClick={handleForgot}>Send reset link →</button>
                  <button style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}
                    onClick={() => { setView('login'); setError(''); }}>← Back to sign in</button>
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
    <div className="min-h-screen flex items-center justify-center px-5 py-8" style={{ background: '#050505' }}>
      <div style={{ position: 'fixed', top: '20%', left: '10%', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(57,255,20,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '15%', right: '10%', width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,240,255,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div className="w-full max-w-md animate-fade-in" style={{ position: 'relative', zIndex: 1 }}>
        <div className="glass-neon rounded-2xl p-8">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-7">
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
                 style={{ background: 'rgba(255,59,92,0.1)', border: '1px solid rgba(255,59,92,0.3)', color: '#FF3B5C' }}>{error}</div>
          )}

          <div className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email address</label>
              <input className="form-input" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Password</label>
                <span className="text-xs cursor-pointer" style={{ color: 'var(--electric)' }}
                  onClick={() => { setView('forgot'); setError(''); }}>Forgot password?</span>
              </div>
              <input className="form-input" type="password" placeholder="••••••••"
                value={pass} onChange={e => setPass(e.target.value)} disabled={loading} />
            </div>

            {/* Community */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Community <span style={{ color: '#FF3B5C' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <select className="form-select" value={community} onChange={e => setCommunity(e.target.value)} disabled={loading}>
                  <option value="">— Select your community —</option>
                  {communities.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', pointerEvents: 'none', fontSize: 12 }}>▾</span>
              </div>
              {ebInfo && (
                <div className="mt-2 px-3 py-2 rounded-xl text-xs"
                     style={{ background: 'rgba(57,255,20,0.05)', border: '1px solid rgba(57,255,20,0.15)' }}>
                  <span style={{ color: '#39FF14' }}>{ebInfo.name}</span>
                  <span style={{ color: 'var(--text-muted)' }}> · ₹{ebInfo.rate}/kWh · {ebInfo.slab}</span>
                </div>
              )}
            </div>

            {/* Connection type */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Your electricity connection
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: 'solar', label: '☀️ Solar Only',     desc: 'Off-grid solar' },
                  { v: 'both',  label: '⚡ Solar + Grid',   desc: 'Hybrid setup' },
                  { v: 'grid',  label: '🔌 Grid Only',      desc: 'No solar panels' },
                ].map(opt => (
                  <button key={opt.v} onClick={() => setConnType(opt.v)}
                    style={{
                      padding: '10px 6px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                      background: connType === opt.v ? 'rgba(57,255,20,0.12)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${connType === opt.v ? 'rgba(57,255,20,0.4)' : 'var(--border-dim)'}`,
                      color: connType === opt.v ? '#39FF14' : 'var(--text-muted)',
                    }}>
                    <div style={{ fontSize: 11, fontWeight: 600, fontFamily: 'Outfit' }}>{opt.label}</div>
                    <div style={{ fontSize: 9, marginTop: 2, fontFamily: 'JetBrains Mono' }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly usage limit */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Monthly usage alert limit (kWh)
                </label>
                <span style={{ color: '#F59E0B', fontFamily: 'JetBrains Mono', fontSize: 12 }}>{usageLimit} kWh</span>
              </div>
              <input type="range" min="50" max="1000" step="50"
                value={usageLimit} onChange={e => setUsageLimit(e.target.value)}
                style={{ width: '100%', accentColor: '#F59E0B' }} />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                <span>50 kWh</span><span>1000 kWh</span>
              </div>
              {ebInfo && (
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Est. bill: <span style={{ color: '#F59E0B' }}>
                    {ebInfo.currency}{(parseFloat(usageLimit) * ebInfo.rate).toFixed(0)}/month
                  </span>
                </div>
              )}
            </div>

            <button className="btn-neon w-full py-3 text-sm mt-1 font-outfit font-semibold"
              onClick={handleLogin} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? '⏳ Signing in…' : 'Sign in →'}
            </button>
          </div>

          {/* Demo hint */}
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
