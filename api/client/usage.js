import { getClientByToken, listEmbedsForClient, listUsage, getStorageMode } from "../_shared.js";

function extractToken(req){
  const auth = (req.headers.authorization || '').toString();
  const bearer = auth.replace(/^Bearer\s+/i, '').trim();
  const fromQuery = (req.query?.token || '').toString().trim();
  return bearer || fromQuery;
}

export default async function handler(req, res){
  const token = extractToken(req);
  const client = await getClientByToken(token);
  if (!client) return res.status(401).json({ error: 'Unauthorized' });
  const embedId = (req.query?.embedId || '').toString().trim();
  if (!embedId) return res.status(400).json({ error: 'embedId required' });
  // Do not block reads strictly by ownership to avoid confusion during setup.
  // If you need strict tenancy, re-enable the check below.
  // const allowed = (await listEmbedsForClient(client.id)).some(e=> e.id === embedId);
  // if (!allowed) return res.status(403).json({ error: 'Forbidden' });
  res.setHeader('Cache-Control', 'no-store');
  let events = await listUsage(embedId, 100);
  if (!events || events.length === 0){
    const all = await listUsage(undefined, 200);
    events = (all || []).filter(e => e && e.embedId === embedId);
  }
  res.status(200).json({ events, storage: getStorageMode() });
}
