import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(8,8,8,0.95)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 10, padding: '8px 12px',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'JetBrains Mono', marginBottom: 4 }}>{label}</p>
      <p style={{ color: '#39FF14', fontSize: 12, fontFamily: 'JetBrains Mono' }}>
        {payload[0]?.value} kWh
      </p>
    </div>
  );
};

export default function ForecastBarChart({ data, height = 160 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }} barSize={18}>
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#39FF14" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#39FF14" stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          axisLine={false} tickLine={false}
        />
        <YAxis
          tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          axisLine={false} tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(57,255,20,0.04)' }} />
        <Bar dataKey="kwh" fill="url(#barGrad)" radius={[4, 4, 0, 0]}
             style={{ filter: 'drop-shadow(0 0 4px rgba(57,255,20,0.4))' }} />
      </BarChart>
    </ResponsiveContainer>
  );
}
