import { useState, useEffect, useRef } from 'react';
import GlassCard from '../components/ui/GlassCard';
import StatCard from '../components/ui/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine } from 'recharts';
import { useCommunity } from '../context/CommunityContext';
import { calcEBBill, energySavingTips } from '../data/seed';

// ── Monthly grid data generator based on community profile ───────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function generateMonthlyData(baseKwh, solarCapKw) {
  return MONTHS.map((m, i) => {
    const seasonal = 1 + Math.sin((i - 2) / 12 * Math.PI * 2) * 0.15;
    const grid  = Math.round(baseKwh * seasonal * (0.9 + Math.random() * 0.2));
    const solar = Math.round(solarCapKw * 30 * 5 * (0.7 + Math.sin((i + 3) / 12 * Math.PI * 2) * 0.2));
    return { month: m, grid, solar, total: grid + solar };
  });
}

// ── Default appliances for estimation ────────────────────────────────────────
const DEFAULT_APPLIANCES = [
  { id:1, name:'AC (1.5 ton)',     watts:1500, hoursPerDay:8  },
  { id:2, name:'Refrigerator',     watts:150,  hoursPerDay:24 },
  { id:3, name:'Water Heater',     watts:2000, hoursPerDay:1  },
  { id:4, name:'Washing Machine',  watts:1000, hoursPerDay:1  },
  { id:5, name:'LED Lights (10x)', watts:100,  hoursPerDay:6  },
  { id:6, name:'TV',               watts:120,  hoursPerDay:5  },
  { id:7, name:'Fan (3x)',         watts:225,  hoursPerDay:12 },
];

const SOLAR_PACKAGES = [
  { kw:1,  panels:3,  price:65000,  subsidy:21694, payback:4.5, label:'Starter' },
  { kw:2,  panels:5,  price:120000, subsidy:43000, payback:4.2, label:'Popular' },
  { kw:3,  panels:8,  price:175000, subsidy:65000, payback:4.0, label:'Optimal' },
  { kw:5,  panels:13, price:270000, subsidy:94000, payback:3.8, label:'Premium' },
  { kw:10, panels:25, price:500000, subsidy:94000, payback:3.5, label:'Commercial' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'rgba(8,8,8,0.95)', border:'1px solid rgba(255,255,255,0.08)',
      borderRadius:10, padding:'10px 14px', backdropFilter:'blur(16px)' }}>
      <p style={{ color:'rgba(255,255,255,0.4)', fontSize:11, marginBottom:6, fontFamily:'JetBrains Mono' }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color:p.color, fontSize:12, fontFamily:'JetBrains Mono', marginBottom:2 }}>
          {p.name}: <strong>{p.value} {p.dataKey === 'bill' ? '₹' : 'kWh'}</strong>
        </p>
      ))}
    </div>
  );
};

