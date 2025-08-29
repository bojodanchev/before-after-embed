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
    if (!email) return res.status(400).json({ error: 'email required' });
    let client = await getClientByEmail(email);
    if (!client){
      // Stable id derived from email (prefix + short hash)
      const prefix = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$|--+/g,'');
      let hash = 0; for (let i=0;i<email.length;i++){ hash = ((hash<<5)-hash + email.charCodeAt(i)) | 0; }
      const suffix = Math.abs(hash).toString(36).slice(0,4);
      const cid = `${prefix}-${suffix}`;
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
