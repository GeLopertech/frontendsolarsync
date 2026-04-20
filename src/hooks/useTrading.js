// src/hooks/useTrading.js
import { useState, useEffect, useCallback } from 'react';
import { tradingApi } from '../lib/api';

export function useTrading(pollInterval = 600_000) {
  const [prices,  setPrices]  = useState(null);
  const [offers,  setOffers]  = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [busy,    setBusy]    = useState(false);

  const fetch = useCallback(async () => {
    try {
      const [p, o, h] = await Promise.all([
        tradingApi.prices(),
        tradingApi.offers(),
        tradingApi.history(),
      ]);
      setPrices(p.data);
      setOffers(o.data);
      setHistory(h.data);
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

  const postOffer = useCallback(async (quantityKwh, pricePerKwh, durationHours = 1) => {
    setBusy(true);
    try {
      const res = await tradingApi.postOffer(quantityKwh, pricePerKwh, durationHours);
      await fetch();
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setBusy(false);
    }
  }, [fetch]);

  const buyEnergy = useCallback(async (offerId, quantityKwh) => {
    setBusy(true);
    try {
      const res = await tradingApi.buy(offerId, quantityKwh);
      await fetch();
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setBusy(false);
    }
  }, [fetch]);

  const cancelOffer = useCallback(async (id) => {
    setBusy(true);
    try {
      const res = await tradingApi.cancelOffer(id);
      await fetch();
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setBusy(false);
    }
  }, [fetch]);

  return { prices, offers, history, loading, error, busy, postOffer, buyEnergy, cancelOffer, refetch: fetch };
}
