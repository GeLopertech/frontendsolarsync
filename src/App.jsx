import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Forecast from './pages/Forecast';
import Optimizer from './pages/Optimizer';
import Battery from './pages/Battery';
import Community from './pages/Community';
import Insights from './pages/Insights';
import Reports from './pages/Reports';
import WasteDetector from './pages/WasteDetector';

// ── Live state seed
const INIT_LIVE = { solar: 1.42, cons: 0.88, soc: 74 };

export default function App() {
  // ── Auth
  const [authView, setAuthView]   = useState('login'); // 'login' | 'signup'
  const [authed, setAuthed]       = useState(false);

  // ── Navigation
  const [page, setPage]           = useState('dashboard');

  // ── Sidebar (mobile)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Live feed
  const [live, setLive] = useState(INIT_LIVE);

  // Live ticker (simulates WebSocket)
  useEffect(() => {
    if (!authed) return;
    const eta = 0.9;
    const id = setInterval(() => {
      setLive(prev => {
        const solar = Math.max(0,   prev.solar + (Math.random() - 0.48) * 0.08);
        const cons  = Math.max(0.2, prev.cons  + (Math.random() - 0.5)  * 0.05);
        const delta = (solar - cons) * eta;
        const soc   = Math.min(100, Math.max(0, prev.soc + delta / 120));
        return { solar, cons, soc: Math.round(soc) };
      });
    }, 2000);
    return () => clearInterval(id);
  }, [authed]);

  const navigate = useCallback((p) => {
    setPage(p);
    setSidebarOpen(false);
  }, []);

  const runOptimizer = () => {
    const btn = document.getElementById('topbar-optimize-btn');
    if (btn) { btn.textContent = '⏳ Optimizing…'; btn.disabled = true; }
    setTimeout(() => {
      if (btn) { btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Optimize'; btn.disabled = false; }
    }, 2000);
  };

  /* ── AUTH SCREENS */
  if (!authed) {
    if (authView === 'login') {
      return (
        <Login
          onLogin={() => { setAuthed(true); }}
          onShowSignup={() => setAuthView('signup')}
        />
      );
    }
    return (
      <Signup
        onSignup={() => { setAuthed(true); }}
        onShowLogin={() => setAuthView('login')}
      />
    );
  }

  /* ── APP SHELL */
  const pages = { dashboard: Dashboard, forecast: Forecast, optimize: Optimizer, battery: Battery, community: Community, insights: Insights, reports: Reports, waste: WasteDetector };
  const PageComponent = pages[page] || Dashboard;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Mobile overlay */}
      <div
        className={`overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <Sidebar
        activePage={page}
        onNavigate={navigate}
        onLogout={() => { setAuthed(false); setAuthView('login'); setLive(INIT_LIVE); }}
        className={sidebarOpen ? 'open' : ''}
      />
      {/* Sidebar open class injection */}
      {sidebarOpen && (
        <style>{`.sidebar { transform: translateX(0) !important; }`}</style>
      )}

      {/* Main content */}
      <div className="main-content" style={{ minHeight: '100vh' }}>
        <Topbar
          activePage={page}
          onMenuOpen={() => setSidebarOpen(true)}
          onOptimize={runOptimizer}
        />
        <PageComponent live={live} />
      </div>

      {/* Mobile bottom nav */}
      <BottomNav activePage={page} onNavigate={navigate} />
    </div>
  );
}