export default function GridPage({ live }) {
  const { community } = useCommunity();

  const tariffSlabs  = community?.tariffSlabs  || [{ upTo:100,rate:0 },{ upTo:200,rate:1.5 },{ upTo:500,rate:3 },{ upTo:Infinity,rate:4.5 }];
  const fixedCharge  = community?.fixedCharge  || 30;
  const baseGridKwh  = community?.monthlyGridKwh || 180;
  const solarCapKw   = community ? (community.solarPanels * community.panelWatts) / 1000 : 9.6;
  const location     = community?.location || 'Tamil Nadu';
  const gridType     = community?.gridType  || 'TANGEDCO';

  // ── EB Calculator ─────────────────────────────────────────────────────────
  const [ebUnits,  setEbUnits]  = useState(baseGridKwh.toString());
  const ebBill = calcEBBill(parseFloat(ebUnits) || 0, tariffSlabs, fixedCharge);

  // ── Monthly data ──────────────────────────────────────────────────────────
  const monthlyData = generateMonthlyData(baseGridKwh, solarCapKw);
  const monthlyWithBill = monthlyData.map(d => ({
    ...d,
    bill: calcEBBill(d.grid, tariffSlabs, fixedCharge),
  }));

  // ── Appliance estimator ───────────────────────────────────────────────────
  const [appList, setAppList] = useState(DEFAULT_APPLIANCES.map(a => ({ ...a })));
  const totalEstKwh = appList.reduce((s, a) => s + (a.watts * a.hoursPerDay * 30) / 1000, 0).toFixed(1);
  const estBill     = calcEBBill(parseFloat(totalEstKwh), tariffSlabs, fixedCharge);

  // ── Bill prediction (next 3 months) ──────────────────────────────────────
  const curMonth   = new Date().getMonth();
  const predictions = [0,1,2].map(offset => {
    const idx  = (curMonth + offset) % 12;
    const d    = monthlyWithBill[idx];
    return { month: MONTHS[idx], grid: d.grid, bill: d.bill, solar: d.solar };
  });

  // ── Alerts ────────────────────────────────────────────────────────────────
  const [limitKwh,   setLimitKwh]   = useState(baseGridKwh.toString());
  const [alerts,     setAlerts]     = useState([]);
  const [dismissed,  setDismissed]  = useState([]);
  const alertsCheckedRef = useRef(false);

  useEffect(() => {
    if (alertsCheckedRef.current) return;
    alertsCheckedRef.current = true;
    const newAlerts = [];
    const limit = parseFloat(limitKwh) || baseGridKwh;
    if (baseGridKwh > limit) {
      newAlerts.push({ id:'limit', severity:'error', icon:'🚨',
        title:'Electricity Limit Exceeded',
        msg:`Community grid usage (${baseGridKwh} kWh) exceeds your limit of ${limit} kWh.` });
    }
    if (baseGridKwh > 400) {
      newAlerts.push({ id:'high', severity:'warning', icon:'⚠️',
        title:'High Grid Consumption',
        msg:`Monthly grid usage of ${baseGridKwh} kWh is above the optimal 300 kWh. Consider shifting more loads to solar.` });
    }
    if (live && live.cons > solarCapKw * 0.8) {
      newAlerts.push({ id:'live', severity:'warning', icon:'⚡',
        title:'High Live Consumption',
        msg:`Current usage (${live.cons.toFixed(2)} kW) is near solar capacity. Grid import likely.` });
    }
    setAlerts(newAlerts);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleAlerts = alerts.filter(a => !dismissed.includes(a.id));

  // ── Solar buying recommendation ───────────────────────────────────────────
  const annualGridKwh   = baseGridKwh * 12;
  const annualGridBill  = calcEBBill(baseGridKwh, tariffSlabs, fixedCharge) * 12;
  const recommended     = SOLAR_PACKAGES.find(p => p.kw * 1500 >= baseGridKwh * 0.7) || SOLAR_PACKAGES[2];

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-5">
        <h2 className="font-outfit font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Domestic Grid (EB)</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
          {location} · {gridType} · Based on {community?.label || 'your community'}
        </p>
      </div>

      {/* Live alerts */}
      {visibleAlerts.length > 0 && (
        <div className="flex flex-col gap-2 mb-5">
          {visibleAlerts.map(a => (
            <div key={a.id} className="flex items-start gap-3 px-4 py-3 rounded-xl"
                 style={{
                   background: a.severity === 'error' ? 'rgba(255,59,92,0.08)' : 'rgba(245,158,11,0.08)',
                   border: `1px solid ${a.severity === 'error' ? 'rgba(255,59,92,0.3)' : 'rgba(245,158,11,0.3)'}`,
                 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{a.icon}</span>
              <div className="flex-1">
                <div className="text-xs font-semibold font-outfit"
                     style={{ color: a.severity === 'error' ? '#FF3B5C' : '#F59E0B' }}>{a.title}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{a.msg}</div>
              </div>
              <button onClick={() => setDismissed(d => [...d, a.id])}
                style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* Stat row */}
      <div className="stats-grid grid grid-cols-4 gap-3 mb-5">
        <StatCard label="Grid Usage"    icon="⚡" value={baseGridKwh}           unit="kWh/mo" delta="This month"        accent="elec"   />
        <StatCard label="EB Bill"       icon="💳" value={`₹${calcEBBill(baseGridKwh, tariffSlabs, fixedCharge)}`} unit="/mo" delta="Current estimate" accent="amber"  />
        <StatCard label="Solar Cover"   icon="☀️" value={Math.min(100, Math.round((solarCapKw * 150 / baseGridKwh) * 100))} unit="%" delta="Of grid offset" accent="neon"   />
        <StatCard label="Live Draw"     icon="🔌" value={live ? live.cons.toFixed(2) : '—'} unit="kW" delta="Right now"  accent="violet" />
      </div>

      {/* ── SECTION 1: Monthly Graph ── */}
      <GlassCard className="mb-5">
        <div className="flex items-center justify-between mb-4">
          <span className="font-outfit font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Monthly Energy (kWh) — Grid vs Solar</span>
          <span className="badge badge-elec">{new Date().getFullYear()}</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData} margin={{ top:8, right:4, left:-20, bottom:0 }} barSize={12}>
            <defs>
              <linearGradient id="gradGrid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF3B5C" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#FF3B5C" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="gradSolar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#39FF14" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#39FF14" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill:'rgba(255,255,255,0.35)', fontSize:10, fontFamily:'JetBrains Mono' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:'rgba(255,255,255,0.25)', fontSize:10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill:'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="grid"  name="Grid (EB)" fill="url(#gradGrid)"  radius={[3,3,0,0]} />
            <Bar dataKey="solar" name="Solar"      fill="url(#gradSolar)" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2">
          {[['#FF3B5C','Grid (EB import)'],['#39FF14','Solar generated']].map(([c,l]) => (
            <div key={l} className="flex items-center gap-1.5">
              <div style={{ width:8,height:8,borderRadius:'50%',background:c }} />
              <span style={{ fontSize:10,color:'var(--text-muted)',fontFamily:'JetBrains Mono' }}>{l}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ── SECTION 2: EB Calculator + Bill Prediction ── */}
      <div className="grid gap-4 mb-5" style={{ gridTemplateColumns:'1fr 1fr' }}>
        {/* EB Calculator */}
        <GlassCard variant="amber">
          <div className="font-outfit font-bold text-sm mb-4" style={{ color:'var(--text-primary)' }}>⚡ EB Bill Calculator</div>
          <div className="mb-3">
            <label className="block text-xs mb-1" style={{ color:'var(--text-muted)' }}>Units consumed (kWh)</label>
            <input className="form-input text-sm" type="number" min="0" value={ebUnits}
              onChange={e => setEbUnits(e.target.value)} placeholder="e.g. 180" />
          </div>
          {/* Slab breakdown */}
          <div className="mb-3 p-3 rounded-xl" style={{ background:'rgba(245,158,11,0.04)', border:'1px solid rgba(245,158,11,0.1)' }}>
            {tariffSlabs.map((s, i) => {
              const prev = i === 0 ? 0 : tariffSlabs[i-1].upTo;
              const units = parseFloat(ebUnits) || 0;
              const inSlab = Math.max(0, Math.min(units - prev, s.upTo === Infinity ? units : s.upTo - prev));
              if (inSlab <= 0 && units < prev) return null;
              return (
                <div key={i} className="flex justify-between text-xs py-1" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color:'var(--text-muted)' }}>
                    {prev}–{s.upTo === Infinity ? '∞' : s.upTo} units @ ₹{s.rate}
                  </span>
                  <span style={{ color: inSlab > 0 ? '#F59E0B' : 'var(--text-muted)', fontFamily:'JetBrains Mono' }}>
                    ₹{(inSlab * s.rate).toFixed(0)}
                  </span>
                </div>
              );
            })}
            <div className="flex justify-between text-xs py-1">
              <span style={{ color:'var(--text-muted)' }}>Fixed charge</span>
              <span style={{ color:'#F59E0B', fontFamily:'JetBrains Mono' }}>₹{fixedCharge}</span>
            </div>
          </div>
          <div className="flex justify-between items-center p-3 rounded-xl"
               style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)' }}>
            <span className="font-outfit font-semibold text-sm" style={{ color:'var(--text-primary)' }}>Total Bill</span>
            <span className="font-outfit font-black text-2xl" style={{ color:'#F59E0B', textShadow:'0 0 12px rgba(245,158,11,0.5)' }}>
              ₹{ebBill}
            </span>
          </div>
          <div className="mt-3 text-xs" style={{ color:'var(--text-muted)' }}>
            💡 With solar offset: <span style={{ color:'#39FF14', fontFamily:'JetBrains Mono' }}>
              ₹{calcEBBill(Math.max(0, (parseFloat(ebUnits)||0) - solarCapKw * 150), tariffSlabs, fixedCharge)}
            </span> estimated
          </div>
        </GlassCard>

        {/* Bill prediction */}
        <GlassCard>
          <div className="font-outfit font-bold text-sm mb-4" style={{ color:'var(--text-primary)' }}>📅 3-Month Bill Prediction</div>
          <div className="flex flex-col gap-3 mb-4">
            {predictions.map((p, i) => (
              <div key={p.month} className="p-3 rounded-xl"
                   style={{ background: i===0 ? 'rgba(57,255,20,0.06)' : 'rgba(255,255,255,0.03)',
                     border: `1px solid ${i===0 ? 'rgba(57,255,20,0.2)' : 'var(--border-dim)'}` }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-outfit font-semibold" style={{ color: i===0 ? '#39FF14' : 'var(--text-primary)' }}>
                    {i===0 ? '📍 ' : ''}{p.month} {i===0?'(current)':i===1?'(next)':'(+2)'}
                  </span>
                  <span className="font-outfit font-bold text-sm" style={{ color:'#F59E0B', fontFamily:'JetBrains Mono' }}>
                    ₹{p.bill}
                  </span>
                </div>
                <div className="flex gap-3 text-[10px]" style={{ fontFamily:'JetBrains Mono', color:'var(--text-muted)' }}>
                  <span>⚡ {p.grid} kWh grid</span>
                  <span>☀️ {p.solar} kWh solar</span>
                </div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={predictions} margin={{ top:4,right:4,left:-30,bottom:0 }}>
              <Line type="monotone" dataKey="bill" stroke="#F59E0B" strokeWidth={2} dot={{ r:3, fill:'#F59E0B' }} name="Bill ₹" />
              <Tooltip content={<CustomTooltip />} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* ── SECTION 3: Appliance Usage Estimation ── */}
      <GlassCard className="mb-5">
        <div className="flex items-center justify-between mb-4">
          <span className="font-outfit font-bold text-sm" style={{ color:'var(--text-primary)' }}>🔌 Appliance Usage Estimator</span>
          <div className="text-xs" style={{ fontFamily:'JetBrains Mono', color:'#F59E0B' }}>Est: {totalEstKwh} kWh · ₹{estBill}/mo</div>
        </div>
        <div className="flex flex-col gap-2 mb-4">
          {appList.map(a => {
            const kwhPerMonth = ((a.watts * a.hoursPerDay * 30) / 1000).toFixed(1);
            return (
              <div key={a.id} className="flex items-center gap-3 py-2 border-b"
                   style={{ borderColor:'var(--border-dim)' }}>
                <span className="flex-1 text-xs" style={{ color:'var(--text-secondary)' }}>{a.name}</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px]" style={{ color:'var(--text-muted)' }}>hrs/day:</span>
                  <input type="number" min="0" max="24"
                    style={{ width:40, background:'rgba(255,255,255,0.05)', border:'1px solid var(--border-dim)',
                      borderRadius:6, padding:'2px 4px', color:'var(--text-primary)', fontSize:11,
                      fontFamily:'JetBrains Mono', textAlign:'center' }}
                    value={a.hoursPerDay}
                    onChange={e => setAppList(prev => prev.map(x => x.id===a.id ? {...x, hoursPerDay: +e.target.value} : x))} />
                </div>
                <span style={{ color:'var(--text-muted)', fontSize:10, fontFamily:'JetBrains Mono', minWidth:52, textAlign:'right' }}>
                  {kwhPerMonth} kWh
                </span>
                <span style={{ color:'#F59E0B', fontSize:10, fontFamily:'JetBrains Mono', minWidth:36, textAlign:'right' }}>
                  ₹{((parseFloat(kwhPerMonth) / parseFloat(totalEstKwh)) * estBill).toFixed(0)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="p-3 rounded-xl flex justify-between items-center"
             style={{ background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.15)' }}>
          <div>
            <div className="text-xs" style={{ color:'var(--text-muted)' }}>Estimated monthly total</div>
            <div className="font-outfit font-bold text-lg" style={{ color:'#F59E0B' }}>₹{estBill}</div>
          </div>
          <div className="text-right">
            <div className="text-xs" style={{ color:'var(--text-muted)' }}>With solar saving</div>
            <div className="font-outfit font-bold text-lg" style={{ color:'#39FF14' }}>
              ₹{calcEBBill(Math.max(0, parseFloat(totalEstKwh) - solarCapKw * 150), tariffSlabs, fixedCharge)}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* ── SECTION 4: Buy Solar ── */}
      <GlassCard variant="neon" className="mb-5">
        <div className="font-outfit font-bold text-sm mb-2" style={{ color:'var(--text-primary)' }}>☀️ Go Solar — Save ₹{annualGridBill.toLocaleString()}/year</div>
        <p className="text-xs mb-4" style={{ color:'var(--text-muted)' }}>
          Based on your {baseGridKwh} kWh/month grid usage in {location}. Central govt subsidy up to ₹94,000 available.
        </p>

        {/* Recommended badge */}
        <div className="mb-3 px-3 py-2 rounded-xl inline-flex items-center gap-2"
             style={{ background:'rgba(57,255,20,0.1)', border:'1px solid rgba(57,255,20,0.3)' }}>
          <span style={{ fontSize:12 }}>⭐</span>
          <span className="text-xs font-outfit font-semibold" style={{ color:'#39FF14' }}>
            Recommended for you: {recommended.kw} kW ({recommended.label})
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {SOLAR_PACKAGES.map(pkg => (
            <div key={pkg.kw} className="flex-shrink-0 p-4 rounded-xl w-44"
                 style={{
                   background: pkg.kw === recommended.kw ? 'rgba(57,255,20,0.08)' : 'rgba(255,255,255,0.03)',
                   border: `1px solid ${pkg.kw === recommended.kw ? 'rgba(57,255,20,0.35)' : 'var(--border-dim)'}`,
                 }}>
              <div className="font-outfit font-bold text-sm mb-1" style={{ color: pkg.kw === recommended.kw ? '#39FF14' : 'var(--text-primary)' }}>
                {pkg.kw} kW
                {pkg.kw === recommended.kw && <span className="ml-1 text-[9px]">⭐</span>}
              </div>
              <div className="text-[10px] mb-3" style={{ color:'var(--text-muted)', fontFamily:'JetBrains Mono' }}>
                {pkg.panels} panels · {pkg.label}
              </div>
              {[
                ['Cost',    `₹${(pkg.price/1000).toFixed(0)}k`],
                ['Subsidy', `₹${(pkg.subsidy/1000).toFixed(0)}k`],
                ['Net',     `₹${((pkg.price-pkg.subsidy)/1000).toFixed(0)}k`],
                ['Payback', `${pkg.payback} yrs`],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between text-[10px] py-0.5">
                  <span style={{ color:'var(--text-muted)' }}>{k}</span>
                  <span style={{ color: k==='Net' ? '#F59E0B' : k==='Subsidy' ? '#39FF14' : 'var(--text-primary)', fontFamily:'JetBrains Mono', fontWeight:600 }}>{v}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <p className="text-[10px] mt-3" style={{ color:'var(--text-muted)' }}>
          * Prices indicative. Subsidy under PM Surya Ghar Muft Bijli Yojana. Contact certified installer for exact quote.
        </p>
      </GlassCard>

      {/* ── SECTION 5: Limit alert setter ── */}
      <GlassCard variant="elec" className="mb-5">
        <div className="font-outfit font-bold text-sm mb-3" style={{ color:'var(--text-primary)' }}>🚨 Usage Limit Alert</div>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs mb-1" style={{ color:'var(--text-muted)' }}>Alert me when grid usage exceeds (kWh/month)</label>
            <input className="form-input text-sm" type="number" min="0"
              value={limitKwh} onChange={e => setLimitKwh(e.target.value)} />
          </div>
          <button className="btn-elec px-4 py-2.5 text-xs font-outfit font-semibold"
            onClick={() => {
              const limit = parseFloat(limitKwh) || 0;
              const existing = alerts.find(a => a.id === 'limit');
              if (baseGridKwh > limit && !existing) {
                setAlerts(prev => [...prev, {
                  id:'limit', severity:'error', icon:'🚨',
                  title:'Electricity Limit Exceeded',
                  msg:`Grid usage (${baseGridKwh} kWh) exceeds limit of ${limit} kWh.`,
                }]);
                setDismissed(d => d.filter(x => x !== 'limit'));
              } else {
                alert(`✅ Limit set to ${limit} kWh. Current usage (${baseGridKwh} kWh) is within limit.`);
              }
            }}>
            Set Limit
          </button>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1" style={{ color:'var(--text-muted)' }}>
            <span>Current usage</span>
            <span style={{ fontFamily:'JetBrains Mono' }}>{baseGridKwh} / {limitKwh || '—'} kWh</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full transition-all"
                 style={{
                   width: `${Math.min(100, (baseGridKwh / (parseFloat(limitKwh)||baseGridKwh)) * 100)}%`,
                   background: baseGridKwh > (parseFloat(limitKwh)||Infinity) ? '#FF3B5C' : '#00F0FF',
                   boxShadow: '0 0 6px rgba(0,240,255,0.5)',
                 }} />
          </div>
        </div>
      </GlassCard>

      {/* ── SECTION 6: Energy Saving Tips ── */}
      <div className="mb-2">
        <div className="font-outfit font-bold text-sm mb-3" style={{ color:'var(--text-primary)' }}>💡 Energy Saving Tips</div>
        <div className="grid gap-3" style={{ gridTemplateColumns:'1fr 1fr' }}>
          {energySavingTips.map((tip, i) => (
            <div key={i} className="p-4 rounded-2xl transition-all hover:-translate-y-0.5"
                 style={{ background:'rgba(255,255,255,0.03)', border:'1px solid var(--border-dim)', backdropFilter:'blur(16px)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span style={{ fontSize:20 }}>{tip.icon}</span>
                <span className="font-outfit font-semibold text-xs" style={{ color:'var(--text-primary)' }}>{tip.title}</span>
              </div>
              <p className="text-xs mb-2" style={{ color:'var(--text-muted)', lineHeight:1.6 }}>{tip.body}</p>
              <div className="text-xs font-semibold" style={{ color:'#39FF14', fontFamily:'JetBrains Mono' }}>
                Saves {tip.saving}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
