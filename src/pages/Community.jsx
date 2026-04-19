import GlassCard from '../components/ui/GlassCard';
import StatCard from '../components/ui/StatCard';
import { communityMembers, trades } from '../data/seed';

export default function Community() {
  const doTrade = () => alert('Trade submitted: Selling 0.54 kWh surplus @ ₹0.23/kWh to community grid.');

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="mb-5">
        <h2 className="font-outfit font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Sunnyvale Community</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>12 members · P2P energy trading enabled</p>
      </div>

      {/* Community aggregate stats */}
      <div className="stats-grid grid grid-cols-4 gap-3 mb-5">
        <StatCard label="Community Solar" icon="☀️" value="48.2" unit="kWh" delta="↑ Today's total" deltaUp={true}  accent="neon"   />
        <StatCard label="Trades Today"    icon="🔄" value="8"    unit=""    delta="8 transactions"                  accent="elec"   />
        <StatCard label="CO₂ Saved"       icon="🌿" value="18.4" unit="kg"  delta="vs grid power"                   accent="violet" />
        <StatCard label="Grid Import"     icon="⚡" value="1.2"  unit="kWh" delta="↓ Low import"  deltaUp={true}  accent="amber"  />
      </div>

      <div className="community-grid grid gap-4 mb-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Members list */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Members · SOC</span>
            <span className="badge badge-elec">12 online</span>
          </div>
          <div className="flex flex-col">
            {communityMembers.map((m) => (
              <div key={m.name} className="flex items-center gap-3 py-2.5 border-b last:border-0"
                   style={{ borderColor: 'var(--border-dim)' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                     style={{ background: m.color + '22', border: `1px solid ${m.color}55`, color: m.color }}>
                  {m.initials}
                </div>
                <span className="flex-1 text-xs" style={{ color: 'var(--text-secondary)' }}>{m.name}</span>
                <span className="font-outfit font-semibold text-xs" style={{ color: m.color, fontFamily: 'JetBrains Mono' }}>
                  {m.soc}%
                </span>
                {/* Mini bar */}
                <div className="w-12 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full" style={{ width: `${m.soc}%`, background: m.color, boxShadow: `0 0 4px ${m.color}` }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Trades */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Recent Trades</span>
            <span className="badge badge-amber">Grid Market</span>
          </div>
          <div className="flex flex-col mb-4">
            {trades.map((t, i) => (
              <div key={i} className="flex items-center gap-2 py-2.5 border-b last:border-0 text-xs"
                   style={{ borderColor: 'var(--border-dim)' }}>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', flexShrink: 0 }}>{t.from}</span>
                <span style={{ color: '#F59E0B' }}>→</span>
                <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{t.to}</span>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>{t.kwh}kWh</span>
                <span style={{ color: '#39FF14', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{t.price}</span>
              </div>
            ))}
          </div>
          <button
            className="btn-neon w-full py-2.5 text-xs font-outfit font-semibold"
            onClick={doTrade}
            id="sell-surplus-btn"
          >
            Sell surplus →
          </button>
        </GlassCard>
      </div>
    </div>
  );
}
