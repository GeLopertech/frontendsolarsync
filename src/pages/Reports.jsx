import GlassCard from '../components/ui/GlassCard';

const monthly = [
  ['Solar',     '184 kWh'],
  ['Consumed',  '142 kWh'],
  ['Exported',  '29 kWh'],
  ['Avg Score', '88/100'],
  ['CO₂ Saved', '73.6 kg'],
];
const weekly = [
  ['Solar',    '46 kWh'],
  ['Consumed', '35 kWh'],
  ['Best Day', 'Wed · 92'],
  ['Trades',   '3 sells'],
  ['Revenue',  '₹122'],
];

export default function Reports() {
  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="mb-5">
        <h2 className="font-outfit font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Reports</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>Download PDF energy reports</p>
      </div>

      <div className="reports-grid grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Monthly */}
        <GlassCard variant="neon">
          <div className="flex items-center justify-between mb-4">
            <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Monthly · April 2025</span>
            <span className="badge badge-neon">PDF</span>
          </div>
          <div className="flex flex-col divide-y mb-5">
            {monthly.map(([k, v]) => (
              <div key={k} className="flex justify-between py-2.5 text-xs" style={{ borderColor: 'var(--border-dim)', borderTopWidth: 1 }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
          {/* Mini progress */}
          <div className="mb-4">
            <div className="flex justify-between text-[10px] mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
              <span>Self-sufficiency</span><span>77%</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full" style={{ width: '77%', background: '#39FF14', boxShadow: '0 0 6px rgba(57,255,20,0.5)' }} />
            </div>
          </div>
          <button
            className="btn-neon w-full py-2.5 text-xs font-outfit font-semibold"
            id="download-monthly-btn"
            onClick={() => alert('Downloading April 2025 report…')}
          >
            Download PDF →
          </button>
        </GlassCard>

        {/* Weekly */}
        <GlassCard variant="elec">
          <div className="flex items-center justify-between mb-4">
            <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Weekly · Week 16</span>
            <span className="badge badge-elec">PDF</span>
          </div>
          <div className="flex flex-col divide-y mb-5">
            {weekly.map(([k, v]) => (
              <div key={k} className="flex justify-between py-2.5 text-xs" style={{ borderColor: 'var(--border-dim)', borderTopWidth: 1 }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-[10px] mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
              <span>Solar utilisation</span><span>76%</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full" style={{ width: '76%', background: '#00F0FF', boxShadow: '0 0 6px rgba(0,240,255,0.5)' }} />
            </div>
          </div>
          <button
            className="btn-elec w-full py-2.5 text-xs font-outfit font-semibold"
            id="download-weekly-btn"
            onClick={() => alert('Downloading Week 16 report…')}
          >
            Download PDF →
          </button>
        </GlassCard>
      </div>

      {/* Annual summary teaser */}
      <div className="mt-4 p-4 rounded-2xl flex items-center justify-between"
           style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', backdropFilter: 'blur(16px)' }}>
        <div>
          <div className="text-sm font-outfit font-semibold" style={{ color: 'var(--text-primary)' }}>Annual Report 2024</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>2,184 kWh solar · ₹14,220 saved · 874 kg CO₂</div>
        </div>
        <button className="btn-ghost text-xs px-4 py-2" id="download-annual-btn">
          Download →
        </button>
      </div>
    </div>
  );
}
