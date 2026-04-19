// src/hooks/useBattery.js
import { useState, useEffect, useCallback } from 'react';
import { batteryApi } from '../lib/api';

export function useBattery(pollInterval = 30_000) {
  const [status,   setStatus]   = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [saving,   setSaving]   = useState(false);

  const fetch = useCallback(async () => {
    try {
      const [s, sc] = await Promise.all([batteryApi.status(), batteryApi.schedule()]);
      setStatus(s.data);
      setSchedule(sc.data);
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

  const setMode = useCallback(async (mode) => {
    setSaving(true);
    try {
      const res = await batteryApi.setMode(mode);
      setStatus(prev => ({ ...prev, mode }));
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const setScheduleEntries = useCallback(async (entries) => {
    setSaving(true);
    try {
      const res = await batteryApi.setSchedule(entries);
      setSchedule(res.data);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return { status, schedule, loading, error, saving, setMode, setScheduleEntries, refetch: fetch };
}
