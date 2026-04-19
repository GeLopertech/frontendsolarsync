import StatCard from '../components/ui/StatCard';
import GlassCard from '../components/ui/GlassCard';
import EnergyAreaChart from '../charts/EnergyAreaChart';
import { chartData } from '../data/seed';

export default function Dashboard({ live }) {
  return (
    <div className="p-4 md:p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-5">
        <h2 className="font-outfit font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Energy Overview</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
          Today · Sunnyvale Community · Updated just now
        </p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid grid grid-cols-4 gap-3 mb-5">
        <StatCard label="Solar" icon="☀️" value={live.solar.toFixed(2)} unit="kW"  delta="↑ 12% vs yesterday" deltaUp={true}  accent="neon"   />
        <StatCard label="Usage" icon="🔌" value={live.cons.toFixed(2)}  unit="kW"  delta="↑ 3% vs yesterday"  deltaUp={false} accent="elec"   />
        <StatCard label="Battery" icon="🔋" value={live.soc}            unit="%"   delta={`Charging · η=0.9`} deltaUp={true}  accent="violet" />
        <StatCard label="Export" icon="⚡" value={Math.max(0,(live.solar - live.cons)).toFixed(2)} unit="kW" delta="↑ Earning credits" deltaUp={true} accent="amber" />
      </div>

      {/* Charts row */}
      <div className="two-col grid gap-4 mb-5" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Energy flow chart */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>24h Energy Flow</span>
            <span className="badge badge-neon">Peak Mode</span>
          </div>
          <EnergyAreaChart data={chartData} height={150} />
        </GlassCard>

        {/* Battery mini */}
        <GlassCard variant="elec">
          <div className="flex items-center justify-between mb-4">
            <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Battery</span>
            <span className="badge badge-elec">Charging</span>
          </div>
          {/* Simple SOC ring using SVG */}
          <div className="flex flex-col items-center py-2">
            {(() => {
              const soc = live.soc;
              const r = 40;
              const circ = 2 * Math.PI * r;
              const offset = circ * (1 - soc / 100);
              return (
                <div style={{ position: 'relative', width: 100, height: 100 }}>
                  <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                    <circle cx="50" cy="50" r={r} fill="none" stroke="#00F0FF" strokeWidth="7"
                            strokeDasharray={circ.toFixed(1)} strokeDashoffset={offset.toFixed(1)}
                            strokeLinecap="round"
                            style={{ filter: 'drop-shadow(0 0 6px rgba(0,240,255,0.6))', transition: 'stroke-dashoffset 0.8s ease' }} />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="font-outfit font-bold" style={{ fontSize: 22, color: '#00F0FF', textShadow: '0 0 12px rgba(0,240,255,0.6)', lineHeight: 1 }}>{soc}</span>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>% SOC</span>
                  </div>
                </div>
              );
            })()}
            <p className="text-xs mt-2" style={{ color: 'var(--electric)', fontFamily: 'JetBrains Mono' }}>Charging at 1.2 kW</p>
          </div>
          <div className="border-t pt-3 mt-2 flex flex-col gap-1.5" style={{ borderColor: 'var(--border-dim)' }}>
            {[['η', '0.90'], ['Surplus', '+3.3 kWh'], ['Full in', '~2.8 hrs']].map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Live stream feed */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Live WebSocket Stream</span>
          <span className="badge badge-elec">ws://community/1</span>
        </div>
        <div className="flex flex-col divide-y" style={{ '--tw-divide-opacity': 1 }}>
          {[
            ['☀️ Solar now',     `${live.solar.toFixed(2)} kW`,     'var(--text-primary)'],
            ['🔌 Consumption',   `${live.cons.toFixed(2)} kW`,      'var(--text-primary)'],
            ['🔋 Battery SOC',   `${live.soc}%`,                    '#00F0FF'],
            ['⚡ Grid',          live.solar >= live.cons ? `Exporting ${(live.solar - live.cons).toFixed(2)} kW` : `Importing ${(live.cons - live.solar).toFixed(2)} kW`, live.solar >= live.cons ? '#39FF14' : '#FF3B5C'],
            ['🌤️ Weather',      'Partly cloudy · 24°C',            'var(--text-primary)'],
          ].map(([label, val, color]) => (
            <div key={label} className="flex justify-between items-center py-2.5 text-sm"
                 style={{ borderColor: 'var(--border-dim)' }}>
              <span style={{ color: 'var(--text-muted)' }}>{label}</span>
              <span style={{ color, fontFamily: 'JetBrains Mono', fontWeight: 500, fontSize: 13 }}>{val}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
