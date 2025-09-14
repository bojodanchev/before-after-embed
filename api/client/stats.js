import { getClientByToken, listEmbedsForClient, listUsage, getClientPlan, getMonthlyUsageForClient, getMonthlyBonusForClient, getStorageMode } from "../_shared.js";

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

  // If embedId is provided, act like previous /client/usage and return events
  const embedId = (req.query?.embedId || '').toString().trim();
  if (embedId){
    const allowed = (await listEmbedsForClient(client.id)).some(e=> e.id === embedId);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });
    res.setHeader('Cache-Control', 'no-store');
    let events = await listUsage(embedId, 100);
    if (!events || events.length === 0){
      const all = await listUsage(undefined, 200);
      events = (all || []).filter(e => e && e.embedId === embedId);
    }
    return res.status(200).json({ events, storage: getStorageMode() });
  }

  const embeds = await listEmbedsForClient(client.id);
  const now = Date.now();
  const ids = embeds.map(e=> e.id);
  const totals = { overall: 0, byEmbed: {} };
  const last24h = { overall: 0, byEmbed: {} };
  const clientTotals = { overall: 0, byEmbed: {} };
  const clientLast24h = { overall: 0, byEmbed: {} };
  for (const id of ids){
    const events = await listUsage(id, 500);
    for (const evt of events){
      if (evt.event === 'edit_success'){
        totals.overall += 1; totals.byEmbed[id] = (totals.byEmbed[id] || 0) + 1;
        if (evt.ts && (now - evt.ts) <= 24*60*60*1000){ last24h.overall += 1; last24h.byEmbed[id] = (last24h.byEmbed[id] || 0) + 1; }
      }
      if (evt.event === 'client_render'){
        clientTotals.overall += 1; clientTotals.byEmbed[id] = (clientTotals.byEmbed[id] || 0) + 1;
        if (evt.ts && (now - evt.ts) <= 24*60*60*1000){ clientLast24h.overall += 1; clientLast24h.byEmbed[id] = (clientLast24h.byEmbed[id] || 0) + 1; }
      }
    }
  }
  let plan = null; let monthlyUsed = 0; let monthlyBonus = 0;
  try{ plan = await getClientPlan(client.id); }catch{}
  try{ monthlyUsed = await getMonthlyUsageForClient(client.id); }catch{}
  try{ monthlyBonus = await getMonthlyBonusForClient(client.id); }catch{}
  res.status(200).json({ totals, last24h, clientTotals, clientLast24h, plan, monthlyUsed, monthlyBonus });
}
