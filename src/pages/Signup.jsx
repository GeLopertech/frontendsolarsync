import { useState } from 'react';
import { Sun, Users } from 'lucide-react';
import { communities } from '../data/seed';

export default function Signup({ onSignup, onShowLogin }) {
  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [community, setCommunity] = useState('');
  const [isNew,     setIsNew]     = useState(false);
  const [newName,   setNewName]   = useState('');
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);

  const handleCommunityChange = (val) => {
    setCommunity(val);
    setIsNew(val === 'new');
  };

  const handleSignup = async () => {
    if (!name.trim())  { setError('Please enter your name.'); return; }
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (!community)    { setError('Please select or create a community.'); return; }
    if (isNew && !newName.trim()) { setError('Please enter a community name.'); return; }

    setError('');
    setLoading(true);
    try {
      await onSignup(name.trim(), email.trim(), password);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCommunity = communities.find(c => c.value === community);

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-8"
         style={{ background: '#050505' }}>
      <div style={{
        position: 'fixed', top: '15%', right: '8%',
        width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(57,255,20,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '10%', left: '5%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,240,255,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="w-full max-w-sm animate-fade-in" style={{ position: 'relative', zIndex: 1 }}>
        <div className="glass-elec rounded-2xl p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid var(--border-elec)', boxShadow: 'var(--glow-elec)' }}>
              <Sun size={20} style={{ color: '#00F0FF' }} />
            </div>
            <div>
              <div className="font-outfit font-bold text-base" style={{ color: '#00F0FF', textShadow: '0 0 12px rgba(0,240,255,0.5)' }}>
                SolarSync AI
              </div>
              <div className="text-[10px] tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                Intelligent Energy Orchestrator
              </div>
            </div>
          </div>

          <h2 className="font-outfit font-bold text-xl mb-1" style={{ color: 'var(--text-primary)' }}>Create account</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Join your community energy network</p>

          {/* Error banner */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-xs" style={{
              background: 'rgba(255,59,92,0.1)', border: '1px solid rgba(255,59,92,0.3)', color: '#FF3B5C',
            }}>
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Full name</label>
              <input className="form-input" type="text" placeholder="Alex Johnson"
                value={name} onChange={e => setName(e.target.value)} disabled={loading} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email address</label>
              <input className="form-input" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <input className="form-input" type="password" placeholder="Min 8 characters"
                value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
            </div>

            {/* Community selector */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Community <span style={{ color: '#FF3B5C' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <select className="form-select" value={community}
                  onChange={e => handleCommunityChange(e.target.value)} disabled={loading}>
                  <option value="">— Select a community —</option>
                  {communities.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                  <option value="new">+ Create a new community</option>
                </select>
                <span style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', pointerEvents: 'none', fontSize: 12,
                }}>▾</span>
              </div>

              {selectedCommunity && !isNew && (
                <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-full w-fit"
                     style={{ background: 'rgba(0,240,255,0.08)', border: '1px solid var(--border-elec)' }}>
                  <Users size={11} style={{ color: 'var(--electric)' }} />
                  <span className="text-xs" style={{ color: 'var(--electric)' }}>
                    {selectedCommunity.label.replace(/^\S+\s?/u, '')}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    · {selectedCommunity.members} members
                  </span>
                </div>
              )}

              {isNew && (
                <div className="mt-2 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--border-dim)' }}>
                  <input className="form-input" type="text" placeholder="Community name…"
                    value={newName} onChange={e => setNewName(e.target.value)} disabled={loading} />
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>You'll be set as admin of this community.</p>
                </div>
              )}
            </div>

            <button
              className="btn-elec w-full py-3 text-sm font-outfit font-semibold"
              onClick={handleSignup}
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? '⏳ Creating account…' : 'Create account →'}
            </button>
          </div>

          <p className="text-center text-sm mt-5" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <span className="cursor-pointer font-medium" style={{ color: '#39FF14' }} onClick={onShowLogin}>
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
