// Vercel serverless function — load/save the June Planner state.
// Storage: Vercel KV (Upstash Redis), used over its REST API (no npm deps).
//          Create it in Vercel dashboard -> Storage; it auto-adds the two
//          KV_REST_API_* env vars to this project.
// Auth:    header `x-planner-pin` must match env var PLANNER_PIN (if set).

const KEY = 'planner-state';

async function kv(command) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return { _noconfig: true };
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  });
  return r.json();
}

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

  try {
    if (req.method === 'GET') {
      const out = await kv(['GET', KEY]);
      if (out._noconfig) return res.status(200).json({ state: null, storage: 'unconfigured' });
      const state = out.result ? JSON.parse(out.result) : null;
      return res.status(200).json({ state });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const parsed = typeof body === 'string' ? JSON.parse(body) : body;
      if (!parsed || typeof parsed.state !== 'object' || parsed.state === null) {
        return res.status(400).json({ error: 'missing state' });
      }
      const out = await kv(['SET', KEY, JSON.stringify(parsed.state)]);
      if (out._noconfig) return res.status(503).json({ error: 'storage not configured' });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
};
