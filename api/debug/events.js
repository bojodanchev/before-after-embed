import { listUsage, getStorageMode } from "../_shared.js";

export default async function handler(req, res){
  const embedId = (req.query?.embedId || '').toString() || undefined;
  const limit = Number(req.query?.limit || 20);
  const events = await listUsage(embedId, limit);
  res.status(200).json({ events, storage: getStorageMode() });
}


