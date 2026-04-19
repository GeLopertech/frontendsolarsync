import { useState, useEffect } from 'react';
import GlassCard from '../components/ui/GlassCard';
import ForecastBarChart from '../charts/ForecastBarChart';
import EnergyAreaChart from '../charts/EnergyAreaChart';

const API_KEY = '1a316a713c13cdddbdbf1318640646c1';
const CITY    = 'Chennai';  // capital city of Tamil Nadu

// ── Weather icon → emoji ──────────────────────────────────────────────────────
function weatherIcon(main) {
  const map = {
    Clear:        '☀️',
    Clouds:       '⛅',
    Rain:         '🌧️',
    Drizzle:      '🌦️',
    Thunderstorm: '⛈️',
    Snow:         '❄️',
    Mist:         '🌫️',
    Fog:          '🌫️',
    Haze:         '🌫️',
  };
  return map[main] || '🌤️';
}

// ── Estimate solar kWh from cloud cover % ─────────────────────────────────────
function estimateSolarKwh(cloudPct, panelKw = 9.6) {
  const efficiency = 1 - (cloudPct / 100) * 0.75;
  const peakHours  = 5.5; // avg peak sun hours in Tamil Nadu
  return parseFloat((panelKw * efficiency * peakHours * 0.2).toFixed(1));
}

// ── Group 3-hour forecast into daily buckets ──────────────────────────────────
function groupByDay(list) {
  const days = {};
  list.forEach(item => {
    const date  = new Date(item.dt * 1000);
    const key   = date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
    const day   = date.toLocaleDateString('en-IN', { weekday: 'short' });
    if (!days[key]) {
      days[key] = {
        day,
        key,
        date,
        temps:  [],
        clouds: [],
        icons:  [],
        mains:  [],
      };
    }
    days[key].temps.push(item.main.temp);
    days[key].clouds.push(item.clouds.all);
    days[key].icons.push(item.weather[0].main);
    days[key].mains.push(item.weather[0].main);
  });

  return Object.values(days).slice(0, 7).map((d, i) => {
    const avgCloud = Math.round(d.clouds.reduce((a, b) => a + b, 0) / d.clouds.length);
    const mainWeather = d.mains.sort((a, b) =>
      d.mains.filter(v => v === b).length - d.mains.filter(v => v === a).length
    )[0];
    return {
      day:   d.day,
      date:  d.date,
      icon:  weatherIcon(mainWeather),
      kwh:   estimateSolarKwh(avgCloud),
      cloud: avgCloud,
      temp:  Math.round(d.temps.reduce((a, b) => a + b, 0) / d.temps.length),
      today: i === 0,
    };
  });
}

// ── Build hourly chart data from today's 3h slots ─────────────────────────────
function buildHourlyChart(list) {
  const today = new Date().toDateString();
  return list
    .filter(item => new Date(item.dt * 1000).toDateString() === today)
    .map(item => {
      const hour  = new Date(item.dt * 1000).getHours();
      const cloud = item.clouds.all;
      const solar = parseFloat((9.6 * (1 - cloud / 100 * 0.75) * (
        Math.sin(((hour - 6) / 14) * Math.PI) > 0
          ? Math.sin(((hour - 6) / 14) * Math.PI)
          : 0
      )).toFixed(2));
      return {
        time:        `${String(hour).padStart(2, '0')}:00`,
        solar,
        consumption: parseFloat((1.2 + Math.random() * 0.8).toFixed(2)),
        grid:        parseFloat((Math.max(0, 1.2 - solar) * 0.5).toFixed(2)),
      };
    });
}

