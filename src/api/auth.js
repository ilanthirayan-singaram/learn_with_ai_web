import { API_V1 } from './config';

export async function loginUser(payload) {
  const url = (API_V1 || '') + '/login';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  });
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch (e) {
    const err = new Error('Invalid JSON response from login');
    err.raw = text;
    throw err;
  }
}
