// src/hooks/useAlerts.js
import { useState, useEffect, useCallback } from 'react';
import { alertsApi } from '../lib/api';

export function useAlerts(pollInterval = 60_000) {
  const [alerts,  setAlerts]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const unreadCount = alerts.filter(a => !a.read).length;

  const fetch = useCallback(async () => {
    try {
      const res = await alertsApi.list();
      setAlerts(res.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, pollInterval);
    return () => clearInterval(id);
  }, [fetch, pollInterval]);

  const markRead = useCallback(async (id) => {
    try {
      await alertsApi.markRead(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const dismiss = useCallback(async (id) => {
    try {
      await alertsApi.dismiss(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    const unread = alerts.filter(a => !a.read);
    await Promise.all(unread.map(a => alertsApi.markRead(a.id)));
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  }, [alerts]);

  return { alerts, unreadCount, loading, error, markRead, dismiss, markAllRead, refetch: fetch };
}
