import { getClientByToken, getClientSettings, updateClientSettings, getClientApiKey, generateClientApiKey, getClientPlan, setClientPlan, plans } from "../_shared.js";

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
    const settings = await getClientSettings(client.id);
    const apiKey = await getClientApiKey(client.id);
    const plan = await getClientPlan(client.id);
    return res.status(200).json({ settings, apiKey: apiKey || null, plan });
  }
  if (req.method === 'PATCH'){
    const next = await updateClientSettings(client.id, req.body || {});
    return res.status(200).json({ settings: next });
  }
  if (req.method === 'POST'){
    if (req.query?.action === 'generateKey'){
      const key = await generateClientApiKey(client.id);
      return res.status(200).json({ apiKey: key });
    }
    if (req.query?.action === 'setPlan'){
      const { planId } = req.body || {};
      try{
        const p = await setClientPlan(client.id, planId);
        return res.status(200).json({ plan: p });
      }catch(e){
        return res.status(400).json({ error: e?.message || 'Invalid plan' });
      }
    }
  }
  res.status(405).json({ error: 'Method not allowed' });
}


