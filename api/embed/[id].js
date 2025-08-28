import { embedConfigs } from "../_shared.js";

export default async function handler(req, res){
  const { id } = req.query;
  const cfg = embedConfigs[id];
  if (!cfg) return res.status(404).json({ error: "Embed not found" });
  const { width, height, theme, vertical, id: cfgId, name } = cfg;
  res.status(200).json({ id: cfgId, name, vertical, theme, width, height });
}
