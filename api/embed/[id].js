import { getEmbedConfig, handleCorsPreflight, setCorsHeaders } from "../_shared.js";

export default async function handler(req, res){
  // Handle CORS preflight
  if (handleCorsPreflight(req, res)) return;

  // Set CORS headers for all requests
  setCorsHeaders(res);

  // Allow both GET and POST methods
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Embed ID is required' });
  }

  try {
    const cfg = await getEmbedConfig(id);
    if (!cfg) return res.status(404).json({ error: "Embed not found" });
    const { width, height, theme, vertical, id: cfgId, name, verticalOptions } = cfg;
    res.status(200).json({ id: cfgId, name, vertical, theme, width, height, verticalOptions: verticalOptions || {} });
  } catch (error) {
    console.error('Error fetching embed config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
