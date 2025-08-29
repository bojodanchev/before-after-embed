import { getClientByToken, listEmbedsForClient } from "../_shared.js";

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
  const embeds = await listEmbedsForClient(client.id);
  res.status(200).json({ embeds });
}
