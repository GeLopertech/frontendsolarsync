import { useState, useEffect } from 'react';
import GlassCard from '../components/ui/GlassCard';
import ForecastBarChart from '../charts/ForecastBarChart';
import EnergyAreaChart from '../charts/EnergyAreaChart';

const API_KEY = '1a316a713c13cdddbdbf1318640646c1';
const CITY    = 'Tamil Nadu';

const weatherIcon = (main) => ({
  Clear: '☀️', Clouds: '⛅', Rain: '🌧️', Drizzle: '🌦️',
  Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️', Fog: '🌫️', Haze: '🌫️',
}[main] || '🌤️');

// Estimate solar yield from cloud cover % and temperature
const estimateSolarKwh = (cloudPct, tempC) => {
  const base = 9.2; // panel peak kW
  const hours = 7;  // avg peak sun hours Tamil Nadu
  const cloudFactor = 1 - (cloudPct / 100) * 0.75;
  const tempFactor  = 1 - Math.max(0, tempC - 25) * 0.004;
  return parseFloat((base * hours * cloudFactor * tempFactor).toFixed(1));
};

// Generate fake hourly solar for today (realistic bell curve)
const generateHourlySolar = (cloudPct) => {
  return Array.from({ length: 24 }, (_, h) => {
    const solar = h >= 6 && h <= 19
      ? parseFloat((Math.sin(((h - 6) / 13) * Math.PI) * 9.2 * (1 - cloudPct / 100 * 0.7)).toFixed(2))
      : 0;
    const consumption = parseFloat((1.2 + Math.sin(h * 0.5) * 0.5 + (h >= 7 && h <= 9 ? 1.2 : 0) + (h >= 18 && h <= 21 ? 1.5 : 0)).toFixed(2));
    return {
      time:        `${String(h).padStart(2, '0')}:00`,
      solar,
      consumption,
      grid:        Math.max(0, consumption - solar),
    };
  });
};

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function Forecast() {
  const [forecast,     setForecast]     = useState([]);
  const [current,      setCurrent]      = useState(null);
  const [hourlyData,   setHourlyData]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Current weather
        const curRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(CITY)}&appid=${API_KEY}&units=metric`
        );
        if (!curRes.ok) throw new Error('Weather API error');
        const curData = await curRes.json();
        setCurrent(curData);

        // 5-day / 3-hour forecast
        const fcRes = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(CITY)}&appid=${API_KEY}&units=metric`
        );
        const fcData = await fcRes.json();

        // Group by day — pick midday reading per day
        const dayMap = {};
        fcData.list.forEach(item => {
          const date = item.dt_txt.split(' ')[0];
          const hour = parseInt(item.dt_txt.split(' ')[1]);
          if (!dayMap[date] || Math.abs(hour - 12) < Math.abs(parseInt(dayMap[date].dt_txt.split(' ')[1]) - 12)) {
            dayMap[date] = item;
          }
        });

        const days = Object.values(dayMap).slice(0, 7).map((item, i) => {
          const cloud = item.clouds.all;
          const temp  = item.main.temp;
          const d     = new Date(item.dt * 1000);
          return {
            day:   i === 0 ? 'Today' : DAYS[d.getDay()],
            icon:  weatherIcon(item.weather[0].main),
            kwh:   estimateSolarKwh(cloud, temp),
            cloud,
            temp:  Math.round(temp),
            today: i === 0,
          };
        });

        setForecast(days);

        // Hourly solar for today using current cloud cover
        const todayCloud = curData.clouds.all;
        setHourlyData(generateHourlySolar(todayCloud));

      } catch (err) {
        setError('Could not load weather data. Showing estimates.');
        // Fallback fake data
        setForecast([
          { day:'Today', icon:'☀️', kwh:8.4, cloud:18, temp:34, today:true },
          { day:'Tue',   icon:'⛅', kwh:6.9, cloud:38, temp:32, today:false },
          { day:'Wed',   icon:'🌧️', kwh:3.2, cloud:85, temp:28, today:false },
          { day:'Thu',   icon:'🌤️', kwh:7.8, cloud:25, temp:33, today:false },
          { day:'Fri',   icon:'☀️', kwh:9.1, cloud:10, temp:35, today:false },
          { day:'Sat',   icon:'⛅', kwh:6.5, cloud:42, temp:31, today:false },
          { day:'Sun',   icon:'☀️', kwh:8.8, cloud:15, temp:34, today:false },
        ]);
        setHourlyData(generateHourlySolar(20));
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const today = forecast.find(d => d.today) || {};

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="mb-5">
        <h2 className="font-outfit font-bold text-xl" style={{ color: 'var(--text-primary)' }}>7-Day Solar Forecast</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
          OpenWeatherMap · {CITY} · {loading ? 'Loading…' : 'Updated now'}
        </p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2 rounded-xl text-xs"
             style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#F59E0B' }}>
          ⚠️ {error}
        </div>
      )}

      {/* 7-day strip */}
      <div className="flex gap-3 overflow-x-auto pb-2 mb-5" style={{ WebkitOverflowScrolling: 'touch' }}>
        {loading
          ? Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="forecast-card" style={{ opacity: 0.4, minWidth: 72 }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>···</div>
              </div>
            ))
          : forecast.map((d, i) => (
              <div key={i} className={`forecast-card ${d.today ? 'today' : ''}`} style={{ minWidth: 72 }}>
                <div className="text-[10px] mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>{d.day}</div>
                <div style={{ fontSize: 22, marginBottom: 3 }}>{d.icon}</div>
                <div className="font-outfit font-bold text-sm" style={{
                  color: d.today ? '#39FF14' : 'var(--text-primary)',
                  textShadow: d.today ? '0 0 10px rgba(57,255,20,0.5)' : 'none',
                }}>
                  {d.kwh}<span style={{ fontSize: 9, color: 'var(--text-muted)', marginLeft: 2 }}>kWh</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'JetBrains Mono' }}>☁ {d.cloud}%</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>🌡 {d.temp}°C</div>
              </div>
            ))
        }
      </div>

      {/* AI Smart Suggestion based on weather */}
      <GlassCard variant="neon" className="mb-5">
        <div className="flex items-start gap-3">
          <span style={{ fontSize: 24 }}>🧠</span>
          <div>
            <div className="font-outfit font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>AI Weather Recommendation</div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {!loading && today.cloud > 50 
                ? `Heavy cloud cover expected today (${today.cloud}%). Solar yield will be low. Conserve energy by delaying heavy appliances like washing machines. Wait for clearer days to avoid grid import.`
                : !loading 
                  ? `Clear skies today (${today.cloud ?? 0}% clouds)! This is an optimal time to run high-load appliances (AC, washing machine) and automatically sell surplus solar generation to the community P2P network.`
                  : "Analyzing forecast..."}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Charts */}
      <div className="two-col grid gap-4 mb-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>7-Day Yield (kWh)</span>
          </div>
          <ForecastBarChart data={forecast} height={160} />
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Today's Hourly Solar</span>
            <span className="badge badge-neon">Estimated</span>
          </div>
          <EnergyAreaChart data={hourlyData} height={160} showLegend={false} />
        </GlassCard>
      </div>

      {/* Weather conditions */}
      <GlassCard variant="neon">
        <div className="flex items-center justify-between mb-4">
          <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Weather Conditions · Today</span>
          <span className="badge badge-neon">{today.icon} {CITY}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            ['Cloud Cover',  loading ? '…' : `${today.cloud ?? '—'}%`],
            ['Est. Yield',   loading ? '…' : `${today.kwh ?? '—'} kWh`],
            ['Temperature',  loading ? '…' : current ? `${Math.round(current.main.temp)}°C` : `${today.temp}°C`],
            ['Humidity',     loading ? '…' : current ? `${current.main.humidity}%` : '—'],
            ['Wind Speed',   loading ? '…' : current ? `${current.wind.speed.toFixed(1)} m/s` : '—'],
            ['Condition',    loading ? '…' : current ? current.weather[0].description : '—'],
          ].map(([k, v]) => (
            <div key={k} className="p-3 rounded-xl" style={{ background: 'rgba(57,255,20,0.04)', border: '1px solid rgba(57,255,20,0.1)' }}>
              <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{k}</div>
              <div className="font-outfit font-bold text-sm" style={{ color: '#39FF14', textTransform: 'capitalize' }}>{v}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
