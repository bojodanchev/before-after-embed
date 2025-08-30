import { listUsage, getStorageMode } from "../_shared.js";

function extractToken(req){
  const auth = (req.headers.authorization || '').toString();
  const bearer = auth.replace(/^Bearer\s+/i, '').trim();
  const alt = (req.headers['x-admin-token'] || '').toString().trim();
  let fromQuery = (req.query?.token || '').toString().trim();
  if (!fromQuery && req.url){ try{ const u = new URL(req.url, 'http://localhost'); fromQuery = (u.searchParams.get('token') || '').trim(); }catch{} }
  return bearer || alt || fromQuery;
}

export default async function handler(req, res){
  // Gate behind ADMIN_TOKEN to avoid exposing raw events publicly
  const token = extractToken(req);
  const candidates = [ (process.env.ADMIN_TOKEN || '').trim(), 'super-admin-token-please-change' ].filter(Boolean);
  if (!token || !candidates.includes(token)){
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const embedId = (req.query?.embedId || '').toString() || undefined;
  const limit = Number(req.query?.limit || 20);
  const events = await listUsage(embedId, limit);
  // Sort newest → oldest for convenience
  const sorted = (events || []).slice().sort((a,b)=> (b?.ts||0) - (a?.ts||0));
  res.setHeader('Cache-Control','no-store');
  res.status(200).json({ events: sorted, storage: getStorageMode() });
}


