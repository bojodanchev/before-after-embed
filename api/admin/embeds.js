import { listEmbeds, setEmbedConfig } from "../_shared.js";

function extractToken(req){
  const auth = (req.headers.authorization || '').toString();
  const bearer = auth.replace(/^Bearer\s+/i, '').trim();
  const alt = (req.headers['x-admin-token'] || '').toString().trim();
  let fromQuery = (req.query && req.query.token ? req.query.token.toString() : '').trim();
  if (!fromQuery && req.url){
    try{
      const url = new URL(req.url, 'http://localhost');
      fromQuery = (url.searchParams.get('token') || '').trim();
    }catch{}
  }
  return bearer || alt || fromQuery;
}

function requireAdmin(req, res){
  const token = extractToken(req);
  const valid = (process.env.ADMIN_TOKEN || 'super-admin-token-please-change');
  if (!token || token !== valid){
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

export default async function handler(req, res){
  if (!requireAdmin(req, res)) return;

  if (req.method === 'GET'){
    const embeds = await listEmbeds();
    return res.status(200).json({ embeds });
  }
  if (req.method === 'POST'){
    const body = req.body || {};
    const id = (body.id || '').trim();
    if (!id) return res.status(400).json({ error: 'id is required' });
    const cfg = await setEmbedConfig({
      id,
      name: body.name || id,
      vertical: body.vertical || 'barber',
      theme: body.theme || 'light',
      width: body.width || '100%',
      height: body.height || '520px',
    });
    return res.status(200).json({ embed: cfg });
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
