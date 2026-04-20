import { useState, useMemo } from 'react';
import GlassCard from '../components/ui/GlassCard';
import StatCard from '../components/ui/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useUserProfile } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

const APPLIANCES_DEFAULT = [
  { id: 1, name: 'Air Conditioner', icon: '❄️', watts: 1500, hoursPerDay: 8  },
  { id: 2, name: 'Refrigerator',    icon: '🧊', watts: 150,  hoursPerDay: 24 },
  { id: 3, name: 'Washing Machine', icon: '👕', watts: 1000, hoursPerDay: 1  },
  { id: 4, name: 'LED TV',          icon: '📺', watts: 100,  hoursPerDay: 5  },
  { id: 5, name: 'Water Heater',    icon: '🚿', watts: 2000, hoursPerDay: 1  },
  { id: 6, name: 'Ceiling Fan ×4',  icon: '💨', watts: 300,  hoursPerDay: 12 },
  { id: 7, name: 'Laptop',          icon: '💻', watts: 65,   hoursPerDay: 8  },
  { id: 8, name: 'Lighting ×10',    icon: '💡', watts: 100,  hoursPerDay: 6  },
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const SOLAR_PACKAGES = [
  { kw: 1,  panels: 3,  cost: 45000,  saving: 1200, area: 60  },
  { kw: 2,  panels: 5,  cost: 85000,  saving: 2400, area: 100 },
  { kw: 3,  panels: 8,  cost: 120000, saving: 3600, area: 150 },
  { kw: 5,  panels: 13, cost: 190000, saving: 6000, area: 250 },
  { kw: 10, panels: 25, cost: 350000, saving: 12000,area: 500 },
];

const TIPS_GRID = [
  { icon: '🌅', tip: 'Use appliances during off-peak hours (10pm–6am) — night tariff is cheaper in many states.' },
  { icon: '⭐', tip: 'Buy BEE 5-star rated appliances — they consume 30–40% less electricity.' },
  { icon: '❄️', tip: 'Clean AC filters monthly — dirty filters increase power consumption by 15%.' },
  { icon: '☀️', tip: 'Installing a 3kW solar panel can offset your entire monthly bill within 5 years.' },
  { icon: '💡', tip: 'Replace all incandescent bulbs with LED — saves ₹2000–₹4000 per year.' },
  { icon: '🔌', tip: 'Use smart power strips to eliminate phantom load from idle electronics.' },
];

export default function GridDashboard({ live }) {
  const { userProfile } = useUserProfile();
  const ebRate   = userProfile?.ebRate    || 6.5;
  const limitKwh = userProfile?.usageLimitKwh || 300;
  const currency = userProfile?.currency  || '₹';
  const ebName   = userProfile?.ebName    || 'TANGEDCO';
  const { theme }  = useTheme();

  // ── Calculator state ───────────────────────────────────────────────────
  const [activeTab,  setActiveTab]  = useState('calculator'); // calculator | monthly | solar | appliances | tips

  // ── Appliance estimator state ─────────────────────────────────────────────
  const [appliances, setAppliances] = useState(APPLIANCES_DEFAULT.map(a => ({ ...a })));

  // ── EB bill calculation (TANGEDCO slab example — adapts to community) ─────
  const calcBill = (units) => {
    const u = parseFloat(units) || 0;
    let bill = 0;
    if (ebName === 'TANGEDCO' || ebName === 'TNEB') {
      if (u <= 100)       bill = 0;
      else if (u <= 200)  bill = (u - 100) * 1.5;
      else if (u <= 500)  bill = 100 * 1.5 + (u - 200) * 3;
      else                bill = 100 * 1.5 + 300 * 3 + (u - 500) * 6.5;
    } else {
      bill = u * ebRate;
    }
    return bill.toFixed(2);
  };

  // ── Monthly graph data (simulated seasonal variation) ─────────────────────
  const monthlyData = useMemo(() => MONTHS.map((m, i) => {
    const seasonal = 1 + Math.sin((i - 2) * 0.5) * 0.3; // peaks in summer
    const units    = Math.round(limitKwh * seasonal);
    return { month: m, units, bill: parseFloat(calcBill(units)) };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [limitKwh, ebRate]);

  // ── Appliance total ───────────────────────────────────────────────────────
  const applianceTotal = useMemo(() => {
    const kwhPerDay  = appliances.reduce((s, a) => s + (a.watts * a.hoursPerDay) / 1000, 0);
    const kwhPerMonth = kwhPerDay * 30;
    const bill       = parseFloat(calcBill(kwhPerMonth));
    return { kwhPerDay: kwhPerDay.toFixed(2), kwhPerMonth: kwhPerMonth.toFixed(0), bill };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliances, ebRate]);

  // ── Bill prediction (next 6 months) ──────────────────────────────────────
  const billPrediction = useMemo(() => {
    const now = new Date().getMonth();
    return Array.from({ length: 6 }, (_, i) => {
      const mi   = (now + i) % 12;
      const seasonal = 1 + Math.sin((mi - 2) * 0.5) * 0.3;
      const units = Math.round(limitKwh * seasonal);
      return { month: MONTHS[mi], units, bill: parseFloat(calcBill(units)) };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limitKwh, ebRate]);

  // ── Alerts ────────────────────────────────────────────────────────────────
  const estimatedMonthly = live.cons * 24 * 30;
  const highConsumption  = live.cons > 3;
  const nearLimit        = estimatedMonthly > limitKwh * 0.8;

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setActiveTab(id)}
      style={{
        padding: '8px 14px', borderRadius: 8, fontSize: 11, fontFamily: 'Outfit', fontWeight: 600, cursor: 'pointer',
        background: activeTab === id ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${activeTab === id ? 'rgba(245,158,11,0.4)' : 'var(--border-dim)'}`,
        color: activeTab === id ? '#F59E0B' : 'var(--text-muted)',
        whiteSpace: 'nowrap',
      }}>{label}</button>
  );

  return (
    <div className="p-4 md:p-6 animate-fade-in">

      {/* Alerts */}
      {highConsumption && (
        <div className="mb-3 px-4 py-3 rounded-xl text-xs flex gap-2"
             style={{ background: 'rgba(255,59,92,0.08)', border: '1px solid rgba(255,59,92,0.3)', color: '#FF3B5C' }}>
          🚨 High consumption: <strong>{live.cons.toFixed(2)} kW</strong> — check running appliances.
        </div>
      )}
      {nearLimit && (
        <div className="mb-3 px-4 py-3 rounded-xl text-xs flex gap-2"
             style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B' }}>
          ⚠️ Usage alert: Estimated <strong>{estimatedMonthly.toFixed(0)} kWh/month</strong> approaching your {limitKwh} kWh limit.
        </div>
      )}

      <div className="mb-5">
        <h2 className="font-outfit font-bold text-xl" style={{ color: 'var(--text-primary)' }}>🔌 Domestic Grid</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
          {ebName} · {currency}{ebRate}/kWh · Limit: {limitKwh} kWh/month
        </p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <StatCard label="Now"       icon="🔌" value={live.cons.toFixed(2)}           unit="kW"  delta="Live usage"           accent="elec"   />
        <StatCard label="Today Est" icon="📊" value={(live.cons * 24).toFixed(1)}     unit="kWh" delta="Units today"           accent="neon"   />
        <StatCard label="Month Est" icon="📅" value={estimatedMonthly.toFixed(0)}     unit="kWh" delta={nearLimit ? '⚠️ Near limit' : 'On track'} accent={nearLimit ? 'amber' : 'violet'} />
        <StatCard label="Bill Est"  icon="💸" value={calcBill(estimatedMonthly)}      unit={currency} delta="This month"       accent="amber"  />
      </div>

      {/* Tab navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        <TabBtn id="calculator" label="🧮 EB Calculator" />
        <TabBtn id="monthly"    label="📈 Monthly Graph"  />
        <TabBtn id="appliances" label="⚡ Appliance Usage" />
        <TabBtn id="solar"      label="☀️ Go Solar"       />
        <TabBtn id="tips"       label="💡 Saving Tips"    />
      </div>

      {/* ── EB CALCULATOR ── */}
      {activeTab === 'calculator' && (
        <GlassCard variant="amber">
          <div className="font-outfit font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>🧮 EB Bill Calculator ({ebName})</div>
          
          <div className="mb-4 bg-black/10 dark:bg-white/5 p-3 rounded-lg border border-[var(--border-dim)]">
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Estimated Month Units (Auto-calculated)</label>
            <div className="font-outfit font-bold text-2xl" style={{ color: '#F59E0B' }}>
              {estimatedMonthly.toFixed(0)} <span className="text-sm font-normal text-amber-500 ml-1" style={{ fontFamily: 'JetBrains Mono' }}>(kWh)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl text-center"
               style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Estimated Bill</div>
            <div className="font-outfit font-black" style={{ fontSize: 48, color: '#F59E0B', lineHeight: 1 }}>
              {currency}{calcBill(estimatedMonthly.toFixed(0))}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
              {estimatedMonthly.toFixed(0)} units · {currency}{ebRate}/kWh base rate
            </div>
          </div>
          {estimatedMonthly > 200 && (
            <div className="mt-3 text-xs p-3 rounded-xl"
                 style={{ background: 'rgba(57,255,20,0.05)', border: '1px solid rgba(57,255,20,0.15)', color: '#39FF14' }}>
              💡 Installing 2kW solar could reduce this bill by ~{currency}{Math.round(calcBill(estimatedMonthly.toFixed(0)) * 0.6)}/month
            </div>
          )}
        </GlassCard>
      )}

      {/* ── MONTHLY GRAPH ── */}
      {activeTab === 'monthly' && (
        <div className="flex flex-col gap-4">
          <GlassCard>
            <div className="font-outfit font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>📈 Monthly Units (kWh)</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} barSize={18}>
                <defs>
                  <linearGradient id="barUnit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={theme === 'light' ? '#0284c7' : '#00F0FF'} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={theme === 'light' ? '#0284c7' : '#00F0FF'} stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.06)'} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: theme === 'light' ? '#334155' : 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: theme === 'light' ? '#334155' : 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: theme === 'light' ? '#fff' : 'rgba(8,8,8,0.95)', border: '1px solid var(--border-dim)', borderRadius: 10, fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-primary)' }}
                  formatter={v => [`${v} kWh`, 'Units']} />
                <Bar dataKey="units" fill="url(#barUnit)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
          <GlassCard variant="amber">
            <div className="font-outfit font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>💸 Bill Prediction (next 6 months)</div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={billPrediction}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.06)'} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: theme === 'light' ? '#334155' : 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: theme === 'light' ? '#334155' : 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: theme === 'light' ? '#fff' : 'rgba(8,8,8,0.95)', border: '1px solid var(--border-dim)', borderRadius: 10, fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-primary)' }}
                  formatter={v => [`${currency}${v}`, 'Bill']} />
                <Line type="monotone" dataKey="bill" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B', r: 4 }}
                  style={{ filter: 'drop-shadow(0 0 4px rgba(245,158,11,0.6))' }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1 mt-3">
              {billPrediction.map(b => (
                <div key={b.month} className="flex justify-between text-xs py-1.5 border-b" style={{ borderColor: 'var(--border-dim)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{b.month}</span>
                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>{b.units} kWh</span>
                  <span style={{ color: '#F59E0B', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{currency}{b.bill}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* ── APPLIANCE USAGE ── */}
      {activeTab === 'appliances' && (
        <div className="flex flex-col gap-4">
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>⚡ Appliance Usage Estimator</span>
              <div className="text-xs text-right" style={{ fontFamily: 'JetBrains Mono' }}>
                <div style={{ color: '#F59E0B' }}>{applianceTotal.kwhPerDay} kWh/day</div>
                <div style={{ color: 'var(--text-muted)' }}>{applianceTotal.kwhPerMonth} kWh/mo</div>
              </div>
            </div>
            {appliances.map((a, idx) => (
              <div key={a.id} className="py-3 border-b last:border-0" style={{ borderColor: 'var(--border-dim)' }}>
                <div className="flex items-center gap-3 mb-2">
                  <span style={{ fontSize: 18 }}>{a.icon}</span>
                  <span className="flex-1 text-sm" style={{ color: 'var(--text-primary)' }}>{a.name}</span>
                  <span style={{ color: '#F59E0B', fontFamily: 'JetBrains Mono', fontSize: 11 }}>
                    {((a.watts * a.hoursPerDay) / 1000).toFixed(2)} kWh/day
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-2 rounded-lg">
                    <label className="text-[10px] block mb-1 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Power Draw</label>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>{a.watts.toLocaleString()} W</div>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg">
                    <label className="text-[10px] block mb-1 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>System Logged</label>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>{a.hoursPerDay} h/day</div>
                  </div>
                </div>
              </div>
            ))}
          </GlassCard>
          <GlassCard variant="amber">
            <div className="font-outfit font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>📊 Summary</div>
            {[
              ['Daily consumption', `${applianceTotal.kwhPerDay} kWh`],
              ['Monthly consumption', `${applianceTotal.kwhPerMonth} kWh`],
              ['Estimated bill', `${currency}${applianceTotal.bill}`],
              ['Rate used', `${currency}${ebRate}/kWh (${ebName})`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs py-2 border-b" style={{ borderColor: 'var(--border-dim)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ color: '#F59E0B', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </GlassCard>
        </div>
      )}

      {/* ── BUY SOLAR ── */}
      {activeTab === 'solar' && (
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-2xl" style={{ background: 'rgba(57,255,20,0.05)', border: '1px solid rgba(57,255,20,0.2)' }}>
            <div className="font-outfit font-bold text-sm mb-1" style={{ color: '#39FF14' }}>☀️ Why Go Solar?</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
              Based on your usage of ~{limitKwh} kWh/month at {currency}{ebRate}/kWh, your annual EB bill is ~{currency}{Math.round(calcBill(limitKwh) * 12)}.
              A solar system pays back in <strong style={{ color: '#39FF14' }}>4–6 years</strong> and lasts 25 years.
            </div>
          </div>
          {SOLAR_PACKAGES.map(pkg => {
            const payback = Math.round(pkg.cost / (pkg.saving * 12 * 10) * 10) / 10;
            const savings25yr = pkg.saving * 12 * 25;
            return (
              <GlassCard key={pkg.kw} variant={pkg.kw === 3 ? 'neon' : 'default'}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-outfit font-bold text-base" style={{ color: pkg.kw === 3 ? '#39FF14' : 'var(--text-primary)' }}>
                      {pkg.kw} kW System {pkg.kw === 3 && <span className="badge badge-neon ml-2" style={{ fontSize: 9 }}>RECOMMENDED</span>}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                      {pkg.panels} panels · {pkg.area} sq.ft roof area
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-outfit font-bold text-lg" style={{ color: '#F59E0B' }}>{currency}{pkg.cost.toLocaleString()}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>installation</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ['Monthly saving', `${currency}${pkg.saving}`],
                    ['Payback period', `${payback} yrs`],
                    ['25yr savings', `${currency}${savings25yr.toLocaleString()}`],
                  ].map(([k, v]) => (
                    <div key={k} className="p-2 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-dim)' }}>
                      <div className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>{k}</div>
                      <div style={{ color: '#39FF14', fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 12 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <button className={`w-full py-2.5 text-xs font-outfit font-semibold mt-3 ${pkg.kw === 3 ? 'btn-neon' : 'btn-ghost'}`}
                  onClick={() => alert(`Enquiry submitted for ${pkg.kw}kW system. Our team will contact you within 24 hours.`)}>
                  Get Quote →
                </button>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* ── SAVING TIPS ── */}
      {activeTab === 'tips' && (
        <div className="flex flex-col gap-3">
          {TIPS_GRID.map((t, i) => (
            <div key={i} className="flex gap-3 p-4 rounded-2xl"
                 style={{ background: 'rgba(57,255,20,0.04)', border: '1px solid rgba(57,255,20,0.12)' }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{t.icon}</span>
              <p className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Sans', lineHeight: 1.7 }}>{t.tip}</p>
            </div>
          ))}
          <GlassCard variant="neon">
            <div className="font-outfit font-bold text-sm mb-3" style={{ color: '#39FF14' }}>💰 Potential Savings</div>
            {[
              ['Switch to LED lighting',   `${currency}${Math.round(ebRate * 30)}/month`],
              ['5-star AC instead of 3-star', `${currency}${Math.round(ebRate * 50)}/month`],
              ['Solar water heater',       `${currency}${Math.round(ebRate * 60)}/month`],
              ['Install 3kW solar',        `${currency}${Math.round(ebRate * 350)}/month`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs py-2 border-b" style={{ borderColor: 'var(--border-dim)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ color: '#39FF14', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </GlassCard>
        </div>
      )}
    </div>
  );
}
