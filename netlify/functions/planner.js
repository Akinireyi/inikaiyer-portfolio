// Storage backend for the June Planner app.
// GET  -> returns the saved planner state (or null if nothing saved yet)
// POST -> saves the planner state ({ state: {...} })
// Auth -> requires header `x-planner-pin` to match env var PLANNER_PIN (if set).
// Data lives in Netlify Blobs — no database or extra account needed.

const { getStore } = require('@netlify/blobs');

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-planner-pin',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Cache-Control': 'no-store'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  // PIN gate — only enforced if PLANNER_PIN is configured in Netlify env.
  const required = process.env.PLANNER_PIN || '';
  const provided = event.headers['x-planner-pin'] || event.headers['X-Planner-Pin'] || '';
  if (required && provided !== required) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'unauthorized' }) };
  }

  let store;
  try {
    store = getStore('june-planner');
  } catch (e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'storage unavailable: ' + String(e) }) };
  }

  try {
    if (event.httpMethod === 'GET') {
      const state = await store.get('state', { type: 'json' });
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ state: state || null }) };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      if (!body || typeof body.state !== 'object' || body.state === null) {
        return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'missing state' }) };
      }
      await store.setJSON('state', body.state);
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, savedAt: body.state.updatedAt || null }) };
    }

    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'method not allowed' }) };
  } catch (e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: String(e) }) };
  }
};
