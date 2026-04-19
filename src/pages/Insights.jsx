import { insights } from '../data/seed';

export default function Insights() {
  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="mb-5">
        <h2 className="font-outfit font-bold text-xl" style={{ color: 'var(--text-primary)' }}>AI Insights</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>Personalised energy recommendations</p>
      </div>

      <div className="flex flex-col gap-3">
        {insights.map((ins, i) => (
          <div
            key={i}
            className="flex gap-4 p-4 rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
            style={{
              background: ins.bg,
              border: `1px solid ${ins.border}`,
              backdropFilter: 'blur(16px)',
              boxShadow: `0 4px 20px rgba(0,0,0,0.3)`,
            }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                 style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${ins.border}` }}>
              {ins.icon}
            </div>
            <div>
              <div className="font-outfit font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{ins.title}</div>
              <div className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Sans' }}>{ins.body}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Score summary */}
      <div className="mt-5 p-5 rounded-2xl flex items-center gap-5"
           style={{ background: 'rgba(57,255,20,0.06)', border: '1px solid rgba(57,255,20,0.2)', backdropFilter: 'blur(16px)' }}>
        <div>
          <div className="font-outfit font-black" style={{ fontSize: 52, color: '#39FF14', textShadow: '0 0 20px rgba(57,255,20,0.5)', lineHeight: 1 }}>88</div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>7-day avg score</div>
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Trending upward</div>
          <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Up from 79 last week · Top 12% of community</div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full" style={{
              width: '88%',
              background: 'linear-gradient(90deg, #39FF14, #00F0FF)',
              boxShadow: '0 0 8px rgba(57,255,20,0.4)',
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
