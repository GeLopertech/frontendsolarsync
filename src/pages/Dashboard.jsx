import StatCard from '../components/ui/StatCard';
import GlassCard from '../components/ui/GlassCard';
import EnergyAreaChart from '../charts/EnergyAreaChart';
import { chartData } from '../data/seed';
import { useAuth } from '../context/AuthContext';

export default function Dashboard({ live, realtime, history }) {
  const { user } = useAuth();

  // Use real history from backend if available, fallback to seed
  const chartPoints = history && history.length > 0
    ? history.map(h => ({
        time:        h.time,
        solar:       h.solarKw,
        consumption: h.homeKw,
        grid:        Math.abs(h.gridKw),
        soc:         h.batteryPct,
      }))
    : chartData;

  const gridStatus = realtime
    ? realtime.grid.flowKw > 0
      ? `Importing ${realtime.grid.flowKw.toFixed(2)} kW`
      : `Exporting ${Math.abs(realtime.grid.flowKw).toFixed(2)} kW`
    : live.solar >= live.cons
      ? `Exporting ${(live.solar - live.cons).toFixed(2)} kW`
      : `Importing ${(live.cons - live.solar).toFixed(2)} kW`;

  const gridColor = realtime
    ? realtime.grid.flowKw > 0 ? '#FF3B5C' : '#39FF14'
    : live.solar >= live.cons ? '#39FF14' : '#FF3B5C';

  const batteryStatus = realtime?.battery?.status || 'Charging';
  const batteryFlowKw = realtime?.battery?.flowKw || 1.2;

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-5">
        <h2 className="font-outfit font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Energy Overview</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
          {user?.name || 'Dashboard'} · {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · Live
        </p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid grid grid-cols-4 gap-3 mb-5">
        <StatCard label="Solar"   icon="☀️" value={live.solar.toFixed(2)} unit="kW" delta="↑ Live generation" deltaUp={true}  accent="neon"   />
        <StatCard label="Usage"   icon="🔌" value={live.cons.toFixed(2)}  unit="kW" delta="Home consumption"  deltaUp={false} accent="elec"   />
        <StatCard label="Battery" icon="🔋" value={live.soc}              unit="%" delta={`${batteryStatus} · η=0.9`} deltaUp={true}  accent="violet" />
        <StatCard label="Export"  icon="⚡" value={Math.max(0, live.solar - live.cons).toFixed(2)} unit="kW" delta="↑ Earning credits" deltaUp={true} accent="amber" />
      </div>

      {/* Charts row */}
      <div className="two-col grid gap-4 mb-5" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>24h Energy Flow</span>
            <span className="badge badge-neon">Live</span>
          </div>
          <EnergyAreaChart data={chartPoints} height={150} />
        </GlassCard>

        <GlassCard variant="elec">
          <div className="flex items-center justify-between mb-4">
            <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Battery</span>
            <span className="badge badge-elec" style={{ textTransform: 'capitalize' }}>{batteryStatus}</span>
          </div>
          <div className="flex flex-col items-center py-2">
            {(() => {
              const soc = live.soc;
              const r = 40, circ = 2 * Math.PI * r;
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
                    <span className="font-outfit font-bold" style={{ fontSize: 22, color: '#00F0FF', textShadow: '0 0 12px rgba(0,240,255,0.6)', lineHeight: 1 }}>{Math.round(live.soc)}</span>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>% SOC</span>
                  </div>
                </div>
              );
            })()}
            <p className="text-xs mt-2" style={{ color: 'var(--electric)', fontFamily: 'JetBrains Mono' }}>
              {batteryFlowKw > 0 ? `Charging at ${batteryFlowKw.toFixed(1)} kW` : `Discharging at ${Math.abs(batteryFlowKw).toFixed(1)} kW`}
            </p>
          </div>
          <div className="border-t pt-3 mt-2 flex flex-col gap-1.5" style={{ borderColor: 'var(--border-dim)' }}>
            {[
              ['η',       '0.90'],
              ['Surplus', `+${Math.max(0, live.solar - live.cons).toFixed(2)} kW`],
              ['Voltage', realtime ? `${realtime.grid.voltage}V` : '240V'],
            ].map(([k, v]) => (
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
          <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Live Data Stream</span>
          <span className="badge badge-elec">● Live</span>
        </div>
        <div className="flex flex-col divide-y" style={{ '--tw-divide-opacity': 1 }}>
          {[
            ['☀️ Solar now',    `${live.solar.toFixed(2)} kW`,                     'var(--text-primary)'],
            ['🔌 Consumption',  `${live.cons.toFixed(2)} kW`,                       'var(--text-primary)'],
            ['🔋 Battery SOC',  `${Math.round(live.soc)}%`,                         '#00F0FF'],
            ['⚡ Grid',         gridStatus,                                          gridColor],
            ['📡 Frequency',    realtime ? `${realtime.grid.frequency} Hz` : '50 Hz', 'var(--text-primary)'],
            ['🌡️ Bat. Temp',   realtime ? `${realtime.battery.tempC}°C` : '—',      'var(--text-primary)'],
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
