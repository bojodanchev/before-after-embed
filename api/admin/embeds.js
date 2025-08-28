import { listEmbeds, setEmbedConfig } from "../_shared.js";

export default async function handler(req, res){
  if (req.method === 'GET'){
    const embeds = await listEmbeds();
    return res.status(200).json({ embeds });
  }
  if (req.method === 'POST'){
    const body = req.body || {};
    const id = (body.id || '').trim();
    if (!id) return res.status(400).json({ error: 'id is required' });
    const cfg = await setEmbedConfig({
      id,
      name: body.name || id,
      vertical: body.vertical || 'barber',
      theme: body.theme || 'light',
      width: body.width || '100%',
      height: body.height || '520px',
    });
    return res.status(200).json({ embed: cfg });
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
