import { getClientByToken } from "../_shared.js";

function extractToken(req){
  const auth = (req.headers.authorization || '').toString();
  return auth.replace(/^Bearer\s+/i, '').trim();
}

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try{
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const client = await getClientByToken(token);
    if (!client) return res.status(401).json({ error: 'Unauthorized' });
    // For now, logout is client-side (clear local token). We may add server-side session revocation later.
    return res.status(200).json({ ok: true });
  }catch(e){
    return res.status(500).json({ error: 'Server error' });
  }
}

