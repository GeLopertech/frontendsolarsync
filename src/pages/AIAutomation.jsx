import { useState, useMemo } from 'react';
import { Zap, Plus, Trash2, Cpu, ArrowUpRight, TrendingDown } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { appliances as seedAppliances } from '../data/seed';
import { api } from '../lib/api';

let nextId = 10;

// Generate automation log based on current appliances
const generateLog = (apps) => {
  const flexible = apps.filter(a => a.flex && a.on);
  const nonFlex  = apps.filter(a => !a.flex && a.on);
  const savings  = flexible.reduce((s, a) => s + (a.watts / 1000) * 0.5 * 8, 0).toFixed(1);
  const rupees   = (parseFloat(savings) * 6.5).toFixed(0);
  
  const logs = flexible.map(a => {
    const optHour = 11 + Math.floor(Math.random() * 3);
    return `→ ${a.name}: sync'd to ${optHour}:00 (peak efficiency window)`;
  });
  nonFlex.forEach(a => logs.push(`→ ${a.name}: non-flexible, active monitoring engaged`));
  logs.push(`✓ Status: Network optimized. Est. ₹${rupees} saved today.`);
  return logs;
};

export default function AIAutomation({ live }) {
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
      await api.post('/api/solar/realtime');
    } catch { /* non-critical */ }
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

  // Automation Metrics
  const metrics = useMemo(() => {
    const activeApps = apps.filter(a => a.on);
    const flexApps = activeApps.filter(a => a.flex);
    const totalKw = activeApps.reduce((s, a) => s + (a.watts / 1000), 0);
    const savedKwh = flexApps.reduce((s, a) => s + (a.watts / 1000) * 1.2, 0); // Simulated 1.2h shift saving
    const savedMoney = savedKwh * 6.5;
    return { totalKw, savedKwh, savedMoney };
  }, [apps]);

  const ICONS = ['🔌','🚗','👕','🍽️','❄️','💡','📺','🖥️','🫙','🔥'];

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="mb-5 flex justify-between items-start">
        <div>
          <h2 className="font-outfit font-bold text-xl" style={{ color: 'var(--text-primary)' }}>AI Automation</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
            {apps.filter(a => a.on).length} active appliances · Network sync active
          </p>
        </div>
        <div className="badge badge-neon flex items-center gap-1.5 py-1.5 px-3">
          <div className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
          AI Managed
        </div>
      </div>

      {/* Savings Summary */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <GlassCard className="!p-4 border-l-4" style={{ borderLeftColor: 'var(--neon)' }}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-muted">Current Saved</span>
            <TrendingDown size={14} className="text-neon" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-outfit text-primary">{metrics.savedKwh.toFixed(2)}</span>
            <span className="text-xs text-muted font-mono">kWh</span>
          </div>
          <p className="text-[10px] mt-1 text-muted">Shifted from peak hours</p>
        </GlassCard>
        <GlassCard className="!p-4 border-l-4" style={{ borderLeftColor: 'var(--electric)' }}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-muted">Money Saved</span>
            <ArrowUpRight size={14} className="text-electric" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-outfit text-primary">₹{metrics.savedMoney.toFixed(0)}</span>
            <span className="text-xs text-muted font-mono">/day</span>
          </div>
          <p className="text-[10px] mt-1 text-muted">Optimized tariff usage</p>
        </GlassCard>
      </div>

      {/* Run button */}
      <button className="btn-neon w-full py-3.5 text-sm mb-6 flex items-center justify-center gap-2 font-outfit font-semibold"
        onClick={runOptimizer} disabled={optimizing} style={{ opacity: optimizing ? 0.7 : 1 }}>
        <Cpu size={16} className={optimizing ? 'animate-spin' : ''} />
        {optimizing ? 'Synchronizing Network…' : 'Optimize Energy Distribution'}
      </button>

      {/* Appliance list */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-outfit font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
          Connected Appliances ({apps.length})
        </span>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-outfit font-semibold"
          style={{ background: 'rgba(57,255,20,0.1)', border: '1px solid rgba(57,255,20,0.3)', color: '#39FF14', cursor: 'pointer' }}
          onClick={() => setShowAdd(s => !s)}>
          <Plus size={13} /> Add New
        </button>
      </div>

      {/* Add form... (shortened for brevity but kept functional) */}
      {showAdd && (
        <GlassCard className="mb-4">
          <div className="font-outfit font-semibold text-sm mb-3">New Appliance Configuration</div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input className="form-input text-xs" placeholder="Name" value={newName} onChange={e => setNewName(e.target.value)} />
            <input className="form-input text-xs" type="number" placeholder="Watts" value={newWatts} onChange={e => setNewWatts(e.target.value)} />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-muted">AI Rescheduling?</span>
            <button className={`toggle ${newFlex ? 'on' : ''}`} onClick={() => setNewFlex(f => !f)} />
          </div>
          <div className="flex gap-2">
            <button className="btn-neon flex-1 py-2 text-xs" onClick={addAppliance}>Deploy</button>
            <button className="btn-ghost flex-1 py-2 text-xs" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </GlassCard>
      )}

      {/* Appliance grid */}
      <div className="flex flex-col gap-3 mb-6">
        {apps.map((a) => {
          const rateHr = (a.watts / 1000) * 6.5;
          const optimalWindow = a.flex ? "11:00 AM - 02:30 PM" : "Continuous";
          return (
            <GlassCard key={a.id} className="!p-0 overflow-hidden">
              <div className="p-3.5 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-surface border border-dim text-xl">
                  {a.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary">{a.name}</span>
                    {a.flex && <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-neon/10 border border-neon/20 text-neon font-bold uppercase">AI Managed</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted uppercase font-bold tracking-tighter">Usage</span>
                      <span className="text-xs font-mono text-secondary">{(a.watts / 1000).toFixed(1)} kW</span>
                    </div>
                    <div className="w-px h-6 bg-border-dim" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted uppercase font-bold tracking-tighter">Rate</span>
                      <span className="text-xs font-mono text-electric">₹{rateHr.toFixed(2)}/hr</span>
                    </div>
                    <div className="w-px h-6 bg-border-dim hidden md:block" />
                    <div className="flex-col hidden md:flex">
                      <span className="text-[10px] text-muted uppercase font-bold tracking-tighter">Optimal Window</span>
                      <span className="text-xs font-mono text-amber">{optimalWindow}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 pr-2">
                   <button className={`toggle ${a.on ? 'on' : ''}`} onClick={() => toggle(a.id)} />
                   <button onClick={() => removeAppliance(a.id)} className="text-rose opacity-40 hover:opacity-100 transition-opacity">
                     <Trash2 size={14} />
                   </button>
                </div>
              </div>
              {/* Dynamic Progress/Schedule Mini-bar */}
              <div className="h-1 w-full bg-surface-hover flex">
                 <div className="h-full bg-neon/30" style={{ width: '40%' }} />
                 <div className="h-full bg-neon shadow-[0_0_8px_rgba(57,255,20,0.6)]" style={{ width: '20%' }} />
                 <div className="h-full bg-neon/30" style={{ width: '40%' }} />
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Network Intelligence Log */}
      <GlassCard variant="neon" className="!p-4">
        <div className="flex items-center gap-2 mb-3">
          <Cpu size={14} className="text-neon" />
          <span className="font-outfit font-bold text-sm text-primary">Intelligence Stream</span>
          <span className="ml-auto text-[10px] text-muted font-mono">{new Date().toLocaleTimeString()}</span>
        </div>
        <div className="space-y-1.5 font-mono text-[11px] leading-relaxed">
          {logs.map((line, i) => (
            <div key={i} className={line.startsWith('✓') ? 'text-neon' : 'text-muted'}>
              {line}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
