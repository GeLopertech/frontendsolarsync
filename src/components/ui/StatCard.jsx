export default function StatCard({ label, value, unit, delta, deltaUp, accent = 'neon', icon }) {
  const colors = {
    neon:   { border: 'var(--border-neon)', glow: 'var(--glow-neon)',   text: '#39FF14', bg: 'rgba(57,255,20,0.06)'   },
    elec:   { border: 'var(--border-elec)', glow: 'var(--glow-elec)',   text: '#00F0FF', bg: 'rgba(0,240,255,0.06)'   },
    amber:  { border: 'var(--border-amber)',glow: 'var(--glow-amber)',   text: '#F59E0B', bg: 'rgba(245,158,11,0.06)' },
    violet: { border: 'rgba(139,92,246,0.3)',glow:'0 0 20px rgba(139,92,246,0.3)', text: '#8B5CF6', bg: 'rgba(139,92,246,0.06)' },
  }[accent] || {};

  return (
    <div
      className="relative overflow-hidden p-4 rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        boxShadow: `${colors.glow}, 0 4px 24px rgba(0,0,0,0.4)`,
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-10"
           style={{ background: colors.text }} />

      <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'IBM Plex Sans' }}>
        {icon && <span className="mr-1">{icon}</span>}{label}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-outfit font-bold leading-none"
              style={{ fontSize: 26, color: colors.text, textShadow: `0 0 16px ${colors.text}60` }}>
          {value}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>{unit}</span>
      </div>
      {delta && (
        <div className="text-xs mt-1.5 font-mono" style={{
          color: deltaUp === false ? '#FF3B5C' : '#39FF14',
          fontFamily: 'JetBrains Mono',
        }}>
          {delta}
        </div>
      )}
    </div>
  );
}
