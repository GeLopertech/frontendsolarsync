import { Menu, Zap } from 'lucide-react';

const pageTitles = {
  dashboard: 'Dashboard',
  forecast: 'Solar Forecast',
  optimize: 'AI Optimizer',
  battery: 'Battery Management',
  community: 'Community',
  insights: 'AI Insights',
  reports: 'Reports',
  waste: 'Waste Detector',
};

export default function Topbar({ activePage, onMenuOpen, onOptimize }) {
  return (
    <div className="topbar">
      {/* Hamburger (mobile) */}
      <button
        className="menu-btn w-9 h-9 flex items-center justify-center rounded-xl border transition-all mobile-only"
        style={{ border: '1px solid var(--border-dim)', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}
        onClick={onMenuOpen}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Page title */}
      <h1 className="flex-1 font-outfit font-bold text-base truncate"
          style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
        {pageTitles[activePage] || activePage}
      </h1>

      {/* Live pill */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
           style={{ background: 'rgba(0,240,255,0.08)', border: '1px solid var(--border-elec)' }}>
        <div className="live-dot" />
        <span className="text-xs font-semibold" style={{ color: 'var(--electric)', fontFamily: 'JetBrains Mono' }}>LIVE</span>
      </div>

      {/* Optimize btn (desktop) */}
      <button
        className="btn-neon px-4 py-2 text-sm flex items-center gap-2 desktop-only"
        onClick={onOptimize}
        id="topbar-optimize-btn"
      >
        <Zap size={14} />
        Optimize
      </button>
    </div>
  );
}
