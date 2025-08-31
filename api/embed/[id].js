import { getEmbedConfig, handleCorsPreflight, setCorsHeaders } from "../_shared.js";

export default async function handler(req, res){
  // Handle CORS preflight
  if (handleCorsPreflight(req, res)) return;

  // Set CORS headers for all requests
  setCorsHeaders(res);

  const { id } = req.query;
  const cfg = await getEmbedConfig(id);
  if (!cfg) return res.status(404).json({ error: "Embed not found" });
  const { width, height, theme, vertical, id: cfgId, name, verticalOptions } = cfg;
  res.status(200).json({ id: cfgId, name, vertical, theme, width, height, verticalOptions: verticalOptions || {} });
}
