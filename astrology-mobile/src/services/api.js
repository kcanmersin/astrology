// API Service connecting Expo mobile app to Kerykeion FastAPI Backend

import { Platform } from 'react-native';

// Use local network IP (192.168.1.101) for physical mobile devices on Expo Go
export const LOCAL_IP = '192.168.1.101';

export const BASE_URL = Platform.OS === 'web' 
  ? 'http://127.0.0.1:8000' 
  : `http://${LOCAL_IP}:8000`;

export async function fetchHealth() {
  const res = await fetch(`${BASE_URL}/api/v1/health`);
  return res.json();
}

export async function fetchNatalChart(data) {
  const res = await fetch(`${BASE_URL}/api/v1/natal-chart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Harita hesaplanamadı');
  return res.json();
}

export async function fetchNatalSVG(data) {
  const res = await fetch(`${BASE_URL}/api/v1/natal-chart/svg`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('SVG oluşturulamadı');
  return res.text();
}

export async function fetchSynastryChart(data) {
  const res = await fetch(`${BASE_URL}/api/v1/synastry-chart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Synastry hesaplanamadı');
  return res.json();
}

export async function fetchSynastrySVG(data) {
  const res = await fetch(`${BASE_URL}/api/v1/synastry-chart/svg`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Synastry SVG oluşturulamadı');
  return res.text();
}

export async function fetchTransitChart(data) {
  const res = await fetch(`${BASE_URL}/api/v1/transit-chart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Transit hesaplanamadı');
  return res.json();
}

export async function fetchHouseSystems() {
  const res = await fetch(`${BASE_URL}/api/v1/house-systems`);
  return res.json();
}
