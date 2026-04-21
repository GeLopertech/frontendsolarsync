import { useState } from 'react';
import {
  LayoutDashboard, Sun, Zap, Battery, Users, BarChart2, FileText, LogOut, ChevronRight, Plug,
} from 'lucide-react';
import { useUserProfile } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { id: 'dashboard',  label: 'Dashboard',      icon: LayoutDashboard, section: 'MAIN' },
  { id: 'forecast',   label: 'Solar Forecast',  icon: Sun,             section: null  },
  { id: 'automation', label: 'AI Automation',   icon: Zap,             section: null  },
  { id: 'battery',    label: 'Battery',         icon: Battery,         section: null  },
  { id: 'grid',       label: 'Domestic Grid',   icon: Plug,            section: null  },
  { id: 'community',  label: 'Community',       icon: Users,           section: 'COMMUNITY' },
  { id: 'insights',   label: 'Insights',        icon: BarChart2,       section: null  },
  { id: 'reports',    label: 'Reports',         icon: FileText,        section: 'SYSTEM' },
  { id: 'waste',      label: 'Waste Detector',  icon: Zap,             section: null  },
];

export default function Sidebar({ activePage, onNavigate, onLogout }) {
  const { user } = useAuth();
  const { userProfile } = useUserProfile();

  const connType = userProfile?.connType || 'both';

  // Hide solar-only nav items for pure grid users
  const visibleNav = NAV.filter(item => {
    if (connType === 'grid' && ['forecast', 'battery', 'optimize'].includes(item.id)) return false;
    if (connType === 'solar' && item.id === 'grid') return false;
    return true;
  });

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--border-dim)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: 'rgba(57,255,20,0.15)', border: '1px solid var(--border-neon)', boxShadow: 'var(--glow-neon)' }}>
            <Sun size={18} style={{ color: '#39FF14' }} />
          </div>
          <div>
            <div className="font-outfit font-bold text-sm leading-tight" style={{ color: '#39FF14', textShadow: '0 0 12px rgba(57,255,20,0.5)' }}>
              SolarSync AI
            </div>
            <div className="text-[10px] mt-0.5 tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
              Energy Orchestrator
            </div>
          </div>
        </div>
        {/* Connection type badge */}
        <div className="mt-3 flex items-center gap-1.5">
          <div style={{
            fontSize: 10, fontFamily: 'JetBrains Mono', padding: '3px 8px', borderRadius: 6,
            background: connType === 'grid' ? 'rgba(245,158,11,0.12)' : 'rgba(57,255,20,0.1)',
            border: `1px solid ${connType === 'grid' ? 'rgba(245,158,11,0.3)' : 'rgba(57,255,20,0.25)'}`,
            color: connType === 'grid' ? '#F59E0B' : '#39FF14',
          }}>
            {connType === 'solar' ? '☀️ Solar only' : connType === 'grid' ? '🔌 Grid only' : '⚡ Solar + Grid'}
          </div>
          {userProfile?.ebName && (
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
              {userProfile.ebName}
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        {visibleNav.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <div key={item.id}>
              {item.section && (
                <div className="px-5 pt-4 pb-1 text-[10px] font-semibold tracking-widest uppercase"
                     style={{ color: 'var(--text-muted)', fontFamily: 'IBM Plex Sans' }}>
                  {item.section}
                </div>
              )}
              <div className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)} role="button" tabIndex={0}>
                <Icon size={15} style={{ opacity: isActive ? 1 : 0.6, flexShrink: 0 }} />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={12} className="ml-auto opacity-50" />}
              </div>
            </div>
          );
        })}

        <div className="nav-item mt-2" onClick={onLogout} style={{ color: 'var(--text-muted)' }}>
          <LogOut size={15} style={{ opacity: 0.6, flexShrink: 0 }} />
          <span>Sign out</span>
        </div>
      </nav>

      {/* User chip */}
      <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--border-dim)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-outfit font-bold text-xs"
               style={{ background: 'rgba(57,255,20,0.15)', border: '1px solid var(--border-neon)', color: '#39FF14' }}>
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {user?.name || 'User'}
            </div>
            <div className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
              {userProfile?.communityLabel?.replace(/^.\s/, '') || 'Community'} · {userProfile?.usageLimitKwh || 300} kWh limit
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