export default function Forecast() {
  const [forecast,    setForecast]    = useState([]);
  const [hourly,      setHourly]      = useState([]);
  const [current,     setCurrent]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError('');
      try {
        // ── Current weather ──────────────────────────────────────────────────
        const curRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`
        );
        if (!curRes.ok) {
          const err = await curRes.json();
          throw new Error(err.message || 'City not found or API key invalid.');
        }
        const curData = await curRes.json();
        setCurrent(curData);

        // ── 5-day / 3-hour forecast ──────────────────────────────────────────
        const fRes = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&appid=${API_KEY}&units=metric`
        );
        const fData = await fRes.json();
        setForecast(groupByDay(fData.list));
        setHourly(buildHourlyChart(fData.list));
        setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      } catch (err) {
        setError(err.message || 'Failed to fetch weather data.');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh every 30 minutes
    const id = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-4 md:p-6 animate-fade-in">
        <div className="mb-5">
          <h2 className="font-outfit font-bold text-xl" style={{ color: 'var(--text-primary)' }}>7-Day Solar Forecast</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
            Fetching live weather for {CITY}…
          </p>
        </div>
        <GlassCard>
          <div className="flex items-center justify-center py-16 gap-3">
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              border: '2px solid rgba(57,255,20,0.2)',
              borderTop: '2px solid #39FF14',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading weather data…</span>
          </div>
        </GlassCard>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-4 md:p-6 animate-fade-in">
        <div className="mb-5">
          <h2 className="font-outfit font-bold text-xl" style={{ color: 'var(--text-primary)' }}>7-Day Solar Forecast</h2>
        </div>
        <GlassCard>
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div style={{ fontSize: 32 }}>⚠️</div>
            <p style={{ color: '#FF3B5C', fontSize: 13, fontFamily: 'JetBrains Mono' }}>{error}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>Check your API key or internet connection.</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  const today = forecast[0];

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-5">
        <h2 className="font-outfit font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
          7-Day Solar Forecast
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
          OpenWeatherMap · {CITY}, Tamil Nadu · Updated {lastUpdated}
        </p>
      </div>

      {/* 7-day forecast strip */}
      <div className="flex gap-3 overflow-x-auto pb-2 mb-5" style={{ WebkitOverflowScrolling: 'touch' }}>
        {forecast.map((d, i) => (
          <div key={i} className={`forecast-card ${d.today ? 'today' : ''}`}
               style={{ minWidth: 72 }}>
            <div className="text-[10px] mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
              {d.day}
            </div>
            <div style={{ fontSize: 22, marginBottom: 3 }}>{d.icon}</div>
            <div className="font-outfit font-bold text-sm" style={{
              color: d.today ? '#39FF14' : 'var(--text-primary)',
              textShadow: d.today ? '0 0 10px rgba(57,255,20,0.5)' : 'none',
            }}>
              {d.kwh}<span style={{ fontSize: 9, color: 'var(--text-muted)', marginLeft: 2 }}>kWh</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'JetBrains Mono' }}>
              ☁ {d.cloud}%
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
              🌡 {d.temp}°C
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="two-col grid gap-4 mb-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              7-Day Yield (kWh)
            </span>
            <span className="badge badge-neon">Live</span>
          </div>
          <ForecastBarChart data={forecast} height={160} />
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              Today's Hourly Solar
            </span>
            <span className="badge badge-elec">Today</span>
          </div>
          {hourly.length > 0
            ? <EnergyAreaChart data={hourly} height={160} showLegend={false} />
            : <div className="flex items-center justify-center h-40 text-xs" style={{ color: 'var(--text-muted)' }}>
                No hourly data for today yet.
              </div>
          }
        </GlassCard>
      </div>

      {/* Live weather conditions */}
      {current && (
        <GlassCard variant="neon">
          <div className="flex items-center justify-between mb-4">
            <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              Weather Conditions · {CITY}
            </span>
            <span className="badge badge-neon">
              {weatherIcon(current.weather[0].main)} {current.weather[0].description}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              ['🌡️ Temperature',  `${Math.round(current.main.temp)}°C`],
              ['🤔 Feels Like',   `${Math.round(current.main.feels_like)}°C`],
              ['☁️ Cloud Cover',  `${current.clouds.all}%`],
              ['💧 Humidity',     `${current.main.humidity}%`],
              ['🌬️ Wind',        `${current.wind.speed} m/s`],
              ['👁️ Visibility',  `${(current.visibility / 1000).toFixed(1)} km`],
              ['📈 Pressure',    `${current.main.pressure} hPa`],
              ['🌅 Sunrise',     new Date(current.sys.sunrise * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })],
              ['🌇 Sunset',      new Date(current.sys.sunset  * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })],
              ['⚡ Est. Solar',  today ? `${today.kwh} kWh today` : '—'],
              ['🏙️ City',       current.name],
              ['🗺️ Country',    current.sys.country],
            ].map(([k, v]) => (
              <div key={k} className="p-3 rounded-xl" style={{
                background: 'rgba(57,255,20,0.04)',
                border: '1px solid rgba(57,255,20,0.1)',
              }}>
                <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{k}</div>
                <div className="font-outfit font-bold text-sm" style={{ color: '#39FF14' }}>{v}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
