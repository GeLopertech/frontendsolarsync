import { useState } from 'react';
import {
  LayoutDashboard, Sun, Zap, Battery, Users, BarChart2, FileText, LogOut, ChevronRight,
} from 'lucide-react';

const navItems = [
  { id: 'dashboard',  label: 'Dashboard',     icon: LayoutDashboard, section: 'MAIN' },
  { id: 'forecast',   label: 'Solar Forecast', icon: Sun,             section: null  },
  { id: 'optimize',   label: 'Optimizer',      icon: Zap,             section: null  },
  { id: 'battery',    label: 'Battery',        icon: Battery,         section: null  },
  { id: 'community',  label: 'Community',      icon: Users,           section: 'COMMUNITY' },
  { id: 'insights',   label: 'Insights',       icon: BarChart2,       section: null  },
  { id: 'reports',    label: 'Reports',        icon: FileText,        section: 'SYSTEM' },
  { id: 'waste',      label: 'Waste Detector', icon: Zap,             section: null  },
];

export default function Sidebar({ activePage, onNavigate, onLogout }) {
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
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        {navItems.map((item) => {
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
              <div
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
                role="button"
                tabIndex={0}
              >
                <Icon size={15} style={{ opacity: isActive ? 1 : 0.6, flexShrink: 0 }} />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={12} className="ml-auto opacity-50" />}
              </div>
            </div>
          );
        })}

        {/* Logout */}
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
            AJ
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>Alex Johnson</div>
            <div className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>Sunnyvale · Eco Premium</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
