import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#212126',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      padding: '12px 16px',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700, marginBottom: 8, fontFamily: 'JetBrains Mono', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4" style={{ marginBottom: 4 }}>
          <div className="flex items-center gap-2">
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.color }} />
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontFamily: 'IBM Plex Sans' }}>{p.name}</span>
          </div>
          <span style={{ color: p.color, fontSize: 11, fontFamily: 'JetBrains Mono', fontWeight: 700 }}>
            {p.value.toFixed(2)} <span style={{ fontSize: 9, opacity: 0.6 }}>kW</span>
          </span>
        </div>
      ))}
    </div>
  );
};

export default function EnergyAreaChart({ data, height = 160, showGrid = true, showLegend = true }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradSolar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#39FF14" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#39FF14" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradCons" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#00F0FF" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradGrid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
          </linearGradient>
        </defs>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--border-dim)" vertical={false} />}
        <XAxis
          dataKey="time"
          tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          axisLine={false} tickLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          axisLine={false} tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        {showLegend && (
          <Legend
            wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono', paddingTop: 8 }}
            formatter={(v) => <span style={{ color: 'var(--text-secondary)' }}>{v}</span>}
          />
        )}
        <Area type="monotone" dataKey="solar"       name="Solar"       stroke="#39FF14" strokeWidth={2.5} fill="url(#gradSolar)" dot={false} strokeLinecap="round" />
        <Area type="monotone" dataKey="consumption" name="Usage"       stroke="#00F0FF" strokeWidth={2.5} fill="url(#gradCons)"  dot={false} strokeLinecap="round" />
        <Area type="monotone" dataKey="grid"        name="Grid"        stroke="#8B5CF6" strokeWidth={2}   fill="url(#gradGrid)"  dot={false} strokeLinecap="round" strokeDasharray="5 5" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
