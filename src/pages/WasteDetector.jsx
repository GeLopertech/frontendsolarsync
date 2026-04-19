import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { AlertTriangle, Power, CheckCircle2, Zap } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';

// Dummy data to replace @/lib/mockData
const wasteAppliances = [
  { name: 'TV Entertainment Unit', watts: 45, status: 'waste', note: 'Standby mode', time: 'Since 11 PM' },
  { name: 'Microwave', watts: 5, status: 'waste', note: 'Clock display', time: 'Always on' },
  { name: 'Refrigerator', watts: 120, status: 'normal', note: 'Compressor active', time: 'Cycling' },
  { name: 'Game Console', watts: 15, status: 'waste', note: 'Instant-on mode', time: 'Since yesterday' },
  { name: 'HVAC System', watts: 800, status: 'normal', note: 'Temperature holding', time: 'Auto' },
  { name: 'Smart Speaker', watts: 3, status: 'normal', note: 'Listening', time: 'Always on' },
];

const nightSpikes = [
  { hour: '00:00', load: 150, anomaly: 0 },
  { hour: '01:00', load: 140, anomaly: 0 },
  { hour: '02:00', load: 145, anomaly: 0 },
  { hour: '03:00', load: 450, anomaly: 300 }, // Spike!
  { hour: '04:00', load: 155, anomaly: 0 },
  { hour: '05:00', load: 160, anomaly: 0 },
  { hour: '06:00', load: 300, anomaly: 0 },
];

