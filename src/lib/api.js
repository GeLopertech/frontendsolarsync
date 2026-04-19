// ─────────────────────────────────────────────────────────────────────────────
//  src/lib/api.js  — Central API client for SolarSync backend
//  Base URL pulled from VITE_API_URL env variable
// ─────────────────────────────────────────────────────────────────────────────

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ── Token helpers ─────────────────────────────────────────────────────────────
export const tokens = {
  getAccess:   () => localStorage.getItem('ss_access_token'),
  getRefresh:  () => localStorage.getItem('ss_refresh_token'),
  setAccess:   (t) => localStorage.setItem('ss_access_token', t),
  setRefresh:  (t) => localStorage.setItem('ss_refresh_token', t),
  setAll: ({ accessToken, refreshToken }) => {
    if (accessToken)  localStorage.setItem('ss_access_token',  accessToken);
    if (refreshToken) localStorage.setItem('ss_refresh_token', refreshToken);
  },
  clear: () => {
    localStorage.removeItem('ss_access_token');
    localStorage.removeItem('ss_refresh_token');
    localStorage.removeItem('ss_user');
  },
};

// ── Refresh logic (runs once even if multiple calls fail simultaneously) ──────
let refreshPromise = null;

async function doRefresh() {
  const refreshToken = tokens.getRefresh();
  if (!refreshToken) throw new Error('No refresh token');

  const res = await fetch(`${BASE}/api/auth/refresh`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    tokens.clear();
    window.dispatchEvent(new Event('ss:logout'));
    throw new Error('Session expired');
  }

  const data = await res.json();
  tokens.setAll(data);
  return data.accessToken;
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────
export async function apiFetch(path, options = {}) {
  const accessToken = tokens.getAccess();

  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };

  let res = await fetch(`${BASE}${path}`, { ...options, headers });

  // Auto-refresh on 401
  if (res.status === 401) {
    try {
      if (!refreshPromise) refreshPromise = doRefresh().finally(() => { refreshPromise = null; });
      const newToken = await refreshPromise;

      res = await fetch(`${BASE}${path}`, {
        ...options,
        headers: { ...headers, Authorization: `Bearer ${newToken}` },
      });
    } catch {
      tokens.clear();
      window.dispatchEvent(new Event('ss:logout'));
      throw new Error('Session expired. Please log in again.');
    }
  }

  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.message || 'Request failed');
    err.code   = data.code;
    err.status = res.status;
    throw err;
  }

  return data;
}

// ── Convenience methods ───────────────────────────────────────────────────────
export const api = {
  get:    (path, opts)         => apiFetch(path, { method: 'GET',    ...opts }),
  post:   (path, body, opts)   => apiFetch(path, { method: 'POST',   body: JSON.stringify(body), ...opts }),
  put:    (path, body, opts)   => apiFetch(path, { method: 'PUT',    body: JSON.stringify(body), ...opts }),
  patch:  (path, body, opts)   => apiFetch(path, { method: 'PATCH',  body: JSON.stringify(body), ...opts }),
  delete: (path, opts)         => apiFetch(path, { method: 'DELETE', ...opts }),
};

// ── Auth endpoints ────────────────────────────────────────────────────────────
export const authApi = {
  login:          (email, password)           => api.post('/api/auth/login',           { email, password }),
  register:       (name, email, password)     => api.post('/api/auth/register',        { name, email, password }),
  logout:         ()                          => api.post('/api/auth/logout',           { refreshToken: tokens.getRefresh() }),
  me:             ()                          => api.get('/api/auth/me'),
  changePassword: (currentPassword, newPassword) => api.post('/api/auth/change-password', { currentPassword, newPassword }),
};

// ── Solar endpoints ───────────────────────────────────────────────────────────
export const solarApi = {
  realtime:     () => api.get('/api/solar/realtime'),
  history:      () => api.get('/api/solar/history'),
  monthly:      () => api.get('/api/solar/monthly'),
  installation: () => api.get('/api/solar/installation'),
};

// ── Battery endpoints ─────────────────────────────────────────────────────────
export const batteryApi = {
  status:      ()               => api.get('/api/battery/status'),
  schedule:    ()               => api.get('/api/battery/schedule'),
  setSchedule: (entries)        => api.post('/api/battery/schedule', { entries }),
  setMode:     (mode)           => api.post('/api/battery/mode',     { mode }),
};

// ── Trading endpoints ─────────────────────────────────────────────────────────
export const tradingApi = {
  prices:      ()                              => api.get('/api/trading/prices'),
  offers:      (filters)                       => api.get('/api/trading/offers' + (filters ? '?' + new URLSearchParams(filters) : '')),
  postOffer:   (quantityKwh, pricePerKwh, durationHours) => api.post('/api/trading/offers', { quantityKwh, pricePerKwh, durationHours }),
  cancelOffer: (id)                            => api.delete(`/api/trading/offers/${id}`),
  buy:         (offerId, quantityKwh)          => api.post('/api/trading/buy', { offerId, quantityKwh }),
  history:     ()                              => api.get('/api/trading/history'),
};

// ── Alerts endpoints ──────────────────────────────────────────────────────────
export const alertsApi = {
  list:            (filters)  => api.get('/api/alerts' + (filters ? '?' + new URLSearchParams(filters) : '')),
  markRead:        (id)       => api.patch(`/api/alerts/${id}/read`, {}),
  dismiss:         (id)       => api.delete(`/api/alerts/${id}`),
  getPreferences:  ()         => api.get('/api/alerts/preferences'),
  setPreferences:  (prefs)    => api.put('/api/alerts/preferences', prefs),
};

// ── User endpoints ────────────────────────────────────────────────────────────
export const userApi = {
  profile:    ()       => api.get('/api/user/profile'),
  update:     (data)   => api.patch('/api/user/profile', data),
};
