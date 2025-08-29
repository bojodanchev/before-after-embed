import { getClientByToken, listEmbedsForClient, setEmbedConfig, getEmbedConfig } from "../_shared.js";

function extractToken(req){
  const auth = (req.headers.authorization || '').toString();
  const bearer = auth.replace(/^Bearer\s+/i, '').trim();
  const fromQuery = (req.query?.token || '').toString().trim();
  return bearer || fromQuery;
}

export default async function handler(req, res){
  const token = extractToken(req);
  const client = await getClientByToken(token);
  if (!client) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method === 'GET'){
    const embeds = await listEmbedsForClient(client.id);
    return res.status(200).json({ embeds });
  }
  if (req.method === 'POST'){
    const body = req.body || {};
    const id = (body.id || '').toString().trim();
    if (!id) return res.status(400).json({ error: 'id required' });
    const cfg = await setEmbedConfig({
      id,
      name: body.name || id,
      clientId: client.id,
      vertical: body.vertical || 'barber',
      theme: body.theme || 'light',
      width: body.width || '100%',
      height: body.height || '520px',
    });
    return res.status(200).json({ embed: cfg });
  }
  if (req.method === 'PATCH'){
    const body = req.body || {};
    const id = (body.id || '').toString().trim();
    if (!id) return res.status(400).json({ error: 'id required' });
    const current = await getEmbedConfig(id);
    if (!current || current.clientId !== client.id) return res.status(404).json({ error: 'Embed not found' });
    const cfg = await setEmbedConfig({ ...current, ...body, id });
    return res.status(200).json({ embed: cfg });
  }
  res.status(405).json({ error: 'Method not allowed' });
}
