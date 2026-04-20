import { useState, useEffect } from 'react';
import StatCard from '../components/ui/StatCard';
import GlassCard from '../components/ui/GlassCard';
import EnergyAreaChart from '../charts/EnergyAreaChart';
import { useAuth } from '../context/AuthContext';
import { useUserProfile } from '../context/UserContext';

const TIPS = [
  { icon: '🌅', tip: 'Run heavy appliances (washing machine, dishwasher) between 10am–2pm when solar peaks.' },
  { icon: '🔋', tip: 'Keep battery above 20% as reserve for evening usage — avoid full discharge daily.' },
  { icon: '❄️', tip: 'Set AC to 24°C instead of 18°C — saves up to 30% energy without losing comfort.' },
  { icon: '💡', tip: 'Switch to LED bulbs — they use 75% less energy than incandescent lights.' },
  { icon: '🚿', tip: 'Run geyser/water heater on solar timer — heat water at noon, use in evening.' },
  { icon: '📺', tip: 'Unplug TVs and chargers when not in use — standby mode wastes up to 10% of your bill.' },
  { icon: '🌿', tip: 'Plant trees on the west side of your house — natural shading reduces AC load by 15%.' },
  { icon: '⏰', tip: 'Use a smart plug timer for EV charging — charge during peak solar hours, not at night.' },
];

