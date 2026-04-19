import { useState } from 'react';
import { Zap } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { appliances as seedAppliances } from '../data/seed';

export default function Optimizer() {
  const [apps, setApps] = useState(seedAppliances.map(a => ({ ...a })));
  const [optimizing, setOptimizing] = useState(false);

  const toggle = (id) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, on: !a.on } : a));
  };

  const runOptimizer = () => {
    setOptimizing(true);
    setTimeout(() => setOptimizing(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="mb-5">
        <h2 className="font-outfit font-bold text-xl" style={{ color: 'var(--text-primary)' }}>AI Optimizer</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>Schedules appliances to match peak solar hours</p>
      </div>

      {/* Run button */}
      <button
        id="optimizer-run-btn"
        className="btn-neon w-full py-3.5 text-sm mb-5 flex items-center justify-center gap-2 font-outfit font-semibold"
        onClick={runOptimizer}
        disabled={optimizing}
        style={{ opacity: optimizing ? 0.7 : 1 }}
      >
        <Zap size={16} />
        {optimizing ? '⏳ Optimizing…' : '⚡ Run Optimizer Now'}
      </button>

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
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                     style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-dim)', fontSize: 18 }}>
                  {a.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{a.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                    {(a.watts / 1000).toFixed(1)} kW ·{' '}
                    <span style={{ color: a.flex ? '#39FF14' : 'var(--text-muted)' }}>{a.flex ? 'Flexible' : 'Non-flexible'}</span>
                    {a.scheduled !== null && <> · {a.scheduled}:00</>}
                  </div>
                  {/* Schedule bar */}
                  <div className="flex gap-0.5 mt-2">
                    {hours.map((cls, i) => (
                      <div key={i} className={`hour-slot ${cls}`} />
                    ))}
                  </div>
                </div>

                {/* Toggle */}
                <button
                  className={`toggle ${a.on ? 'on' : ''}`}
                  onClick={() => toggle(a.id)}
                  aria-label={`Toggle ${a.name}`}
                />
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Optimization log */}
      <GlassCard variant="neon">
        <div className="flex items-center justify-between mb-3">
          <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Optimization Log</span>
          <span className="badge badge-neon">Saved 2.1 kWh</span>
        </div>
        <div className="flex flex-col gap-1.5" style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.8 }}>
          <div>→ Dishwasher: 19:00 → 12:00 (solar surplus)</div>
          <div>→ Washing machine: 11:00 (0.8 kW surplus)</div>
          <div>→ EV charger: window 10:00–14:00</div>
          <div>→ AC: non-flexible, continuous</div>
          <div style={{ color: '#39FF14', marginTop: 6, textShadow: '0 0 8px rgba(57,255,20,0.4)' }}>
            ✓ Savings: ₹84 / $1.02 today
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
