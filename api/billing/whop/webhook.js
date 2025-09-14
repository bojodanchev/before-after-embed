import { getClientByEmail, setClientPlan, incrMonthlyBonusForClient, listEmbedsForClient, logUsage, plans } from "../../_shared.js";

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try{
    const auth = (req.headers.authorization || '').toString();
    const token = auth.replace(/^Bearer\s+/i, '').trim();
    const expected = (process.env.WHOP_WEBHOOK_SECRET || '').trim();
    if (!expected || token !== expected){ return res.status(401).json({ error: 'Unauthorized' }); }

    const body = req.body || {};
    const email = (body?.customer?.email || body?.user?.email || body?.buyer?.email || body?.email || '').toString().trim();
    let planName = (body?.product?.name || body?.plan || body?.price?.nickname || body?.price?.name || '').toString().toLowerCase();
    const ref = (body?.product?.id || body?.plan_id || body?.price_id || body?.product_id || '').toString();
    function inferPlan(name){
      const s = (name || '').toLowerCase();
      if (s.includes('pro')) return 'pro';
      if (s.includes('growth')) return 'growth';
      if (s.includes('starter')) return 'starter';
      return '';
    }
    const planId = inferPlan(planName) || inferPlan(ref);
    const credited = Number(body?.metadata?.topup || body?.topup || 0);

    if (!email) return res.status(200).json({ ok:true, note:'ignored: no email' });
    const client = await getClientByEmail(email);
    if (!client) return res.status(200).json({ ok:true, note:'ignored: client not found' });

    if (plans[planId]){
      await setClientPlan(client.id, planId);
      try{ const embeds = await listEmbedsForClient(client.id); for (const e of embeds){ await logUsage('plan_updated', e.id, { planId, source:'whop_webhook' }); } }catch{}
    }
    if (credited > 0){ await incrMonthlyBonusForClient(client.id, credited); try{ const embeds = await listEmbedsForClient(client.id); for (const e of embeds){ await logUsage('topup_applied', e.id, { credited, source:'whop_webhook' }); } }catch{} }

    return res.status(200).json({ ok:true });
  }catch(e){
    return res.status(500).json({ error: e?.message || 'Webhook failed' });
  }
}


