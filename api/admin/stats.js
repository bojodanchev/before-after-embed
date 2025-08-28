import { listUsage } from "../_shared.js";

function extractToken(req){
  const auth = (req.headers.authorization || '').toString();
  const bearer = auth.replace(/^Bearer\s+/i, '').trim();
  const alt = (req.headers['x-admin-token'] || '').toString().trim();
  let fromQuery = (req.query && req.query.token ? req.query.token.toString() : '').trim();
  if (!fromQuery && req.url){
    try{ const url = new URL(req.url, 'http://localhost'); fromQuery = (url.searchParams.get('token') || '').trim(); }catch{}
  }
  return bearer || alt || fromQuery;
}

function requireAdmin(req, res){
  const token = extractToken(req);
  const candidates = [ (process.env.ADMIN_TOKEN || '').trim(), 'super-admin-token-please-change' ].filter(Boolean);
  if (!token || !candidates.includes(token)){
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

export default async function handler(req, res){
  if (!requireAdmin(req, res)) return;
  // Fetch recent usage (last 1000 events max from storage helper)
  const now = Date.now();
  const events = await listUsage(undefined, 1000);
  const totals = { overall: 0, byEmbed: {} };
  const last24h = { overall: 0, byEmbed: {} };

  for (const evt of events){
    if (evt.event === 'edit_success'){
      totals.overall += 1;
      totals.byEmbed[evt.embedId] = (totals.byEmbed[evt.embedId] || 0) + 1;
      if (evt.ts && (now - evt.ts) <= 24*60*60*1000){
        last24h.overall += 1;
        last24h.byEmbed[evt.embedId] = (last24h.byEmbed[evt.embedId] || 0) + 1;
      }
    }
  }

  res.status(200).json({ totals, last24h, sampleSize: events.length });
}
