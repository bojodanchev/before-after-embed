import { logUsage } from "./_shared.js";

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { embedId, event, meta } = req.body || {};
  if (!embedId || !event) return res.status(400).json({ error: 'embedId and event are required' });
  logUsage(event, embedId, meta || {});
  res.status(200).json({ ok: true });
}
