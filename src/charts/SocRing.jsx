// Electric-blue SVG ring showing battery SOC
export default function SocRing({ soc = 74, size = 120 }) {
  const r = (size / 2) - 10;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - soc / 100);

  const color = soc >= 60 ? 'var(--electric)' : soc >= 30 ? 'var(--amber)' : 'var(--rose)';
  const glow = soc >= 60 ? `var(--glow-elec)` : soc >= 30 ? `var(--glow-amber)` : `var(--glow-rose)`;

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="var(--border-dim)"
          strokeWidth={8}
        />
        {/* Fill */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={`${circ.toFixed(1)}`}
          strokeDashoffset={offset.toFixed(1)}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(${glow})`, transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease' }}
        />
      </svg>

      {/* Center text */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: 'Outfit', fontWeight: 800, fontSize: size * 0.22,
          color, textShadow: glow,
          lineHeight: 1,
        }}>
          {soc}
        </span>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: size * 0.1, color: 'var(--text-muted)', marginTop: 2 }}>
          % SOC
        </span>
      </div>
    </div>
  );
}
