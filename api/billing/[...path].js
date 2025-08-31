import Stripe from 'stripe';
import { getClientByToken, setClientPlan, plans, getClientPlan } from '../_shared.js';

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
  const stripe = getStripe();
  if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });

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
      if (!plans[planId] || !price) return res.status(400).json({ error: 'Invalid plan' });

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price, quantity: 1 }],
        success_url: `${req.headers.origin || ''}/app/client.html?token=${encodeURIComponent(token)}`,
        cancel_url: `${req.headers.origin || ''}/app/client.html?token=${encodeURIComponent(token)}`,
        metadata: { clientId: client.id, planId },
      });
      return res.status(200).json({ url: session.url });
    }catch(e){ return res.status(500).json({ error: e?.message || 'Checkout failed' }); }
  }

  if (resource === 'portal' && req.method === 'POST'){
    try{
      const token = extractToken(req);
      const client = await getClientByToken(token);
      if (!client) return res.status(401).json({ error: 'Unauthorized' });
      const { customerId } = req.body || {};
      const session = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: `${req.headers.origin || ''}/app/client.html?token=${encodeURIComponent(token)}` });
      return res.status(200).json({ url: session.url });
    }catch(e){ return res.status(500).json({ error: e?.message || 'Portal failed' }); }
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
        }
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


