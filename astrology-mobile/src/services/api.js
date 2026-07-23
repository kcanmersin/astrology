// Production Render Live API URL
export const API_BASE_URL = 'https://astrology-k5kd.onrender.com/api/v1';

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
    console.error(`API Call failed (${url}):`, error);
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
  if (!response.ok) {
    throw new Error(`SVG Fetch failed with status ${response.status}`);
  }
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
  if (!response.ok) {
    throw new Error(`Synastry SVG Fetch failed with status ${response.status}`);
  }
  return await response.text();
}

export async function fetchAIInterpretation(data) {
  return request('/ai-interpretation', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
