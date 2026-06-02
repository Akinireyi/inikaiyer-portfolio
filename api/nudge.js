// Vercel serverless function — a short, warm, motivating nudge for the planner.
// Input:  { summary: "Math: 2 missed sessions; Grad: 1 past deadline", status: "red"|"yellow" }
// Output: { reply: "<1-2 encouraging, specific sentences>" }
// Reuses the existing ANTHROPIC_API_KEY env var (same as api/chat.js).
// The client always has a static fallback, so this is best-effort polish.

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  const body = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body) || {};
  const summary = (body.summary || '').toString().slice(0, 500);
  const status = body.status === 'red' ? 'behind' : 'slightly behind';

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(200).json({ reply: '' }); // client falls back to its static line

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 90,
        system: `You are Inika's warm, encouraging study coach inside her personal planner app.
She is a high-school senior in June 2026 juggling math classes, graduation planning, and senior-year fun.
Given a short summary of where she's ${status}, write ONE or TWO sentences (max ~30 words) that:
- name what needs attention specifically,
- are kind and motivating (never harsh or guilt-trippy),
- end with a tiny, concrete next step to build momentum.
Plain text only. No emojis. No preamble. Speak directly to her ("you").`,
        messages: [{ role: 'user', content: `Where I'm ${status}: ${summary || 'a few tasks slipping'}` }]
      })
    });
    const data = await response.json();
    const reply = data?.content?.[0]?.text?.trim();
    return res.status(200).json({ reply: reply || '' });
  } catch (e) {
    return res.status(200).json({ reply: '' });
  }
};
