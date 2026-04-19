import GlassCard from '../components/ui/GlassCard';
import EnergyAreaChart from '../charts/EnergyAreaChart';
import ForecastBarChart from '../charts/ForecastBarChart';
import { chartData, forecastDays } from '../data/seed';

export default function Forecast() {
  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="mb-5">
        <h2 className="font-outfit font-bold text-xl" style={{ color: 'var(--text-primary)' }}>7-Day Solar Forecast</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>Open-Meteo integration · Updated hourly</p>
      </div>

      {/* Forecast strip */}
      <div className="flex gap-3 overflow-x-auto pb-2 mb-5" style={{ WebkitOverflowScrolling: 'touch' }}>
        {forecastDays.map((d, i) => (
          <div key={i} className={`forecast-card ${d.today ? 'today' : ''}`}>
            <div className="text-[10px] mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>{d.day}</div>
            <div style={{ fontSize: 22, marginBottom: 3 }}>{d.icon}</div>
            <div className="font-outfit font-bold text-sm" style={{ color: d.today ? '#39FF14' : 'var(--text-primary)', textShadow: d.today ? '0 0 10px rgba(57,255,20,0.5)' : 'none' }}>
              {d.kwh}<span style={{ fontSize: 9, color: 'var(--text-muted)', marginLeft: 2 }}>kWh</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'JetBrains Mono' }}>☁ {d.cloud}%</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="two-col grid gap-4 mb-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>7-Day Yield (kWh)</span>
          </div>
          <ForecastBarChart data={forecastDays} height={160} />
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Hourly Radiation</span>
          </div>
          <EnergyAreaChart data={chartData} height={160} showLegend={false} />
        </GlassCard>
      </div>

      {/* Weather panel */}
      <GlassCard variant="neon">
        <div className="flex items-center justify-between mb-4">
          <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Weather Conditions · Today</span>
          <span className="badge badge-neon">Peak Mode</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            ['Cloud Cover', '32%'],
            ['Radiation', '680 W/m²'],
            ['UV Index', '7 (High)'],
            ['Sunrise', '06:14'],
            ['Sunset', '19:47'],
            ['Temperature', '24°C'],
          ].map(([k, v]) => (
            <div key={k} className="p-3 rounded-xl" style={{ background: 'rgba(57,255,20,0.04)', border: '1px solid rgba(57,255,20,0.1)' }}>
              <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{k}</div>
              <div className="font-outfit font-bold text-sm" style={{ color: '#39FF14' }}>{v}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