export default function Dashboard({ live, realtime, history }) {
  const { user } = useAuth();
  const { userProfile } = useUserProfile();
  const [tipIndex, setTipIndex] = useState(0);
  const [alerts,   setAlerts]   = useState([]);

  const connType    = userProfile?.connType    || 'both';
  const limitKwh    = userProfile?.usageLimitKwh || 300;
  const ebRate      = userProfile?.ebRate       || 6.5;
  const currency    = userProfile?.currency     || '₹';
  const communityLabel = userProfile?.communityLabel || 'Community';

  // Rotate tips every 8 seconds
  useEffect(() => {
    const id = setInterval(() => setTipIndex(i => (i + 1) % TIPS.length), 8000);
    return () => clearInterval(id);
  }, []);

  // Generate alerts based on live data + profile
  useEffect(() => {
    const newAlerts = [];
    if (live.cons > 4) {
      newAlerts.push({ id: 1, type: 'warning', msg: `High consumption: ${live.cons.toFixed(2)} kW — check running appliances.` });
    }
    // Estimate monthly usage from current rate
    const estimatedMonthlyKwh = live.cons * 24 * 30;
    if (estimatedMonthlyKwh > limitKwh * 0.85) {
      newAlerts.push({ id: 2, type: 'error', msg: `Usage alert: Est. ${estimatedMonthlyKwh.toFixed(0)} kWh/month exceeds your ${limitKwh} kWh limit.` });
    }
    if (live.soc < 20 && connType !== 'grid') {
      newAlerts.push({ id: 3, type: 'warning', msg: `Battery critically low (${Math.round(live.soc)}%) — grid import will activate soon.` });
    }
    setAlerts(newAlerts);
  }, [live, limitKwh, connType]);

  // Build chart data based on connection type
  const chartPoints = history && history.length > 0
    ? history.map(h => {
        if (connType === 'grid') {
          // Grid only: no solar line, consumption = home load, grid = all consumption
          return { time: h.time, solar: 0, consumption: h.homeKw, grid: h.homeKw };
        }
        if (connType === 'solar') {
          // Solar only: no grid import
          return { time: h.time, solar: h.solarKw, consumption: h.homeKw, grid: 0 };
        }
        // Both: solar + grid import when solar insufficient
        return { time: h.time, solar: h.solarKw, consumption: h.homeKw, grid: h.importKw };
      })
    : Array.from({ length: 24 }, (_, i) => {
        const solar = (connType !== 'grid' && i >= 6 && i <= 19)
          ? parseFloat((Math.sin(((i - 6) / 13) * Math.PI) * 9.2).toFixed(2)) : 0;
        const consumption = parseFloat((1.2 + Math.sin(i * 0.5) * 0.4 + (i >= 18 && i <= 21 ? 1.5 : 0)).toFixed(2));
        return {
          time: `${String(i).padStart(2, '0')}:00`,
          solar: connType === 'grid' ? 0 : solar,
          consumption,
          grid: connType === 'solar' ? 0 : Math.max(0, consumption - solar),
        };
      });

  // Stats depend on connection type
  const gridStatus = connType === 'solar' ? 'Off-grid'
    : realtime ? (realtime.grid.flowKw > 0
        ? `Importing ${realtime.grid.flowKw.toFixed(2)} kW`
        : `Exporting ${Math.abs(realtime.grid.flowKw).toFixed(2)} kW`)
    : live.cons > live.solar ? `Importing ${(live.cons - live.solar).toFixed(2)} kW` : 'Balanced';

  const gridColor = connType === 'solar' ? '#39FF14'
    : (realtime?.grid?.flowKw ?? (live.cons - live.solar)) > 0 ? '#FF3B5C' : '#39FF14';

  const estimatedBill = ((live.cons * 24 * 30 * 0.3) * ebRate).toFixed(0); // 30% grid portion estimate

  const currentTip = TIPS[tipIndex];

  return (
    <div className="p-4 md:p-6 animate-fade-in">

      {/* Alerts */}
      {alerts.map(a => (
        <div key={a.id} className="mb-3 px-4 py-3 rounded-xl text-xs flex items-start gap-2"
             style={{
               background: a.type === 'error' ? 'rgba(255,59,92,0.08)' : 'rgba(245,158,11,0.08)',
               border: `1px solid ${a.type === 'error' ? 'rgba(255,59,92,0.3)' : 'rgba(245,158,11,0.3)'}`,
               color: a.type === 'error' ? '#FF3B5C' : '#F59E0B',
             }}>
          <span>{a.type === 'error' ? '🚨' : '⚠️'}</span>
          <span>{a.msg}</span>
        </div>
      ))}

      {/* Header */}
      <div className="mb-5">
        <h2 className="font-outfit font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Energy Overview</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
          {user?.name || 'Dashboard'} · {communityLabel} ·{' '}
          <span style={{ color: connType === 'grid' ? '#F59E0B' : '#39FF14' }}>
            {connType === 'solar' ? '☀️ Solar only' : connType === 'grid' ? '🔌 Grid only' : '⚡ Solar + Grid'}
          </span>
        </p>
      </div>

      {/* Stat cards — adapt to connection type */}
      <div className="stats-grid grid grid-cols-4 gap-3 mb-5">
        {connType !== 'grid' && (
          <StatCard label="Solar" icon="☀️" value={live.solar.toFixed(2)} unit="kW" delta="↑ Live generation" deltaUp={true} accent="neon" />
        )}
        <StatCard label="Usage" icon="🔌" value={live.cons.toFixed(2)} unit="kW" delta="Home consumption" deltaUp={false} accent="elec" />
        {connType !== 'grid' && (
          <StatCard label="Battery" icon="🔋" value={Math.round(live.soc)} unit="%" delta={`${realtime?.battery?.status || 'standby'} · η=0.9`} deltaUp={true} accent="violet" />
        )}
        {connType !== 'solar' && (
          <StatCard label="Est. Bill" icon="💸" value={estimatedBill} unit={currency} delta="This month est." deltaUp={false} accent="amber" />
        )}
        {connType === 'both' && (
          <StatCard label="Export" icon="⚡" value={Math.max(0, live.solar - live.cons).toFixed(2)} unit="kW" delta="↑ Earning credits" deltaUp={true} accent="neon" />
        )}
      </div>

      {/* Charts */}
      <div className="two-col grid gap-4 mb-5" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>24h Energy Flow</span>
            <span className="badge badge-neon">Live</span>
          </div>
          <div className="flex gap-4 mb-3 flex-wrap">
            {connType !== 'grid' && (
              <div className="flex items-center gap-1.5">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#39FF14' }} />
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>Solar generated</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00F0FF' }} />
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>Home usage</span>
            </div>
            {connType !== 'solar' && (
              <div className="flex items-center gap-1.5">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#8B5CF6' }} />
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                  {connType === 'grid' ? 'Grid consumption' : 'Grid import'}
                </span>
              </div>
            )}
          </div>
          <EnergyAreaChart data={chartPoints} height={150} showLegend={false} />
        </GlassCard>

        {/* Battery (solar/both only) or Grid info (grid only) */}
        {connType === 'grid' ? (
          <GlassCard variant="amber">
            <div className="flex items-center justify-between mb-4">
              <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Grid Usage</span>
              <span className="badge badge-amber">EB Meter</span>
            </div>
            <div className="flex flex-col gap-2">
              {[
                ['Provider',    userProfile?.ebName || 'TANGEDCO'],
                ['Rate',        `${currency}${ebRate}/kWh`],
                ['Now',         `${live.cons.toFixed(2)} kW`],
                ['Est. today',  `${(live.cons * 24).toFixed(1)} kWh`],
                ['Est. bill',   `${currency}${estimatedBill}`],
                ['Limit',       `${limitKwh} kWh/mo`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs py-1.5 border-b" style={{ borderColor: 'var(--border-dim)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        ) : (
          <GlassCard variant="elec">
            <div className="flex items-center justify-between mb-4">
              <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Battery</span>
              <span className="badge badge-elec" style={{ textTransform: 'capitalize' }}>{realtime?.battery?.status || 'standby'}</span>
            </div>
            <div className="flex flex-col items-center py-2">
              {(() => {
                const soc = Math.round(live.soc);
                const r = 40, circ = 2 * Math.PI * r;
                const offset = circ * (1 - soc / 100);
                return (
                  <div style={{ position: 'relative', width: 100, height: 100 }}>
                    <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                      <circle cx="50" cy="50" r={r} fill="none" stroke="#00F0FF" strokeWidth="7"
                        strokeDasharray={circ.toFixed(1)} strokeDashoffset={offset.toFixed(1)} strokeLinecap="round"
                        style={{ filter: 'drop-shadow(0 0 6px rgba(0,240,255,0.6))', transition: 'stroke-dashoffset 0.8s ease' }} />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="font-outfit font-bold" style={{ fontSize: 22, color: '#00F0FF', lineHeight: 1 }}>{soc}</span>
                      <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>% SOC</span>
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="border-t pt-3 mt-2 flex flex-col gap-1.5" style={{ borderColor: 'var(--border-dim)' }}>
              {[
                ['Grid', gridStatus],
                ['Rate', `${currency}${ebRate}/kWh`],
                ['Limit', `${limitKwh} kWh/mo`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ color: gridColor, fontFamily: 'JetBrains Mono', fontWeight: 500, fontSize: 11 }}>{v}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>

      {/* Energy saving tip */}
      <div className="mb-4 p-4 rounded-2xl flex items-start gap-3"
           style={{ background: 'rgba(57,255,20,0.04)', border: '1px solid rgba(57,255,20,0.15)' }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>{currentTip.icon}</span>
        <div>
          <div className="text-xs font-semibold mb-0.5 font-outfit" style={{ color: '#39FF14' }}>💡 Energy Saving Tip</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Sans', lineHeight: 1.6 }}>{currentTip.tip}</div>
        </div>
      </div>

      {/* Live stream */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Live Data Stream</span>
          <span className="badge badge-elec">● Live</span>
        </div>
        <div className="flex flex-col divide-y">
          {[
            connType !== 'grid'   && ['☀️ Solar now',    `${live.solar.toFixed(2)} kW`,      'var(--text-primary)'],
            ['🔌 Consumption',                            `${live.cons.toFixed(2)} kW`,        'var(--text-primary)'],
            connType !== 'grid'   && ['🔋 Battery SOC',  `${Math.round(live.soc)}%`,          '#00F0FF'],
            connType !== 'solar'  && ['⚡ Grid',          gridStatus,                           gridColor],
            ['💸 EB Rate',                                `${currency}${ebRate}/kWh`,          '#F59E0B'],
            connType !== 'solar'  && ['📊 Usage limit',  `${limitKwh} kWh/month`,             '#8B5CF6'],
          ].filter(Boolean).map(([label, val, color]) => (
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
