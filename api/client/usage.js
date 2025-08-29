import { getClientByToken, listEmbedsForClient, listUsage } from "../_shared.js";

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
  const allowed = (await listEmbedsForClient(client.id)).some(e=> e.id === embedId);
  if (!allowed) return res.status(403).json({ error: 'Forbidden' });
  const events = await listUsage(embedId, 100);
  res.status(200).json({ events });
}
