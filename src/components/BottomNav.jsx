import { LayoutDashboard, Sun, Zap, Users, BarChart2 } from 'lucide-react';

const items = [
  { id: 'dashboard', label: 'Home',      icon: LayoutDashboard },
  { id: 'forecast',  label: 'Forecast',  icon: Sun },
  { id: 'optimize',  label: 'Optimize',  icon: Zap },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'insights',  label: 'Insights',  icon: BarChart2 },
];

export default function BottomNav({ activePage, onNavigate }) {
  return (
    <nav className="bottom-nav">
      <div style={{ display: 'flex', height: 62 }}>
        {items.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`bn-${id}`}
            className={`bnav-btn ${activePage === id ? 'active' : ''}`}
            onClick={() => onNavigate(id)}
          >
            <Icon size={22} />
            <span style={{ fontSize: 10, fontWeight: 500 }}>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
