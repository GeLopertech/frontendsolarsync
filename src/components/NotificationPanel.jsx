import { useState, useRef, useEffect } from 'react';
import { Bell, Zap, Sun, AlertTriangle, TrendingUp, Battery, X, CheckCheck } from 'lucide-react';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: 'alert',
    icon: AlertTriangle,
    color: 'var(--rose)',
    bg: 'rgba(255,59,92,0.1)',
    border: 'rgba(255,59,92,0.25)',
    title: 'Grid Voltage Spike',
    message: 'Voltage exceeded 245V on Phase A. Auto-stabilised.',
    time: '2 min ago',
    read: false,
  },
  {
    id: 2,
    type: 'solar',
    icon: Sun,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.25)',
    title: 'Peak Solar Window',
    message: 'Optimal generation window active. 4.2 kW live output.',
    time: '14 min ago',
    read: false,
  },
  {
    id: 3,
    type: 'energy',
    icon: Zap,
    color: 'var(--electric)',
    bg: 'rgba(0,240,255,0.08)',
    border: 'rgba(0,240,255,0.25)',
    title: 'AI Optimizer Ran',
    message: 'Schedule updated — projected savings ₹380 today.',
    time: '1 hr ago',
    read: false,
  },
  {
    id: 4,
    type: 'battery',
    icon: Battery,
    color: 'var(--neon)',
    bg: 'rgba(57,255,20,0.08)',
    border: 'rgba(57,255,20,0.25)',
    title: 'Battery Fully Charged',
    message: 'Home battery reached 100% SoC. Exporting to grid.',
    time: '3 hr ago',
    read: true,
  },
  {
    id: 5,
    type: 'insight',
    icon: TrendingUp,
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.25)',
    title: 'Monthly Report Ready',
    message: 'April summary is ready. You saved 18% vs last month.',
    time: 'Yesterday',
    read: true,
  },
];

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const panelRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const dismiss = (id) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  const markRead = (id) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  return (
    <div className="notif-wrapper" ref={panelRef}>
      {/* Bell Button */}
      <button
        id="notif-bell-btn"
        className="notif-bell-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="notif-panel animate-notif-in">
          {/* Header */}
          <div className="notif-header">
            <div>
              <span className="notif-title">Notifications</span>
              {unreadCount > 0 && (
                <span className="notif-count-chip">{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button className="notif-mark-all" onClick={markAllRead} title="Mark all as read">
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <Bell size={28} style={{ opacity: 0.2, marginBottom: 8 }} />
                <p>All caught up!</p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = n.icon;
                return (
                  <div
                    key={n.id}
                    className={`notif-item${n.read ? ' read' : ''}`}
                    onClick={() => markRead(n.id)}
                  >
                    {/* Icon */}
                    <div
                      className="notif-icon"
                      style={{
                        background: n.bg,
                        border: `1px solid ${n.border}`,
                        color: n.color,
                      }}
                    >
                      <Icon size={14} />
                    </div>

                    {/* Content */}
                    <div className="notif-content">
                      <div className="notif-item-title">
                        {n.title}
                        {!n.read && <span className="notif-unread-dot" />}
                      </div>
                      <div className="notif-item-msg">{n.message}</div>
                      <div className="notif-item-time">{n.time}</div>
                    </div>

                    {/* Dismiss */}
                    <button
                      className="notif-dismiss"
                      onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                      aria-label="Dismiss"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="notif-footer">
              <button className="notif-clear-all" onClick={() => setNotifications([])}>
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
