import { logUsage, getStorageMode, listUsage } from "./_shared.js";

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try{
    const { embedId, event, meta } = req.body || {};
    if (!embedId || !event) return res.status(400).json({ error: 'embedId and event are required' });
    await logUsage(event, embedId, meta || {});
    const recent = await listUsage(embedId, 3);
    res.status(200).json({ ok: true, storage: getStorageMode(), recent });
  }catch(err){
    console.error('/api/usage error', err);
    res.status(500).json({ error: 'Failed to record usage' });
  }
}
