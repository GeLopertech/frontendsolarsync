import { useState, useEffect } from 'react';
import GlassCard from '../components/ui/GlassCard';
import ForecastBarChart from '../charts/ForecastBarChart';
import EnergyAreaChart from '../charts/EnergyAreaChart';

const API_KEY = '1a316a713c13cdddbdbf1318640646c1';
const CITY    = 'Tamil Nadu';

// ── Weather icon → emoji ──────────────────────────────────────────────────────
function weatherEmoji(id) {
  if (id >= 200 && id < 300) return '⛈️';
  if (id >= 300 && id < 400) return '🌦️';
  if (id >= 500 && id < 600) return '🌧️';
  if (id >= 600 && id < 700) return '❄️';
  if (id >= 700 && id < 800) return '🌫️';
  if (id === 800)             return '☀️';
  if (id === 801)             return '🌤️';
  if (id <= 804)              return '⛅';
  return '🌡️';
}

// ── Estimate solar kWh from cloud cover & UV ──────────────────────────────────
function estimateSolarKwh(cloudPct, tempC) {
  const peakSunHours = 5.5; // Tamil Nadu avg
  const panelKw      = 9.6; // from installation
  const clearSkyYield = panelKw * peakSunHours;
  const cloudFactor   = 1 - (cloudPct / 100) * 0.75;
  const tempFactor    = 1 - Math.max(0, (tempC - 25) * 0.004);
  return parseFloat((clearSkyYield * cloudFactor * tempFactor).toFixed(1));
}

// ── Format Unix timestamp → HH:MM ────────────────────────────────────────────
function fmtTime(unix, tz = 0) {
  const d = new Date((unix + tz) * 1000);
  return d.toUTCString().slice(17, 22);
}