export default function WasteDetector() {
  const [apps, setApps] = useState(wasteAppliances);

  const totalWaste = apps
    .filter((a) => a.status === 'waste')
    .reduce((s, a) => s + a.watts, 0);

  const sorted = useMemo(
    () => [...apps].sort((a, b) => (a.status === 'waste' ? -1 : 1)),
    [apps]
  );

  const wasteItems = apps.filter((a) => a.status === 'waste');

  const handleFix = (idx) => {
    alert(`${sorted[idx].name} scheduled for review.`);
  };

  return (
    <div className="p-4 md:p-6 animate-fade-in" data-testid="waste-page">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
        <div>
          <div className="text-xs mb-2" style={{ color: '#FF3B5C', fontFamily: 'JetBrains Mono' }}>Energy Waste Detector</div>
          <h1 className="font-outfit text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Hidden drains, <span style={{ color: '#FF3B5C' }}>exposed.</span>
          </h1>
        </div>
        <GlassCard variant="neon" style={{ borderColor: 'rgba(255,59,92,0.3)', boxShadow: '0 0 20px rgba(255,59,92,0.15)' }}>
          <div className="text-xs" style={{ color: '#FF3B5C', fontFamily: 'JetBrains Mono' }}>Phantom Load</div>
          <div className="font-outfit text-2xl font-bold mt-1" style={{ color: '#FF3B5C', textShadow: '0 0 10px rgba(255,59,92,0.5)' }}>
            {totalWaste}W
          </div>
          <div className="font-mono text-xs mt-1" style={{ color: 'var(--text-muted)' }}>≈ ₹{Math.round(totalWaste * 0.8)}/mo</div>
        </GlassCard>
      </div>

      {/* Top summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <SummaryCard label="Devices Scanned" value={apps.length} color="#00F0FF" Icon={Power} />
        <SummaryCard label="Issues Found" value={wasteItems.length} color="#FF3B5C" Icon={AlertTriangle} />
        <SummaryCard label="Normal" value={apps.length - wasteItems.length} color="#39FF14" Icon={CheckCircle2} />
        <SummaryCard label="Potential Savings" value="₹540" color="#F59E0B" Icon={Zap} suffix="/mo" />
      </div>

      {/* Night spike chart */}
      <GlassCard className="mb-5" data-testid="night-spike-chart">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <div className="text-xs" style={{ color: '#FF3B5C', fontFamily: 'JetBrains Mono' }}>Anomaly Detection</div>
            <div className="font-outfit text-base font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>Nighttime Load Profile</div>
          </div>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: '#00F0FF' }} /> Base load
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: '#FF3B5C', boxShadow: '0 0 8px #FF3B5C' }} /> Spike
            </span>
          </div>
        </div>

        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={nightSpikes} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="loadG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00F0FF" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#00F0FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="anomalyG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF3B5C" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#FF3B5C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="hour" stroke="rgba(255,255,255,0.35)" tickLine={false} axisLine={false} style={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
              <YAxis stroke="rgba(255,255,255,0.25)" tickLine={false} axisLine={false} style={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
              <Tooltip 
                 contentStyle={{ background: 'rgba(8,8,8,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                 itemStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
                 labelStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}
              />
              <Area type="monotone" dataKey="load" stroke="#00F0FF" strokeWidth={2} fill="url(#loadG)" />
              <Area type="monotone" dataKey="anomaly" stroke="#FF3B5C" strokeWidth={2.5} fill="url(#anomalyG)" />
              <ReferenceDot x="03:00" y={nightSpikes[3].load} r={5} fill="#FF3B5C" stroke="#fff" strokeWidth={1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 rounded-xl p-3 flex items-start gap-3" style={{ background: 'rgba(255,59,92,0.05)', border: '1px solid rgba(255,59,92,0.2)' }}>
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#FF3B5C' }} />
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span style={{ color: '#FF3B5C', fontWeight: 500 }}>Anomaly at 3:00 AM</span> — sustained 300W draw with no active schedule. Likely standby devices.
          </div>
        </div>
      </GlassCard>

      {/* Appliance list */}
      <GlassCard data-testid="appliance-status-list">
        <div className="flex items-center justify-between mb-4">
          <div className="font-outfit text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Device Status</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Real-time scan</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sorted.map((a, i) => {
            const isWaste = a.status === 'waste';
            return (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl p-3 transition-colors duration-300"
                style={{
                  background: isWaste ? 'rgba(255,59,92,0.05)' : 'rgba(57,255,20,0.05)',
                  border: `1px solid ${isWaste ? 'rgba(255,59,92,0.2)' : 'rgba(57,255,20,0.2)'}`
                }}
              >
                <div
                  className="relative h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: isWaste ? 'rgba(255,59,92,0.1)' : 'rgba(57,255,20,0.1)',
                    border: `1px solid ${isWaste ? '#FF3B5C40' : '#39FF1440'}`,
                  }}
                >
                  {isWaste ? <AlertTriangle size={16} color="#FF3B5C" /> : <CheckCircle2 size={16} color="#39FF14" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{a.name}</span>
                    <span className="font-mono text-xs" style={{ color: isWaste ? '#FF3B5C' : '#39FF14' }}>
                      {a.watts}W
                    </span>
                  </div>
                  <div className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                    {a.note} · {a.time}
                  </div>
                </div>
                <button
                  onClick={() => handleFix(i)}
                  className="shrink-0 text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors border"
                  style={{
                    borderColor: isWaste ? 'rgba(255,59,92,0.4)' : 'rgba(255,255,255,0.1)',
                    color: isWaste ? '#FF3B5C' : 'var(--text-muted)',
                    background: 'transparent'
                  }}
                >
                  {isWaste ? 'Fix' : 'OK'}
                </button>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}

function SummaryCard({ label, value, color, Icon, suffix = '' }) {
  return (
    <GlassCard className="!p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center border"
             style={{ borderColor: `${color}40`, background: `${color}15` }}>
          <Icon size={16} style={{ color }} strokeWidth={1.75} />
        </div>
      </div>
      <div className="text-xs mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'IBM Plex Sans' }}>{label}</div>
      <div className="font-outfit text-2xl font-bold" style={{ color, textShadow: `0 0 12px ${color}40` }}>
        {value}
        <span className="font-mono text-xs ml-1" style={{ color: 'var(--text-muted)' }}>{suffix}</span>
      </div>
    </GlassCard>
  );
}
