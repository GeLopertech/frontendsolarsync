// ─────────────────────────────────────────────────────────────────────────────
//  src/context/AuthContext.jsx  — Global auth state using React Context
// ─────────────────────────────────────────────────────────────────────────────
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, tokens } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('ss_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // ── Restore session on mount ────────────────────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      if (!tokens.getAccess()) { setLoading(false); return; }
      try {
        const data = await authApi.me();
        setUser(data.user);
        localStorage.setItem('ss_user', JSON.stringify(data.user));
      } catch {
        tokens.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  // ── Listen for forced logout (token expired) ────────────────────────────────
  useEffect(() => {
    const handler = () => { setUser(null); tokens.clear(); };
    window.addEventListener('ss:logout', handler);
    return () => window.removeEventListener('ss:logout', handler);
  }, []);

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const data = await authApi.login(email, password);
      tokens.setAll(data);
      setUser(data.user);
      localStorage.setItem('ss_user', JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // ── Register ────────────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    setError(null);
    try {
      const data = await authApi.register(name, email, password);
      tokens.setAll(data);
      setUser(data.user);
      localStorage.setItem('ss_user', JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* best effort */ }
    tokens.clear();
    localStorage.removeItem('ss_user');
    setUser(null);
  }, []);

  const value = { user, loading, error, login, register, logout, isAuthed: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
