import { Platform } from 'react-native';

// Production Render API URL & Local Development Fallbacks
const RENDER_API_URL = 'https://astrology-k5kd.onrender.com/api/v1';
const LOCAL_IP_URL = 'http://192.168.1.101:8000/api/v1';

export const API_BASE_URL = RENDER_API_URL;

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Error (${response.status}): ${errText}`);
    }

    return await response.json();
  } catch (error) {
    // If Render instance is sleeping or unreachable, fallback to local IP
    if (API_BASE_URL !== LOCAL_IP_URL) {
      console.warn(`Render API unreachable (${error.message}). Retrying on local LAN: ${LOCAL_IP_URL}`);
      const fallbackUrl = `${LOCAL_IP_URL}${endpoint}`;
      const res = await fetch(fallbackUrl, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
      });
      return await res.json();
    }
    throw error;
  }
}

export async function fetchNatalChart(data) {
  return request('/natal-chart', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchNatalSVG(data) {
  const url = `${API_BASE_URL}/natal-chart/svg`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await response.text();
}

export async function fetchSynastryChart(data) {
  return request('/synastry-chart', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchSynastrySVG(data) {
  const url = `${API_BASE_URL}/synastry-chart/svg`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await response.text();
}

export async function fetchAIInterpretation(data) {
  return request('/ai-interpretation', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
