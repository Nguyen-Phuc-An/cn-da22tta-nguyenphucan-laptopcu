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
  // Always read fresh from localStorage
  if (typeof window !== 'undefined') {
    return localStorage.getItem('cn_token');
  }
  return token;
}

export function getAuthHeader() {
  const t = getToken();
  return t ? { Authorization: 'Bearer ' + t } : {};
}

async function apiFetch(path, opts = {}) {
  opts.headers = opts.headers || {};
  const currentToken = getToken();
  if (currentToken) {
    opts.headers['Authorization'] = 'Bearer ' + currentToken;
    console.log('[apiFetch] Using token, length:', currentToken.length);
  } else {
    console.log('[apiFetch] No token found in localStorage');
  }
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