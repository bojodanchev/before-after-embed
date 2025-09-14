import { getClientByToken, setClientPlan, incrMonthlyBonusForClient, listEmbedsForClient, logUsage, plans } from "../../_shared.js";

export default async function handler(req, res){
  try{
    const auth = (req.headers.authorization || '').toString();
    const bearer = auth.replace(/^Bearer\s+/i, '').trim();
    const token = bearer || (req.query?.token || '').toString().trim();
    const client = await getClientByToken(token);
    if (!client) return res.status(401).send('Unauthorized');

    const planId = (req.query?.plan || '').toString();
    const credited = Number((req.query?.topup || '').toString());
    if (plans[planId]){
      await setClientPlan(client.id, planId);
      try{ const embeds = await listEmbedsForClient(client.id); for (const e of embeds){ await logUsage('plan_updated', e.id, { planId, source:'whop_success' }); } }catch{}
    }
    if (credited > 0){ await incrMonthlyBonusForClient(client.id, credited); try{ const embeds = await listEmbedsForClient(client.id); for (const e of embeds){ await logUsage('topup_applied', e.id, { credited, source:'whop_success' }); } }catch{} }

    const origin = (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-host'])
      ? `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}`
      : (req.headers.origin || '');
    const url = `${origin}/app/client.html?token=${encodeURIComponent(token)}&success=1${planId?`&plan=${encodeURIComponent(planId)}`:''}${credited?`&topup=${credited}`:''}`;
    res.writeHead(302, { Location: url });
    return res.end();
  }catch(e){ return res.status(500).send('Whop success processing failed'); }
}


