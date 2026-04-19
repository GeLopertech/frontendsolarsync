import GlassCard from '../components/ui/GlassCard';
import EnergyAreaChart from '../charts/EnergyAreaChart';
import SocRing from '../charts/SocRing';
import { useBattery } from '../hooks/useBattery';

const MODES = ['auto', 'charge', 'discharge', 'reserve', 'off-grid'];

export default function Battery({ live, history }) {
  const { status, loading, saving, setMode } = useBattery();

  const socHistory = history && history.length > 0
    ? history.map(h => ({ time: h.time, solar: h.batteryPct / 20, consumption: 4, grid: 0 }))
    : [];

  const handleMode = async (mode) => {
    try { await setMode(mode); } catch (err) { alert(err.message); }
  };

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="mb-5">
        <h2 className="font-outfit font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Battery Management</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
          SOC(t) = SOC(t−1) + (solar − consumption) × η
        </p>
      </div>

      {/* Charts row */}
      <div className="two-col grid gap-4 mb-5" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <GlassCard variant="elec">
          <div className="flex items-center justify-between mb-4">
            <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>SOC History (24h)</span>
            <span className="badge badge-elec">Live</span>
          </div>
          {socHistory.length > 0
            ? <EnergyAreaChart data={socHistory} height={160} showLegend={false} />
            : <div className="flex items-center justify-center h-40 text-xs" style={{ color: 'var(--text-muted)' }}>Loading history…</div>
          }
        </GlassCard>

        <GlassCard>
          <div className="mb-4">
            <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Parameters</span>
          </div>
          <div className="flex flex-col divide-y" style={{ divideColor: 'var(--border-dim)' }}>
            {loading ? (
              <div className="text-xs py-4 text-center" style={{ color: 'var(--text-muted)' }}>Loading…</div>
            ) : [
              ['Capacity',     `${status?.capacityKwh || 13.5} kWh`],
              ['Efficiency η', '0.90'],
              ['Current SOC',  `${live.soc}%`],
              ['Mode',         status?.mode || 'auto'],
              ['Health',       `${status?.health || 97}%`],
              ['Cycles',       status?.cycles || 312],
              ['Temp',         status ? `${status.tempC}°C` : '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 text-xs"
                   style={{ borderColor: 'var(--border-dim)', borderTopWidth: 1 }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', fontWeight: 500, textTransform: 'capitalize' }}>{v}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* SOC ring + mode control */}
      <div className="two-col grid gap-4 mb-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <GlassCard variant="elec" className="flex flex-col items-center justify-center py-6">
          <SocRing soc={live.soc} size={140} />
          <p className="text-xs mt-4 text-center" style={{ color: 'var(--electric)', fontFamily: 'JetBrains Mono' }}>
            {status
              ? status.flowKw > 0
                ? `Charging at ${status.flowKw.toFixed(1)} kW`
                : `Discharging at ${Math.abs(status.flowKw).toFixed(1)} kW`
              : 'Calculating…'
            }
          </p>
          {status && (
            <p className="text-xs mt-1 text-center" style={{ color: 'var(--text-muted)' }}>
              ~{status.estimatedBackupHours}h backup available
            </p>
          )}
        </GlassCard>

        <GlassCard>
          <div className="mb-4">
            <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Battery Mode</span>
          </div>
          <div className="flex flex-col gap-2">
            {MODES.map(mode => (
              <button
                key={mode}
                onClick={() => handleMode(mode)}
                disabled={saving}
                className="py-2 px-3 rounded-xl text-xs font-outfit font-medium text-left transition-all"
                style={{
                  background: status?.mode === mode ? 'rgba(57,255,20,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${status?.mode === mode ? 'rgba(57,255,20,0.4)' : 'var(--border-dim)'}`,
                  color: status?.mode === mode ? '#39FF14' : 'var(--text-secondary)',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {mode === 'auto' && '🤖 '}
                {mode === 'charge' && '⬆️ '}
                {mode === 'discharge' && '⬇️ '}
                {mode === 'reserve' && '🛡️ '}
                {mode === 'off-grid' && '🔌 '}
                {mode}
                {status?.mode === mode && ' ✓'}
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Energy Score */}
      <GlassCard variant="neon" className="flex flex-col items-center justify-center py-6">
        <div className="font-outfit font-black" style={{ fontSize: 72, color: '#39FF14', textShadow: '0 0 30px rgba(57,255,20,0.6)', lineHeight: 1 }}>
          {status ? Math.min(100, Math.round(live.soc * 0.92 + 8)) : 92}
        </div>
        <div className="text-xs mt-2" style={{ color: 'var(--text-muted)', fontFamily: 'IBM Plex Sans' }}>Energy Score · Today</div>
        <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Top 8% of community</div>
        <div className="w-full mt-5 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)', maxWidth: 300 }}>
          <div className="h-full rounded-full" style={{
            width: `${live.soc}%`,
            background: 'linear-gradient(90deg, #39FF14, #00F0FF)',
            boxShadow: '0 0 8px rgba(57,255,20,0.5)',
            transition: 'width 1s ease',
          }} />
        </div>
      </GlassCard>
    </div>
  );
}
