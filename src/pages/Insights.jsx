import { insights } from '../data/seed';
import GlassCard from '../components/ui/GlassCard';
import { Cpu, TrendingDown } from 'lucide-react';

export default function Insights() {
  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="mb-5">
        <h2 className="font-outfit font-bold text-xl" style={{ color: 'var(--text-primary)' }}>AI Insights</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>Personalised energy recommendations</p>
      </div>

      {/* Energy Scheme Section */}
      <GlassCard className="mb-6 !p-5 border-l-4" style={{ borderLeftColor: 'var(--neon)', background: 'rgba(33, 33, 38, 0.8)' }}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-muted mb-1">Dynamic Strategy</div>
            <div className="text-lg font-outfit font-bold text-neon">Scheme: Solar Maximization</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-neon/10 flex items-center justify-center text-neon shadow-[0_0_15px_rgba(57,255,20,0.2)]">
            <TrendingDown size={20} />
          </div>
        </div>
        
        <div className="relative h-20 mb-4 flex items-center justify-between px-4">
          <div className="flex flex-col items-center gap-1 z-10">
            <div className="w-10 h-10 rounded-lg bg-surface border border-dim flex items-center justify-center text-xl">☀️</div>
            <span className="text-[9px] font-mono text-muted">SOLAR</span>
          </div>
          
          {/* Animated Flow Lines */}
          <div className="absolute inset-x-12 top-1/2 -translate-y-1/2 h-0.5 overflow-hidden">
             <div className="h-full w-full bg-surface-hover" />
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon to-transparent w-1/2 animate-[shimmer_2s_infinite]" />
          </div>

          <div className="flex flex-col items-center gap-2 z-10">
            <div className="w-14 h-14 rounded-xl bg-neon/20 border-2 border-neon flex items-center justify-center shadow-[0_0_20px_rgba(57,255,20,0.3)]">
               <Cpu size={28} className="text-neon" />
            </div>
            <span className="text-[10px] font-bold text-primary">AI CORE</span>
          </div>

          <div className="absolute inset-x-12 top-1/2 -translate-y-1/2 h-0.5 overflow-hidden scale-x-[-1]">
             <div className="h-full w-full bg-surface-hover" />
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-electric to-transparent w-1/2 animate-[shimmer_2s_infinite]" />
          </div>

          <div className="flex flex-col items-center gap-1 z-10">
            <div className="w-10 h-10 rounded-lg bg-surface border border-dim flex items-center justify-center text-xl">🏠</div>
            <span className="text-[9px] font-mono text-muted">HOME</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-surface/50 border border-dim">
           <p className="text-xs text-secondary leading-relaxed">
             AI has prioritized <strong>Solar-to-Home</strong> routing with surplus directed to battery storage. 
             Grid import is scheduled to remain <span className="text-rose font-bold">OFF</span> until 18:45.
           </p>
        </div>
        <style>{`
          @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
        `}</style>
      </GlassCard>

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
