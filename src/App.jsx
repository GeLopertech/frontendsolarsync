import { useState, useCallback } from 'react';
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
import { useAuth } from './context/AuthContext';
import { useSolar } from './hooks/useSolar';

// ── Inner app — only rendered when authed ─────────────────────────────────────
function AppShell() {
  const { logout } = useAuth();
  const { live, realtime, history, monthly, loading: solarLoading } = useSolar(30_000);

  const [page,        setPage]        = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useCallback((p) => {
    setPage(p);
    setSidebarOpen(false);
  }, []);

  const runOptimizer = () => {
    const btn = document.getElementById('topbar-optimize-btn');
    if (btn) { btn.textContent = '⏳ Optimizing…'; btn.disabled = true; }
    setTimeout(() => {
      if (btn) {
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Optimize';
        btn.disabled = false;
      }
    }, 2000);
  };

  const pages = {
    dashboard: Dashboard,
    forecast:  Forecast,
    optimize:  Optimizer,
    battery:   Battery,
    community: Community,
    insights:  Insights,
    reports:   Reports,
    waste:     WasteDetector,
  };

  const PageComponent = pages[page] || Dashboard;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Mobile overlay */}
      <div
        className={`overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar
        activePage={page}
        onNavigate={navigate}
        onLogout={logout}
        className={sidebarOpen ? 'open' : ''}
      />
      {sidebarOpen && (
        <style>{`.sidebar { transform: translateX(0) !important; }`}</style>
      )}

      <div className="main-content" style={{ minHeight: '100vh' }}>
        <Topbar
          activePage={page}
          onMenuOpen={() => setSidebarOpen(true)}
          onOptimize={runOptimizer}
        />
        {/* Pass live + full realtime/history to pages */}
        <PageComponent
          live={live}
          realtime={realtime}
          history={history}
          monthly={monthly}
          solarLoading={solarLoading}
        />
      </div>

      <BottomNav activePage={page} onNavigate={navigate} />
    </div>
  );
}

// ── Root — shows auth screens or app shell ─────────────────────────────────────
export default function App() {
  const { isAuthed, loading, login, register, logout } = useAuth();
  const [authView, setAuthView] = useState('login');

  // Loading screen while restoring session
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#050505',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '2px solid rgba(57,255,20,0.2)',
          borderTop: '2px solid #39FF14',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: 'JetBrains Mono' }}>
          Restoring session…
        </p>
      </div>
    );
  }

  if (!isAuthed) {
    if (authView === 'login') {
      return (
        <Login
          onLogin={login}
          onShowSignup={() => setAuthView('signup')}
        />
      );
    }
    return (
      <Signup
        onSignup={register}
        onShowLogin={() => setAuthView('login')}
      />
    );
  }

  return <AppShell />;
}
