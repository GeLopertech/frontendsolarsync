import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--border-dim)',
      borderRadius: 10,
      padding: '10px 14px',
      backdropFilter: 'blur(16px)',
    }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 6, fontFamily: 'JetBrains Mono' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color, fontSize: 12, fontFamily: 'JetBrains Mono', marginBottom: 2 }}>
          {p.name}: <strong>{p.value.toFixed(2)} kWh</strong>
        </p>
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
            <stop offset="0%" stopColor="#39FF14" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#39FF14" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gradCons" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#00F0FF" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gradGrid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.02} />
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
        <Area type="monotone" dataKey="solar"       name="Solar"       stroke="#39FF14" strokeWidth={2} fill="url(#gradSolar)" dot={false} />
        <Area type="monotone" dataKey="consumption" name="Consumption"  stroke="#00F0FF" strokeWidth={2} fill="url(#gradCons)"  dot={false} />
        <Area type="monotone" dataKey="grid"        name="Grid"         stroke="#8B5CF6" strokeWidth={1.5} fill="url(#gradGrid)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
