/**
 * API service for backend (auth + emergencies)
 */

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (e) {
    if (e.message === 'Network request failed' || e.name === 'TypeError') {
      throw new Error(
        `Cannot reach backend at ${API_BASE}. Is it running? Use your PC IP in .env (e.g. http://10.53.156.176:3001/api).`
      );
    }
    throw e;
  }
}

export async function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(email, password, name, role = 'person') {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, role }),
  });
}

export async function syncEmergency(emergency, token, userId) {
  const matrixCell = emergency.matrixCell?.cell || emergency.matrixCell;
  return request('/emergencies', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify({
      id: emergency.id,
      user_id: userId,
      timestamp: emergency.timestamp,
      csi: emergency.csi,
      triage: emergency.triage,
      status: emergency.status,
      matrix_cell: matrixCell,
      connectivity: emergency.connectivity,
      tier: emergency.tier,
      location: emergency.location,
      packet: emergency.packet,
    }),
  });
}

export async function fetchEmergencies(token) {
  return request('/emergencies', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function fetchSettings(token) {
  if (!token) return null;
  return request('/settings', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function saveSettingsApi(token, payload) {
  if (!token) return null;
  return request('/settings', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}
