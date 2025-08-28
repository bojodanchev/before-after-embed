import { listUsage } from "../_shared.js";

function extractToken(req){
  const auth = (req.headers.authorization || '').toString();
  const bearer = auth.replace(/^Bearer\s+/i, '').trim();
  const alt = (req.headers['x-admin-token'] || '').toString().trim();
  const fromQuery = (req.query.token || '').toString().trim();
  return bearer || alt || fromQuery;
}

function requireAdmin(req, res){
  const token = extractToken(req);
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN){
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

export default async function handler(req, res){
  if (!requireAdmin(req, res)) return;
  const embedId = (req.query.embedId || '').toString() || undefined;
  const limit = Number(req.query.limit || 50);
  const events = await listUsage(embedId, Math.max(1, Math.min(1000, limit)));
  res.status(200).json({ events });
}
