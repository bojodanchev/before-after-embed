import { getClientByToken, getClientByEmail, createClient } from "../_shared.js";

function extractToken(req){
  const auth = (req.headers.authorization || '').toString();
  const bearer = auth.replace(/^Bearer\s+/i, '').trim();
  const fromQuery = (req.query?.token || '').toString().trim();
  return bearer || fromQuery;
}

export default async function handler(req, res){
  if (req.method === 'POST'){
    const email = (req.body?.email || '').toString().trim();
    const id = (req.body?.id || '').toString().trim();
    if (!email && !id) return res.status(400).json({ error: 'email or id required' });
    let client = id ? await getClientByEmail(email) : null;
    if (!client){
      const cid = id || (email.split('@')[0] + '-' + Math.random().toString(36).slice(2,6));
      client = await createClient({ id: cid, name: cid, email });
    }
    const origin = req.headers['x-forwarded-proto'] && req.headers['x-forwarded-host']
      ? `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}`
      : '';
    const link = `${origin}/client.html?token=${encodeURIComponent(client.token)}`;
    return res.status(200).json({ client, link });
  }
  const token = extractToken(req);
  const client = await getClientByToken(token);
  if (!client) return res.status(401).json({ error: 'Unauthorized' });
  res.status(200).json({ client });
}
