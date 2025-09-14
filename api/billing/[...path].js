import Stripe from 'stripe';
import { getClientByToken, getClientByEmail, setClientPlan, plans, incrMonthlyBonusForClient, logUsage, listEmbedsForClient, isWhopEnabled, buildWhopCheckoutUrl } from '../_shared.js';

function extractToken(req){
  const auth = (req.headers.authorization || '').toString();
  const bearer = auth.replace(/^Bearer\s+/i, '').trim();
  const fromQuery = (req.query?.token || '').toString().trim();
  return bearer || fromQuery;
}

function getStripe(){
  const key = (process.env.STRIPE_SECRET_KEY || '').trim();
  if (!key) return null;
  return new Stripe(key, { apiVersion: '2024-06-20' });
}

const PRICE_MAP = {
  free: process.env.STRIPE_PRICE_FREE || '',
  starter: process.env.STRIPE_PRICE_STARTER || '',
  growth: process.env.STRIPE_PRICE_GROWTH || '',
  pro: process.env.STRIPE_PRICE_PRO || '',
};

export default async function handler(req, res){
  const usingWhop = isWhopEnabled() || Boolean((process.env.WHOP_CHECKOUT_STARTER||process.env.WHOP_CHECKOUT_GROWTH||process.env.WHOP_CHECKOUT_PRO||'').trim());
  const stripe = usingWhop ? null : getStripe();
  if (!usingWhop && !stripe) return res.status(500).json({ error: 'Stripe not configured' });
  // Guard: prevent test keys in production
  try{
    const env = (process.env.VERCEL_ENV || process.env.NODE_ENV || '').toString();
    const rawKey = (process.env.STRIPE_SECRET_KEY || '').trim();
    if ((env === 'production' || env === 'prod') && rawKey.startsWith('sk_test_')){
      return res.status(500).json({ error: 'Stripe test key detected in production. Configure live keys.' });
    }
  }catch{}

  // Parse path after /api/billing
  let pathname = '';
  try{ const u = new URL(req.url, 'http://localhost'); pathname = u.pathname.replace(/\/api\/billing\/?/, ''); }catch{}
  const segments = pathname.split('/').filter(Boolean);
  const resource = segments[0] || '';

  if (resource === 'checkout' && req.method === 'POST'){
    try{
      const token = extractToken(req);
      const client = await getClientByToken(token);
      if (!client) return res.status(401).json({ error: 'Unauthorized' });
      const { planId } = req.body || {};
      const price = PRICE_MAP[planId];
      if (!plans[planId]) return res.status(400).json({ error: 'Invalid plan' });

      // Free plan: bypass Stripe, set immediately
      if (planId === 'free' || !price || price === 'free'){
        try{ await setClientPlan(client.id, 'free'); }catch{}
        const origin = (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-host'])
          ? `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}`
          : (req.headers.origin || '');
        const url = `${origin}/app/client.html?token=${encodeURIComponent(token)}`;
        return res.status(200).json({ url, bypass: true });
      }

      // If Whop is enabled, return its checkout URL instead
      if (usingWhop){
        const origin = (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-host'])
          ? `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}`
          : (req.headers.origin || '');
        const url = buildWhopCheckoutUrl({ planId, clientId: client.id, token, origin });
        if (!url) return res.status(500).json({ error: 'Whop checkout not configured for this plan' });
        return res.status(200).json({ url, provider: 'whop' });
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price, quantity: 1 }],
        success_url: `${(req.headers['x-forwarded-proto'] && req.headers['x-forwarded-host']) ? `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}` : (req.headers.origin || '')}/app/client.html?token=${encodeURIComponent(token)}&success=1&plan=${encodeURIComponent(planId)}`,
        cancel_url: `${(req.headers['x-forwarded-proto'] && req.headers['x-forwarded-host']) ? `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}` : (req.headers.origin || '')}/app/client.html?token=${encodeURIComponent(token)}`,
        metadata: { clientId: client.id, planId },
      });
      return res.status(200).json({ url: session.url });
    }catch(e){ return res.status(500).json({ error: e?.message || 'Checkout failed' }); }
  }

  if (resource === 'portal' && req.method === 'POST'){
    if (usingWhop){
      return res.status(400).json({ error: 'Billing portal not available with Whop. Manage subscription in Whop.' });
    }
    try{
      const token = extractToken(req);
      const client = await getClientByToken(token);
      if (!client) return res.status(401).json({ error: 'Unauthorized' });
      const { customerId } = req.body || {};
      const origin = (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-host'])
        ? `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}`
        : (req.headers.origin || '');
      const session = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: `${origin}/app/client.html?token=${encodeURIComponent(token)}` });
      return res.status(200).json({ url: session.url });
    }catch(e){ return res.status(500).json({ error: e?.message || 'Portal failed' }); }
  }

  if (resource === 'topup' && req.method === 'POST'){
    try{
      const token = extractToken(req);
      const client = await getClientByToken(token);
      if (!client) return res.status(401).json({ error: 'Unauthorized' });
      const { units } = req.body || {}; // units of 100 generations
      const n = Math.max(1, Number(units || 1));
      const price = (process.env.STRIPE_PRICE_TOPUP || '').trim();

      // Whop one-time top-up
      if (usingWhop){
        const origin = (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-host'])
          ? `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}`
          : (req.headers.origin || '');
        const base = process.env.WHOP_CHECKOUT_TOPUP || '';
        if (!base) return res.status(400).json({ error: 'Top-up not configured' });
        const url = new URL(base);
        const ret = new URL('/api/billing/whop/success', origin);
        ret.searchParams.set('token', token);
        ret.searchParams.set('clientId', client.id);
        ret.searchParams.set('topup', String(n*100));
        url.searchParams.set('return_url', ret.toString());
        return res.status(200).json({ url: url.toString(), provider: 'whop' });
      }

      if (!price) return res.status(400).json({ error: 'Top-up price not configured' });
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{ price, quantity: n }],
        success_url: `${(req.headers['x-forwarded-proto'] && req.headers['x-forwarded-host']) ? `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}` : (req.headers.origin || '')}/app/client.html?token=${encodeURIComponent(token)}&success=1&topup=${n*100}`,
        cancel_url: `${(req.headers['x-forwarded-proto'] && req.headers['x-forwarded-host']) ? `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}` : (req.headers.origin || '')}/app/client.html?token=${encodeURIComponent(token)}`,
        metadata: { clientId: client.id, topup: String(n * 100) },
      });
      return res.status(200).json({ url: session.url });
    }catch(e){ return res.status(500).json({ error: e?.message || 'Top-up failed' }); }
  }
  // Whop success return URL handler (no signature verification in MVP; trust redirect)
  if (resource === 'whop' && segments[1] === 'success' && req.method === 'GET'){
    try{
      const token = extractToken(req);
      const client = await getClientByToken(token);
      if (!client) return res.status(401).send('Unauthorized');
      const planId = (req.query?.plan || '').toString();
      const credited = Number((req.query?.topup || '').toString());
      if (plans[planId]){ await setClientPlan(client.id, planId); try{ const embeds = await listEmbedsForClient(client.id); for (const e of embeds){ await logUsage('plan_updated', e.id, { planId, source:'whop_success' }); } }catch{} }
      if (credited > 0){ await incrMonthlyBonusForClient(client.id, credited); try{ const embeds = await listEmbedsForClient(client.id); for (const e of embeds){ await logUsage('topup_applied', e.id, { credited, source:'whop_success' }); } }catch{} }
      const origin = (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-host'])
        ? `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}`
        : (req.headers.origin || '');
      const url = `${origin}/app/client.html?token=${encodeURIComponent(token)}&success=1${planId?`&plan=${encodeURIComponent(planId)}`:''}${credited?`&topup=${credited}`:''}`;
      res.writeHead(302, { Location: url });
      return res.end();
    }catch(e){ return res.status(500).send('Whop success processing failed'); }
  }

  // Whop webhook (MVP): secure via Authorization: Bearer WHOP_WEBHOOK_SECRET
  if (resource === 'whop' && segments[1] === 'webhook' && req.method === 'POST'){
    try{
      const auth = (req.headers.authorization || '').toString();
      const token = auth.replace(/^Bearer\s+/i, '').trim();
      const expected = (process.env.WHOP_WEBHOOK_SECRET || '').trim();
      if (!expected || token !== expected){ return res.status(401).json({ error: 'Unauthorized' }); }
      const body = req.body || {};
      const email = (body?.customer?.email || body?.user?.email || body?.buyer?.email || body?.email || '').toString().trim();
      function inferPlan(name){ const s = (name || '').toLowerCase(); if (s.includes('pro')) return 'pro'; if (s.includes('growth')) return 'growth'; if (s.includes('starter')) return 'starter'; return ''; }
      const planName = (body?.product?.name || body?.plan || body?.price?.nickname || body?.price?.name || '').toString();
      const ref = (body?.product?.id || body?.plan_id || body?.price_id || body?.product_id || '').toString();
      const planId = inferPlan(planName) || inferPlan(ref);
      const credited = Number(body?.metadata?.topup || body?.topup || 0);
      if (!email) return res.status(200).json({ ok:true, note:'ignored: no email' });
      let client = null; try{ client = await getClientByEmail(email); }catch{}
      if (!client) return res.status(200).json({ ok:true, note:'ignored: client not found' });
      if (plans[planId]){ await setClientPlan(client.id, planId); try{ const embeds = await listEmbedsForClient(client.id); for (const e of embeds){ await logUsage('plan_updated', e.id, { planId, source:'whop_webhook' }); } }catch{} }
      if (credited > 0){ await incrMonthlyBonusForClient(client.id, credited); try{ const embeds = await listEmbedsForClient(client.id); for (const e of embeds){ await logUsage('topup_applied', e.id, { credited, source:'whop_webhook' }); } }catch{} }
      return res.status(200).json({ ok:true });
    }catch(e){ return res.status(500).json({ error: e?.message || 'Webhook failed' }); }
  }

  if (resource === 'webhook'){
    // Minimal webhook: set plan on checkout completion
    const sig = req.headers['stripe-signature'];
    const whSecret = (process.env.STRIPE_WEBHOOK_SECRET || '').trim();
    let event;
    try{
      const buf = await getRawBody(req);
      event = stripe.webhooks.constructEvent(buf, sig, whSecret);
    }catch(err){ return res.status(400).send(`Webhook Error: ${err.message}`); }

    try{
      if (event.type === 'checkout.session.completed'){
        const session = event.data.object;
        const clientId = session?.metadata?.clientId;
        const planId = session?.metadata?.planId;
        if (clientId && plans[planId]){
          await setClientPlan(clientId, planId);
          try{ const embeds = await listEmbedsForClient(clientId); for (const e of embeds){ await logUsage('plan_updated', e.id, { planId }); } }catch{}
        }
        // Handle top-up one-time purchases via metadata
        const bonus = Number(session?.metadata?.topup || 0);
        if (clientId && bonus > 0){ await incrMonthlyBonusForClient(clientId, bonus); try{ const embeds = await listEmbedsForClient(clientId); for (const e of embeds){ await logUsage('topup_applied', e.id, { credited: bonus }); } }catch{} }
      }
      if (event.type === 'checkout.session.async_payment_succeeded'){
        const session = event.data.object;
        const clientId = session?.metadata?.clientId;
        const bonus = Number(session?.metadata?.topup || 0);
        if (clientId && bonus > 0){ await incrMonthlyBonusForClient(clientId, bonus); try{ const embeds = await listEmbedsForClient(clientId); for (const e of embeds){ await logUsage('topup_applied', e.id, { credited: bonus }); } }catch{} }
      }
    }catch{}
    return res.status(200).json({ received: true });
  }

  res.status(404).json({ error: 'Not found' });
}

async function getRawBody(req){
  return await new Promise((resolve, reject) => {
    try{
      const chunks = [];
      req.on('data', (c)=> chunks.push(Buffer.from(c)));
      req.on('end', ()=> resolve(Buffer.concat(chunks)));
      req.on('error', reject);
    }catch(e){ reject(e); }
  });
}
