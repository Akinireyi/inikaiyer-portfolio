// Vercel serverless function — load/save the June Planner state.
// Storage: a PRIVATE Vercel Blob ("juneplanner" store). Only this function,
//          holding BLOB_READ_WRITE_TOKEN (auto-added when the store was linked),
//          can read or write it — the blob is never publicly accessible.
// Auth:    header `x-planner-pin` must match env var PLANNER_PIN (if set).

const { put, get } = require('@vercel/blob');

const KEY = 'planner-state.json';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-planner-pin');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const required = process.env.PLANNER_PIN || '';
  const provided = req.headers['x-planner-pin'] || '';
  if (required && provided !== required) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return res.status(503).json({ error: 'storage not configured' });

  try {
    if (req.method === 'GET') {
      const found = await get(KEY, { token, access: 'private' });
      if (!found) return res.status(200).json({ state: null });
      const text = await new Response(found.stream).text();
      return res.status(200).json({ state: JSON.parse(text) });
    }

    if (req.method === 'POST') {
      const body = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body) || {};
      if (!body || typeof body.state !== 'object' || body.state === null) {
        return res.status(400).json({ error: 'missing state' });
      }
      await put(KEY, JSON.stringify(body.state), {
        access: 'private', token, contentType: 'application/json',
        addRandomSuffix: false, allowOverwrite: true
      });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: String(e && e.message || e) });
  }
};
