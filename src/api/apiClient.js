import { API_BASE } from './config';
import { API_V1 } from './config';
export async function apiFetch(path, options = {}, token = null) {
  const base = API_BASE || '';
  const url = base.endsWith('/') ? base.slice(0, -1) + path : base + path;
  
  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {})
  };
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, {...options, headers});
  const text = await res.text();
  try {
    const json = text ? JSON.parse(text) : null;
    if (!res.ok) {
      const err = new Error(json?.message || res.statusText || 'API error');
      err.response = json;
      throw err;
    }
    return json;
  } catch (e) {
    const err = new Error('Invalid JSON response from ' + url);
    err.raw = text;
    throw err;
  }
}
