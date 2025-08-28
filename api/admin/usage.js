import { listUsage } from "../_shared.js";

export default async function handler(req, res){
  const embedId = (req.query.embedId || '').toString() || undefined;
  const limit = Number(req.query.limit || 50);
  const events = await listUsage(embedId, Math.max(1, Math.min(1000, limit)));
  res.status(200).json({ events });
}
