import { assignEmbedToClient, listEmbedsForClient, getClientById } from "../_shared.js";

function extractToken(req){
  const auth = (req.headers.authorization || '').toString();
  const bearer = auth.replace(/^Bearer\s+/i, '').trim();
  const alt = (req.headers['x-admin-token'] || '').toString().trim();
  let fromQuery = (req.query?.token || '').toString().trim();
  if (!fromQuery && req.url){ try{ const u = new URL(req.url, 'http://localhost'); fromQuery = (u.searchParams.get('token') || '').trim(); }catch{} }
  return bearer || alt || fromQuery;
}

function requireAdmin(req, res){
  const token = extractToken(req);
  const candidates = [ (process.env.ADMIN_TOKEN || '').trim(), 'super-admin-token-please-change' ].filter(Boolean);
  if (!token || !candidates.includes(token)){
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return token;
}

export default async function handler(req, res){
  if (!requireAdmin(req, res)) return;
  if (req.method === 'GET'){
    const clientId = (req.query?.clientId || '').toString().trim();
    if (!clientId) return res.status(400).json({ error: 'clientId required' });
    const client = await getClientById(clientId);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    const embeds = await listEmbedsForClient(clientId);
    return res.status(200).json({ embeds });
  }
  if (req.method === 'POST'){
    const { clientId, embedId } = req.body || {};
    if (!clientId || !embedId) return res.status(400).json({ error: 'clientId and embedId required' });
    const updated = await assignEmbedToClient(clientId, embedId);
    return res.status(200).json({ embed: updated });
  }
  res.status(405).json({ error: 'Method not allowed' });
}
