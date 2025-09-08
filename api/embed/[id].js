import { getEmbedConfig, getClientPlan, getClientSettings, handleCorsPreflight, setCorsHeaders } from "../_shared.js";

export default async function handler(req, res){
  // Handle CORS preflight
  if (handleCorsPreflight(req, res)) return;

  // Set CORS headers for all requests
  setCorsHeaders(req, res);

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
    const { width, height, theme, vertical, id: cfgId, name, verticalOptions, clientId } = cfg;
    // Theme customization (brand color) only for growth/pro where themeCustomization === 'custom'
    let accent = null;
    let customization = 'basic';
    try{
      if (clientId){
        const plan = await getClientPlan(clientId);
        customization = plan?.themeCustomization || 'basic';
        if (customization === 'custom'){
          const s = await getClientSettings(clientId);
          const bc = (s?.brandColor || '').toString().trim();
          if (bc) accent = bc;
        }
      }
    }catch(_e){}
    res.status(200).json({ id: cfgId, name, vertical, theme, width, height, verticalOptions: verticalOptions || {}, accent, customization });
  } catch (error) {
    console.error('Error fetching embed config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
