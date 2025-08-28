import { listUsage } from "../_shared.js";

function requireAdmin(req, res){
  const auth = (req.headers.authorization || '').toString();
  const token = auth.replace(/^Bearer\s+/i, '');
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
