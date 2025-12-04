const API_BASE = (import.meta.env.VITE_API_BASE || '') + '/api';

let token = typeof window !== 'undefined' ? localStorage.getItem('cn_token') : null;

export function setToken(t) {
  token = t;
  if (typeof window !== 'undefined') {
    if (t) localStorage.setItem('cn_token', t);
    else localStorage.removeItem('cn_token');
  }
}

export function getToken() {
  if (token) return token;
  if (typeof window !== 'undefined') return localStorage.getItem('cn_token');
  return null;
}

export function getAuthHeader() {
  const t = getToken();
  return t ? { Authorization: 'Bearer ' + t } : {};
}

async function apiFetch(path, opts = {}) {
  opts.headers = opts.headers || {};
  if (token) opts.headers['Authorization'] = 'Bearer ' + token;
  if (opts.body && !(opts.body instanceof FormData)) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(opts.body);
  }
  const res = await fetch(API_BASE + path, opts);
  if (!res.ok) {
    const txt = await res.text().catch(() => res.statusText);
    throw new Error(txt || res.statusText);
  }
  return res.json().catch(() => null);
}

export { apiFetch, API_BASE };