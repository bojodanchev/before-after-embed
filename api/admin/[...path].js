import { listEmbeds, setEmbedConfig, listClients, createClient, assignEmbedToClient, listEmbedsForClient, getClientById, listUsage, getStorageMode, getClientPlan, setClientPlan, plans, incrMonthlyBonusForClient, getMonthlyBonusForClient } from "../_shared.js";

function extractToken(req){
  const auth = (req.headers.authorization || '').toString();
  const bearer = auth.replace(/^Bearer\s+/i, '').trim();
  const alt = (req.headers['x-admin-token'] || '').toString().trim();
  let fromQuery = (req.query?.token || '').toString().trim();
  if (!fromQuery && req.url){ try{ const u = new URL(req.url, 'http://localhost'); fromQuery = (u.searchParams.get('token') || '').trim(); }catch{} }
  return bearer || alt || fromQuery;
}

function requireAdmin(req, res){
  const token = extractToken(req);
  const admin = (process.env.ADMIN_TOKEN || '').trim();
  if (!token || !admin || token !== admin){
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

export default async function handler(req, res){
  if (!requireAdmin(req, res)) return;

  // Parse path after /api/admin
  let pathname = '';
  try{ const u = new URL(req.url, 'http://localhost'); pathname = u.pathname.replace(/\/api\/admin\/?/, ''); }catch{}
  const segments = pathname.split('/').filter(Boolean);
  const resource = segments[0] || '';

  try{
    if (resource === 'embeds'){
      if (req.method === 'GET'){
        const embeds = await listEmbeds();
        return res.status(200).json({ embeds });
      }
      if (req.method === 'POST'){
        const body = req.body || {};
        const id = (body.id || '').trim();
        if (!id) return res.status(400).json({ error: 'id is required' });
        const cfg = await setEmbedConfig({ id, name: body.name || id, vertical: body.vertical || 'barber', theme: body.theme || 'light', width: body.width || '100%', height: body.height || '520px' });
        return res.status(200).json({ embed: cfg });
      }
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (resource === 'clients'){
      if (req.method === 'GET'){
        const clients = await listClients();
        return res.status(200).json({ clients });
      }
      if (req.method === 'POST'){
        const body = req.body || {}; const id = (body.id || '').trim();
        if (!id) return res.status(400).json({ error: 'id required' });
        const rec = await createClient({ id, name: body.name, email: body.email });
        return res.status(200).json({ client: rec });
      }
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (resource === 'client-embeds'){
      if (req.method === 'GET'){
        const clientId = (req.query?.clientId || '').toString().trim();
        if (!clientId) return res.status(400).json({ error: 'clientId required' });
        const client = await getClientById(clientId);
        if (!client) return res.status(404).json({ error: 'Client not found' });
        const embeds = await listEmbedsForClient(clientId);
        return res.status(200).json({ embeds });
      }
      if (req.method === 'POST'){
        const { clientId, embedId } = req.body || {};
        if (!clientId || !embedId) return res.status(400).json({ error: 'clientId and embedId required' });
        const updated = await assignEmbedToClient(clientId, embedId);
        return res.status(200).json({ embed: updated });
      }
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (resource === 'usage'){
      const embedId = (req.query?.embedId || '').toString() || undefined;
      const limit = Number(req.query?.limit || 50);
      const events = await listUsage(embedId, Math.max(1, Math.min(1000, limit)));
      return res.status(200).json({ events, storage: getStorageMode() });
    }

    if (resource === 'stats'){
      const now = Date.now();
      const events = await listUsage(undefined, 1000);
      const totals = { overall: 0, byEmbed: {} };
      const last24h = { overall: 0, byEmbed: {} };
      const clientTotals = { overall: 0, byEmbed: {} };
      const clientLast24h = { overall: 0, byEmbed: {} };
      for (const evt of events){
        if (evt.event === 'edit_success'){
          totals.overall += 1; totals.byEmbed[evt.embedId] = (totals.byEmbed[evt.embedId] || 0) + 1;
          if (evt.ts && (now - evt.ts) <= 24*60*60*1000){ last24h.overall += 1; last24h.byEmbed[evt.embedId] = (last24h.byEmbed[evt.embedId] || 0) + 1; }
        }
        if (evt.event === 'client_render'){
          clientTotals.overall += 1; clientTotals.byEmbed[evt.embedId] = (clientTotals.byEmbed[evt.embedId] || 0) + 1;
          if (evt.ts && (now - evt.ts) <= 24*60*60*1000){ clientLast24h.overall += 1; clientLast24h.byEmbed[evt.embedId] = (clientLast24h.byEmbed[evt.embedId] || 0) + 1; }
        }
      }
      return res.status(200).json({ totals, last24h, clientTotals, clientLast24h, sampleSize: events.length });
    }

    if (resource === 'plans'){
      if (req.method === 'GET'){
        return res.status(200).json({ plans });
      }
      if (req.method === 'POST'){
        const { clientId, planId } = req.body || {};
        if (!clientId || !planId) return res.status(400).json({ error: 'clientId and planId required' });
        try{
          const p = await setClientPlan(clientId, planId);
          return res.status(200).json({ clientId, plan: p });
        }catch(e){
          return res.status(400).json({ error: e?.message || 'Invalid plan' });
        }
      }
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (resource === 'link'){
      const clientId = (req.query?.clientId || '').toString().trim();
      if (!clientId) return res.status(400).json({ error: 'clientId required' });
      const c = await getClientById(clientId);
      if (!c) return res.status(404).json({ error: 'Client not found' });
      const origin = req.headers['x-forwarded-proto'] && req.headers['x-forwarded-host'] ? `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}` : '';
      const link = `${origin}/client.html?token=${encodeURIComponent(c.token)}`;
      return res.status(200).json({ link });
    }

    if (resource === 'bonus'){
      if (req.method === 'POST'){
        const { clientId, credits } = req.body || {};
        if (!clientId) return res.status(400).json({ error: 'clientId required' });
        if (!credits || typeof credits !== 'number') return res.status(400).json({ error: 'credits must be a number' });
        const c = await getClientById(clientId);
        if (!c) return res.status(404).json({ error: 'Client not found' });
        await incrMonthlyBonusForClient(clientId, credits);
        const newBonus = await getMonthlyBonusForClient(clientId);
        return res.status(200).json({ clientId, bonusCredits: newBonus });
      }
      if (req.method === 'GET'){
        const clientId = (req.query?.clientId || '').toString().trim();
        if (!clientId) return res.status(400).json({ error: 'clientId required' });
        const bonus = await getMonthlyBonusForClient(clientId);
        return res.status(200).json({ clientId, bonusCredits: bonus });
      }
      return res.status(405).json({ error: 'Method not allowed' });
    }

    return res.status(404).json({ error: 'Not found' });
  }catch(err){
    res.status(500).json({ error: 'Server error', message: err?.message || '' });
  }
}