export default function Forecast() {
  const [forecast,  setForecast]  = useState([]);
  const [current,   setCurrent]   = useState(null);
  const [hourly,    setHourly]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError('');
      try {
        // ── 1. Current weather ──────────────────────────────────────────────
        const curRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(CITY)}&appid=${API_KEY}&units=metric`
        );
        if (!curRes.ok) throw new Error('City not found or API key invalid.');
        const curData = await curRes.json();

        setCurrent({
          temp:        Math.round(curData.main.temp),
          feelsLike:   Math.round(curData.main.feels_like),
          humidity:    curData.main.humidity,
          windSpeed:   curData.wind.speed,
          cloudPct:    curData.clouds.all,
          description: curData.weather[0].description,
          icon:        weatherEmoji(curData.weather[0].id),
          sunrise:     fmtTime(curData.sys.sunrise, curData.timezone),
          sunset:      fmtTime(curData.sys.sunset,  curData.timezone),
          city:        curData.name,
          country:     curData.sys.country,
          visibility:  (curData.visibility / 1000).toFixed(1),
          pressure:    curData.main.pressure,
          uvIndex:     null, // not in free current endpoint
        });

        // ── 2. 5-day / 3-hour forecast ──────────────────────────────────────
        const fRes = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(CITY)}&appid=${API_KEY}&units=metric`
        );
        const fData = await fRes.json();

        // Group by day
        const dayMap = {};
        fData.list.forEach(item => {
          const date = item.dt_txt.slice(0, 10);
          if (!dayMap[date]) dayMap[date] = [];
          dayMap[date].push(item);
        });

        const days = Object.entries(dayMap).slice(0, 7).map(([date, items], i) => {
          const avgCloud = Math.round(items.reduce((s, x) => s + x.clouds.all, 0) / items.length);
          const avgTemp  = Math.round(items.reduce((s, x) => s + x.main.temp,  0) / items.length);
          const maxTemp  = Math.round(Math.max(...items.map(x => x.main.temp_max)));
          const minTemp  = Math.round(Math.min(...items.map(x => x.main.temp_min)));
          const mainItem = items[Math.floor(items.length / 2)];
          const d        = new Date(date);
          const dayName  = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });

          return {
            day:    dayName,
            date,
            icon:   weatherEmoji(mainItem.weather[0].id),
            kwh:    estimateSolarKwh(avgCloud, avgTemp),
            cloud:  avgCloud,
            maxTemp,
            minTemp,
            today:  i === 0,
            desc:   mainItem.weather[0].description,
          };
        });

        setForecast(days);

        // ── 3. Build hourly chart data from today's 3h intervals ─────────────
        const todayStr  = Object.keys(dayMap)[0];
        const todayData = dayMap[todayStr] || [];

        const hourlyPoints = todayData.map(item => ({
          time:        item.dt_txt.slice(11, 16),
          solar:       estimateSolarKwh(item.clouds.all, item.main.temp) / 5.5,
          consumption: 2.1,
          grid:        item.clouds.all > 70 ? 0.8 : 0,
        }));

        setHourly(hourlyPoints);

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

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-4 md:p-6 animate-fade-in">
        <div className="mb-5">
          <h2 className="font-outfit font-bold text-xl" style={{ color: 'var(--text-primary)' }}>7-Day Solar Forecast</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
            Fetching weather for {CITY}…
          </p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            border: '2px solid rgba(57,255,20,0.15)',
            borderTop: '2px solid #39FF14',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-4 md:p-6 animate-fade-in">
        <div className="mb-5">
          <h2 className="font-outfit font-bold text-xl" style={{ color: 'var(--text-primary)' }}>7-Day Solar Forecast</h2>
        </div>
        <GlassCard>
          <div className="py-8 text-center">
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <p className="text-sm font-outfit" style={{ color: '#FF3B5C' }}>{error}</p>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Check your API key or internet connection.</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-5">
        <h2 className="font-outfit font-bold text-xl" style={{ color: 'var(--text-primary)' }}>7-Day Solar Forecast</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
          OpenWeatherMap · {current?.city}, {current?.country} · Updated live
        </p>
      </div>

      {/* 7-day forecast strip */}
      <div className="flex gap-3 overflow-x-auto pb-2 mb-5" style={{ WebkitOverflowScrolling: 'touch' }}>
        {forecast.map((d, i) => (
          <div key={i} className={`forecast-card ${d.today ? 'today' : ''}`}
               style={{ minWidth: 72, flexShrink: 0 }}>
            <div className="text-[10px] mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>{d.day}</div>
            <div style={{ fontSize: 22, marginBottom: 3 }}>{d.icon}</div>
            <div className="font-outfit font-bold text-sm" style={{
              color: d.today ? '#39FF14' : 'var(--text-primary)',
              textShadow: d.today ? '0 0 10px rgba(57,255,20,0.5)' : 'none',
            }}>
              {d.kwh}<span style={{ fontSize: 9, color: 'var(--text-muted)', marginLeft: 2 }}>kWh</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'JetBrains Mono' }}>☁ {d.cloud}%</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1, fontFamily: 'JetBrains Mono' }}>
              {d.maxTemp}° / {d.minTemp}°
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="two-col grid gap-4 mb-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>7-Day Yield (kWh)</span>
            <span className="badge badge-neon">Live</span>
          </div>
          <ForecastBarChart data={forecast} height={160} />
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Today's Hourly Solar</span>
            <span className="badge badge-elec">3h intervals</span>
          </div>
          {hourly.length > 0
            ? <EnergyAreaChart data={hourly} height={160} showLegend={false} />
            : <div className="flex items-center justify-center h-40 text-xs" style={{ color: 'var(--text-muted)' }}>No hourly data</div>
          }
        </GlassCard>
      </div>

      {/* Current weather panel */}
      {current && (
        <GlassCard variant="neon">
          <div className="flex items-center justify-between mb-4">
            <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              Weather Conditions · {current.city}
            </span>
            <span className="badge badge-neon" style={{ textTransform: 'capitalize' }}>
              {current.icon} {current.description}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              ['🌡️ Temperature',  `${current.temp}°C (feels ${current.feelsLike}°C)`],
              ['☁️ Cloud Cover',  `${current.cloudPct}%`],
              ['💧 Humidity',     `${current.humidity}%`],
              ['💨 Wind Speed',   `${current.windSpeed} m/s`],
              ['🌅 Sunrise',      current.sunrise],
              ['🌇 Sunset',       current.sunset],
              ['👁️ Visibility',   `${current.visibility} km`],
              ['🔵 Pressure',     `${current.pressure} hPa`],
              ['☀️ Est. Solar',   `${forecast[0]?.kwh || '—'} kWh today`],
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
