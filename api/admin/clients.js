import { createClient, listClients } from "../_shared.js";

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
    const clients = await listClients();
    return res.status(200).json({ clients });
  }
  if (req.method === 'POST'){
    const body = req.body || {};
    const id = (body.id || '').trim();
    if (!id) return res.status(400).json({ error: 'id required' });
    const rec = await createClient({ id, name: body.name, email: body.email });
    return res.status(200).json({ client: rec });
  }
  res.status(405).json({ error: 'Method not allowed' });
}
