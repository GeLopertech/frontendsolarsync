import { useState } from 'react';
import { Zap, Plus, Trash2 } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { appliances as seedAppliances } from '../data/seed';
import { api } from '../lib/api';

let nextId = 10;

// Generate optimization log based on current appliances
const generateLog = (apps) => {
  const flexible = apps.filter(a => a.flex && a.on);
  const nonFlex  = apps.filter(a => !a.flex && a.on);
  const savings  = flexible.reduce((s, a) => s + (a.watts / 1000) * 0.5 * 8, 0).toFixed(1);
  const rupees   = (parseFloat(savings) * 6).toFixed(0);
  const logs = flexible.map(a => {
    const optHour = 11 + Math.floor(Math.random() * 3);
    return `→ ${a.name}: shifted to ${optHour}:00 (solar surplus window)`;
  });
  nonFlex.forEach(a => logs.push(`→ ${a.name}: non-flexible, running continuously`));
  logs.push(`✓ Savings: ₹${rupees} · ${savings} kWh optimised today`);
  return logs;
};

export default function Optimizer({ live }) {
  const [apps,       setApps]       = useState(seedAppliances.map(a => ({ ...a })));
  const [optimizing, setOptimizing] = useState(false);
  const [logs,       setLogs]       = useState(generateLog(seedAppliances));

  // Add appliance form
  const [showAdd,    setShowAdd]    = useState(false);
  const [newName,    setNewName]    = useState('');
  const [newWatts,   setNewWatts]   = useState('');
  const [newIcon,    setNewIcon]    = useState('🔌');
  const [newFlex,    setNewFlex]    = useState(true);
  const [formError,  setFormError]  = useState('');

  const toggle = (id) => setApps(prev => prev.map(a => a.id === id ? { ...a, on: !a.on } : a));

  const runOptimizer = async () => {
    setOptimizing(true);
    try {
      // Call backend optimize endpoint
      await api.post('/api/solar/realtime'); // get latest snapshot
    } catch { /* non-critical */ }
    // Simulate AI processing delay then generate fresh log
    await new Promise(r => setTimeout(r, 2000));
    setLogs(generateLog(apps));
    setOptimizing(false);
  };

  const addAppliance = () => {
    if (!newName.trim())             { setFormError('Enter appliance name.'); return; }
    if (!newWatts || isNaN(newWatts) || +newWatts <= 0) { setFormError('Enter valid watts.'); return; }
    setFormError('');
    const app = { id: nextId++, name: newName.trim(), icon: newIcon, watts: +newWatts, scheduled: null, flex: newFlex, on: true };
    setApps(prev => [...prev, app]);
    setNewName(''); setNewWatts(''); setNewIcon('🔌'); setNewFlex(true); setShowAdd(false);
  };

  const removeAppliance = (id) => setApps(prev => prev.filter(a => a.id !== id));

  const ICONS = ['🔌','🚗','👕','🍽️','❄️','💡','📺','🖥️','🫙','🔥'];

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="mb-5">
        <h2 className="font-outfit font-bold text-xl" style={{ color: 'var(--text-primary)' }}>AI Optimizer</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
          Schedules appliances to match peak solar · Solar now: {live?.solar?.toFixed(2) ?? '—'} kW
        </p>
      </div>

      {/* Run button */}
      <button className="btn-neon w-full py-3.5 text-sm mb-5 flex items-center justify-center gap-2 font-outfit font-semibold"
        onClick={runOptimizer} disabled={optimizing} style={{ opacity: optimizing ? 0.7 : 1 }}>
        <Zap size={16} />
        {optimizing ? '⏳ Optimizing…' : '⚡ Run Optimizer Now'}
      </button>

      {/* Appliance list */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-outfit font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
          Appliances ({apps.length})
        </span>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-outfit font-semibold"
          style={{ background: 'rgba(57,255,20,0.1)', border: '1px solid rgba(57,255,20,0.3)', color: '#39FF14', cursor: 'pointer' }}
          onClick={() => setShowAdd(s => !s)}>
          <Plus size={13} /> Add Appliance
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <GlassCard className="mb-4">
          <div className="font-outfit font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>New Appliance</div>
          {formError && (
            <div className="mb-3 text-xs px-3 py-2 rounded-lg"
                 style={{ background: 'rgba(255,59,92,0.1)', border: '1px solid rgba(255,59,92,0.3)', color: '#FF3B5C' }}>
              {formError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Name</label>
              <input className="form-input text-xs" placeholder="e.g. Water Heater"
                value={newName} onChange={e => setNewName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Watts</label>
              <input className="form-input text-xs" type="number" placeholder="e.g. 1500"
                value={newWatts} onChange={e => setNewWatts(e.target.value)} />
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Icon</label>
            <div className="flex gap-2 flex-wrap">
              {ICONS.map(ic => (
                <button key={ic} onClick={() => setNewIcon(ic)}
                  style={{ fontSize: 20, background: ic === newIcon ? 'rgba(57,255,20,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${ic === newIcon ? 'rgba(57,255,20,0.4)' : 'var(--border-dim)'}`,
                    borderRadius: 8, padding: '4px 8px', cursor: 'pointer' }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Flexible schedule?</label>
            <button className={`toggle ${newFlex ? 'on' : ''}`} onClick={() => setNewFlex(f => !f)} />
            <span className="text-xs" style={{ color: newFlex ? '#39FF14' : 'var(--text-muted)' }}>
              {newFlex ? 'Yes — AI can reschedule' : 'No — fixed time'}
            </span>
          </div>
          <div className="flex gap-2">
            <button className="btn-neon flex-1 py-2 text-xs font-outfit font-semibold" onClick={addAppliance}>Add</button>
            <button onClick={() => { setShowAdd(false); setFormError(''); }}
              style={{ flex: 1, padding: '8px', borderRadius: 10, background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border-dim)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>
              Cancel
            </button>
          </div>
        </GlassCard>
      )}

      {/* Appliance cards */}
      <div className="flex flex-col gap-3 mb-5">
        {apps.map((a) => {
          const hours = Array.from({ length: 24 }, (_, h) => {
            if (a.scheduled !== null && Math.abs(h - a.scheduled) <= 1) return 'optimal';
            if (h >= 9 && h <= 16) return 'active';
            return '';
          });
          return (
            <GlassCard key={a.id} className="!p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-dim)', fontSize: 18 }}>
                  {a.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{a.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                    {(a.watts / 1000).toFixed(1)} kW ·{' '}
                    <span style={{ color: a.flex ? '#39FF14' : 'var(--text-muted)' }}>{a.flex ? 'Flexible' : 'Fixed'}</span>
                    {a.scheduled !== null && <> · {a.scheduled}:00</>}
                  </div>
                  <div className="flex gap-0.5 mt-2">
                    {hours.map((cls, i) => <div key={i} className={`hour-slot ${cls}`} />)}
                  </div>
                </div>
                <button className={`toggle ${a.on ? 'on' : ''}`} onClick={() => toggle(a.id)} />
                <button onClick={() => removeAppliance(a.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,59,92,0.5)', padding: 4 }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Optimization log */}
      <GlassCard variant="neon">
        <div className="flex items-center justify-between mb-3">
          <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Optimization Log</span>
          {optimizing
            ? <span className="badge badge-elec">⏳ Running…</span>
            : <span className="badge badge-neon">✓ Complete</span>
          }
        </div>
        <div className="flex flex-col gap-1.5" style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.9 }}>
          {logs.map((line, i) => (
            <div key={i} style={{ color: line.startsWith('✓') ? '#39FF14' : 'var(--text-muted)',
              textShadow: line.startsWith('✓') ? '0 0 8px rgba(57,255,20,0.4)' : 'none' }}>
              {line}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
