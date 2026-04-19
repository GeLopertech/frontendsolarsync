import GlassCard from '../components/ui/GlassCard';
import EnergyAreaChart from '../charts/EnergyAreaChart';
import SocRing from '../charts/SocRing';
import { chartData } from '../data/seed';

export default function Battery({ live }) {
  // Build soc history from chartData
  const socHistory = chartData.map(d => ({ ...d, soc: d.soc }));

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
        {/* SOC History */}
        <GlassCard variant="elec">
          <div className="flex items-center justify-between mb-4">
            <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>SOC History (24h)</span>
            <span className="badge badge-elec">Live</span>
          </div>
          <EnergyAreaChart
            data={socHistory.map(d => ({ time: d.time, solar: d.soc / 20, consumption: 4, grid: 0 }))}
            height={160}
            showLegend={false}
          />
        </GlassCard>

        {/* Parameters */}
        <GlassCard>
          <div className="mb-4">
            <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Parameters</span>
          </div>
          <div className="flex flex-col divide-y" style={{ divideColor: 'var(--border-dim)' }}>
            {[
              ['Capacity',    '10 kWh'],
              ['Efficiency η','0.90'],
              ['Current SOC', `${live.soc}%`],
              ['Charge rate', '1.2 kW'],
              ['Max',         '100% → export'],
              ['Min',         '0% → import'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 text-xs"
                   style={{ borderColor: 'var(--border-dim)', borderTopWidth: 1 }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Big SOC display + Energy Score */}
      <div className="two-col grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <GlassCard variant="elec" className="flex flex-col items-center justify-center py-6">
          <SocRing soc={live.soc} size={140} />
          <p className="text-xs mt-4 text-center" style={{ color: 'var(--electric)', fontFamily: 'JetBrains Mono' }}>
            Charging at 1.2 kW · Full in ~2.8 hrs
          </p>
        </GlassCard>

        <GlassCard variant="neon" className="flex flex-col items-center justify-center py-6">
          <div className="font-outfit font-black" style={{ fontSize: 72, color: '#39FF14', textShadow: '0 0 30px rgba(57,255,20,0.6)', lineHeight: 1 }}>
            92
          </div>
          <div className="text-xs mt-2" style={{ color: 'var(--text-muted)', fontFamily: 'IBM Plex Sans' }}>Energy Score · Today</div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Top 8% of community</div>
          {/* Score bar */}
          <div className="w-full mt-5 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full" style={{
              width: '92%',
              background: 'linear-gradient(90deg, #39FF14, #00F0FF)',
              boxShadow: '0 0 8px rgba(57,255,20,0.5)',
            }} />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
