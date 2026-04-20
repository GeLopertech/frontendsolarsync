// ─────────────────────────────────────────────────────────────────────────────
//  src/hooks/useSolar.js  — Polls backend every 30s for live solar data
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react';
import { solarApi } from '../lib/api';

export function useSolar(pollInterval = 600_000) {
  const [realtime,     setRealtime]     = useState(null);
  const [history,      setHistory]      = useState([]);
  const [monthly,      setMonthly]      = useState(null);
  const [installation, setInstallation] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  const fetchRealtime = useCallback(async () => {
    try {
      const data = await solarApi.realtime();
      setRealtime(data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [rt, hist, mon, inst] = await Promise.all([
        solarApi.realtime(),
        solarApi.history(),
        solarApi.monthly(),
        solarApi.installation(),
      ]);
      setRealtime(rt.data);
      setHistory(hist.data);
      setMonthly(mon);
      setInstallation(inst.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchRealtime, pollInterval);
    return () => clearInterval(id);
  }, [fetchAll, fetchRealtime, pollInterval]);

  // Derived live values compatible with existing App.jsx { solar, cons, soc }
  const live = realtime ? {
    solar: realtime.solar.generatingKw,
    cons:  realtime.home.consumingKw,
    soc:   realtime.battery.chargePercent,
  } : { solar: 0, cons: 0, soc: 0 };

  return { live, realtime, history, monthly, installation, loading, error, refetch: fetchAll };
}
