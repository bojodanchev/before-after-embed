import { consumeLoginToken, getClientById } from "../_shared.js";

export default async function handler(req, res){
  const t = (req.query?.t || '').toString().trim();
  if (!t) return res.status(400).send('Missing token');
  try{
    const clientId = await consumeLoginToken(t);
    if (!clientId) return res.status(400).send('Invalid or expired token');
    const client = await getClientById(clientId);
    if (!client || !client.token) return res.status(500).send('Client not found');
    const origin = req.headers['x-forwarded-proto'] && req.headers['x-forwarded-host']
      ? `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}`
      : '';
    const url = `${origin}/client.html?token=${encodeURIComponent(client.token)}`;
    res.writeHead(302, { Location: url });
    res.end();
  }catch(e){
    res.status(500).send('Server error');
  }
}

