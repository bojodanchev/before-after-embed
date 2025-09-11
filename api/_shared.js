import { fal } from "@fal-ai/client";
import { kv as vercelKv } from "@vercel/kv";

fal.config({ credentials: process.env.FAL_KEY || "" });

export const verticalPromptPresets = {
  barber: "Apply a modern, realistic men's fade haircut; maintain identity and face shape; natural lighting; high fidelity.",
  dental: "Whiten teeth naturally, improve alignment subtly without changing face identity; realistic results; no overexposure.",
  // Keep base prompt neutral for detailing; per-focus text is appended below
  detailing: "Professional auto detailing enhancement. Produce a realistic, clearly visible improvement while preserving the original car model and color.",
};

// ===== SaaS plans =====
export const plans = {
  free: {
    id: 'free', name: 'Free', price: 0,
    monthlyGenerations: 10, maxEmbeds: 1,
    watermarkRequired: true, themeCustomization: 'basic',
    analyticsLevel: 'basic', apiAccess: false, webhooks: false
  },
  starter: {
    id: 'starter', name: 'Starter', price: 24,
    monthlyGenerations: 300, maxEmbeds: 1,
    watermarkRequired: false, themeCustomization: 'basic',
    analyticsLevel: 'basic', apiAccess: false, webhooks: false
  },
  growth: {
    id: 'growth', name: 'Growth', price: 49,
    monthlyGenerations: 600, maxEmbeds: 3,
    watermarkRequired: false, themeCustomization: 'custom',
    analyticsLevel: 'basic', apiAccess: false, webhooks: false
  },
  pro: {
    id: 'pro', name: 'Pro', price: 99,
    monthlyGenerations: 1500, maxEmbeds: 10,
    watermarkRequired: false, themeCustomization: 'custom',
    analyticsLevel: 'advanced', apiAccess: true, webhooks: true
  }
};

const kvClient = vercelKv || null;
// Detect REST config explicitly as well for environments where @vercel/kv is not provisioned
const REST_BASE = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
const USE_REST = Boolean(REST_BASE && REST_TOKEN);

const memoryEmbeds = {
  "demo-barber": { id: "demo-barber", name: "Barber Demo", vertical: "barber", theme: "light", width: "100%", height: "520px" },
  "demo-dental": { id: "demo-dental", name: "Dental Demo", vertical: "dental", theme: "light", width: "100%", height: "520px" },
  "demo-detailing": { id: "demo-detailing", name: "Auto Detailing Demo", vertical: "detailing", theme: "light", width: "100%", height: "520px" },
};
const memoryUsage = [];
const memoryClients = {};
const memoryClientEmbeds = {}; // clientId -> Set<embedId>
const memoryLoginTokens = new Map(); // loginToken -> { clientId, exp, used }

function isKvEnabled(){
  return Boolean(USE_REST || process.env.KV_URL || kvClient);
}

export function getStorageMode(){
  if (USE_REST) return 'kv-rest';
  return kvClient ? 'kv' : (isKvEnabled() ? 'kv-rest' : 'memory');
}

async function kvRest(commandUrl){
  const base = REST_BASE;
  const token = REST_TOKEN;
  if (!base || !token) return null;
  const resp = await fetch(`${base}${commandUrl}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!resp.ok) return null;
  return resp.json();
}

async function kvRestLpush(key, value){
  const encoded = encodeURIComponent(value);
  return kvRest(`/lpush/${encodeURIComponent(key)}/${encoded}`);
}

async function kvRestLrange(key, start, stop){
  const r = await kvRest(`/lrange/${encodeURIComponent(key)}/${start}/${stop}`);
  return Array.isArray(r?.result) ? r.result : [];
}

async function kvRestIncr(key, by){
  return kvRest(`/incrby/${encodeURIComponent(key)}/${by}`);
}

async function kvRestSetex(key, value, seconds){
  const encoded = encodeURIComponent(value);
  return kvRest(`/setex/${encodeURIComponent(key)}/${seconds}/${encoded}`);
}

async function kvRestGet(key){
  return kvRest(`/get/${encodeURIComponent(key)}`);
}

async function kvRestDel(key){
  return kvRest(`/del/${encodeURIComponent(key)}`);
}

function today(){
  const d = new Date();
  return d.toISOString().slice(0,10);
}

function currentMonth(){
  const d = new Date();
  return d.toISOString().slice(0,7); // YYYY-MM
}

export function buildSnippet(embedId, opts){
  const o = Object.assign({ theme:'light', variant:'compact', maxWidth:'640px', align:'center', radius:'14px', shadow:'true', border:'true', width:'100%', height:'460px' }, opts||{});
  const scriptUrl = (process.env.EMBED_SCRIPT_URL || 'https://before-after-embed.vercel.app/embed.js').trim();
  const attrs = Object.entries({
    'data-embed-id': embedId,
    'data-theme': o.theme,
    'data-variant': o.variant,
    'data-max-width': o.maxWidth,
    'data-align': o.align,
    'data-radius': o.radius,
    'data-shadow': o.shadow,
    'data-border': o.border,
    'data-width': o.width,
    'data-height': o.height,
  }).map(([k,v])=> `${k}="${v}"`).join(' ');
  return `<script async src="${scriptUrl}" ${attrs}></script>`;
}

export async function setEmbedConfig(config){
  const cfg = { ...config, id: config.id };
  if (!cfg.id) throw new Error("Embed id is required");
  if (isKvEnabled() && kvClient){
    await kvClient.set(`embeds:${cfg.id}`, cfg);
    await kvClient.sadd("embeds:index", cfg.id);
    if (cfg.clientId){ await kvClient.sadd(`clientEmbeds:${cfg.clientId}`, cfg.id); }
  }
  memoryEmbeds[cfg.id] = cfg;
  if (cfg.clientId){
    memoryClientEmbeds[cfg.clientId] = memoryClientEmbeds[cfg.clientId] || new Set();
    memoryClientEmbeds[cfg.clientId].add(cfg.id);
  }
  return cfg;
}

export async function getEmbedConfig(id){
  if (!id) return null;
  if (isKvEnabled() && kvClient){
    const cfg = await kvClient.get(`embeds:${id}`);
    if (cfg) return cfg;
  }
  return memoryEmbeds[id] || null;
}

// ===== Client settings, API key and webhook =====
export async function getClientSettings(clientId){
  const def = { displayName: clientId, brandColor: '#7c3aed', defaultTheme: 'dark', defaultVariant: 'card', poweredBy: 'false', webhookUrl: '' };
  if (!clientId) return def;
  if (isKvEnabled() && kvClient){
    const s = await kvClient.get(`clients:settings:${clientId}`);
    return { ...def, ...(s || {}) };
  }
  return def;
}

export async function updateClientSettings(clientId, patch){
  const current = await getClientSettings(clientId);
  const next = { ...current, ...(patch || {}) };
  if (isKvEnabled() && kvClient){ await kvClient.set(`clients:settings:${clientId}`, next); }
  return next;
}

export async function getClientApiKey(clientId){
  if (!clientId) return null;
  if (isKvEnabled() && kvClient){ return await kvClient.get(`clients:apiKey:${clientId}`); }
  return null;
}

export async function generateClientApiKey(clientId){
  const key = `${clientId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
  if (isKvEnabled() && kvClient){ await kvClient.set(`clients:apiKey:${clientId}`, key); }
  return key;
}

// ===== Plans and metering =====
export async function getClientPlan(clientId){
  const def = 'free';
  if (!clientId) return plans[def];
  if (isKvEnabled() && kvClient){
    const pid = await kvClient.get(`clients:plan:${clientId}`);
    return plans[pid] || plans[def];
  }
  return plans[def];
}

export async function setClientPlan(clientId, planId){
  if (!clientId) throw new Error('clientId required');
  const pid = (planId || '').toLowerCase();
  if (!plans[pid]) throw new Error('Unknown plan');
  if (isKvEnabled() && kvClient){ await kvClient.set(`clients:plan:${clientId}`, pid); }
  return plans[pid];
}

export async function getMonthlyUsageForClient(clientId){
  if (!clientId) return 0;
  const key = `meter:client:${currentMonth()}:${clientId}`;
  try{
    if (USE_REST){
      const r = await kvRest(`/get/${encodeURIComponent(key)}`);
      const v = (r && r.result) != null ? Number(r.result) : 0;
      return Number.isFinite(v) ? v : 0;
    }
    if (kvClient){
      const v = await kvClient.get(key);
      return Number(v || 0);
    }
  }catch{}
  return 0;
}

export async function incrMonthlyUsageForClient(clientId, by){
  if (!clientId) return 0;
  const key = `meter:client:${currentMonth()}:${clientId}`;
  try{
    if (USE_REST){
      const r = await kvRestIncr(key, by || 1);
      const v = (r && r.result) != null ? Number(r.result) : 0;
      return Number.isFinite(v) ? v : 0;
    }
    if (kvClient){
      const v = await kvClient.incrby(key, by || 1);
      return Number(v || 0);
    }
  }catch{}
  return 0;
}

// Bonus (top-ups) for the current month
export async function getMonthlyBonusForClient(clientId){
  if (!clientId) return 0;
  const key = `meterBonus:client:${currentMonth()}:${clientId}`;
  try{
    if (USE_REST){
      const r = await kvRest(`/get/${encodeURIComponent(key)}`);
      const v = (r && r.result) != null ? Number(r.result) : 0;
      return Number.isFinite(v) ? v : 0;
    }
    if (kvClient){
      const v = await kvClient.get(key);
      return Number(v || 0);
    }
  }catch{}
  return 0;
}

export async function incrMonthlyBonusForClient(clientId, by){
  if (!clientId) return 0;
  const key = `meterBonus:client:${currentMonth()}:${clientId}`;
  try{
    if (USE_REST){
      const r = await kvRestIncr(key, by || 0);
      const v = (r && r.result) != null ? Number(r.result) : 0;
      return Number.isFinite(v) ? v : 0;
    }
    if (kvClient){
      const v = await kvClient.incrby(key, by || 0);
      return Number(v || 0);
    }
  }catch{}
  return 0;
}

export async function deliverWebhook(clientId, payload){
  try{
    const s = await getClientSettings(clientId);
    const url = (s?.webhookUrl || '').trim();
    if (!url) return false;
    await fetch(url, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
    return true;
  }catch{ return false; }
}

export async function deleteEmbedConfig(id){
  if (!id) return false;
  const existing = await getEmbedConfig(id);
  if (!existing) return false;
  if (isKvEnabled() && kvClient){
    try{
      await kvClient.del(`embeds:${id}`);
      await kvClient.srem('embeds:index', id);
      if (existing.clientId){ await kvClient.srem(`clientEmbeds:${existing.clientId}`, id); }
    }catch(_e){}
  }
  try{ delete memoryEmbeds[id]; }catch{}
  if (existing?.clientId){
    const set = memoryClientEmbeds[existing.clientId];
    if (set) set.delete(id);
  }
  return true;
}

export async function listEmbeds(){
  if (isKvEnabled() && kvClient){
    const ids = await kvClient.smembers("embeds:index");
    const results = [];
    if (ids && ids.length){
      for (const id of ids){
        const cfg = await kvClient.get(`embeds:${id}`);
        if (cfg) results.push(cfg);
      }
      return results;
    }
    for (const cfg of Object.values(memoryEmbeds)){
      await kvClient.set(`embeds:${cfg.id}`, cfg);
      await kvClient.sadd("embeds:index", cfg.id);
    }
    return Object.values(memoryEmbeds);
  }
  return Object.values(memoryEmbeds);
}

export async function logUsage(event, embedId, meta){
  const record = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, ts: Date.now(), event, embedId, meta: meta || {} };
  if (isKvEnabled()){
    try {
      if (USE_REST){
        await kvRestLpush(`usage:${embedId || 'all'}`, JSON.stringify(record));
        await kvRestLpush('usage:all', JSON.stringify(record));
        if (event === 'edit_success') await kvRestIncr(`meter:${today()}:${embedId}`, 1);
      } else if (kvClient){
        await kvClient.lpush(`usage:${embedId || 'all'}`, JSON.stringify(record));
        await kvClient.lpush(`usage:all`, JSON.stringify(record));
        await kvClient.ltrim(`usage:${embedId || 'all'}`, 0, 999);
        await kvClient.ltrim(`usage:all`, 0, 1999);
        if (event === 'edit_success') await kvClient.incr(`meter:${today()}:${embedId}`);
      }
    } catch(_e){
      // Final fallback: REST
      try{ await kvRestLpush(`usage:${embedId || 'all'}`, JSON.stringify(record)); }catch{}
      try{ await kvRestLpush('usage:all', JSON.stringify(record)); }catch{}
      if (event === 'edit_success'){ try{ await kvRestIncr(`meter:${today()}:${embedId}`, 1); }catch{} }
    }
  } else {
    memoryUsage.unshift(record);
    if (memoryUsage.length > 2000) memoryUsage.length = 2000;
  }
  return record.id;
}

export async function listUsage(embedId, limit = 50){
  if (isKvEnabled()){
    try{
      if (USE_REST){
        const key = embedId ? `usage:${embedId}` : `usage:all`;
        const items = await kvRestLrange(key, 0, limit - 1);
        let parsed = (items || []).map((s)=>{ try{return JSON.parse(s);}catch{return null;}}).filter(Boolean);
        if ((!parsed.length) && embedId){
          const all = await kvRestLrange('usage:all', 0, limit - 1);
          parsed = (all || []).map((s)=>{ try{return JSON.parse(s);}catch{return null;}}).filter(Boolean).filter(r=> r && r.embedId === embedId).slice(0, limit);
        }
        return parsed;
      }
      if (kvClient){
        const key = embedId ? `usage:${embedId}` : `usage:all`;
        const items = await kvClient.lrange(key, 0, limit - 1);
        if (items && items.length) return items.map((s)=>{ try{return JSON.parse(s);}catch{return null;}}).filter(Boolean);
        // Fallback: read from global stream and filter by embedId if specific list is empty
        if (embedId){
          const all = await kvClient.lrange('usage:all', 0, limit - 1);
          if (all && all.length){
            return all.map((s)=>{ try{return JSON.parse(s);}catch{return null;}}).filter(Boolean).filter(r=> r && r.embedId === embedId).slice(0, limit);
          }
        }
      }
      const key = embedId ? `usage:${embedId}` : `usage:all`;
      const items = await kvRestLrange(key, 0, limit - 1);
      let parsed = (items || []).map((s)=>{ try{return JSON.parse(s);}catch{return null;}}).filter(Boolean);
      if ((!parsed.length) && embedId){
        const all = await kvRestLrange('usage:all', 0, limit - 1);
        parsed = (all || []).map((s)=>{ try{return JSON.parse(s);}catch{return null;}}).filter(Boolean).filter(r=> r && r.embedId === embedId).slice(0, limit);
      }
      return parsed;
    }catch(_e){
      return [];
    }
  }
  return memoryUsage.filter((u) => !embedId || u.embedId === embedId).slice(0, limit);
}

// ==== Client model helpers ====
export async function createClient(client){
  const now = Date.now();
  const token = client.token || `${now}-${Math.random().toString(36).slice(2)}`;
  const rec = { id: client.id, name: client.name || client.id, email: client.email || '', token, createdAt: now };
  if (!rec.id) throw new Error('client.id required');
  if (isKvEnabled() && kvClient){
    await kvClient.set(`clients:${rec.id}`, rec);
    await kvClient.sadd('clients:index', rec.id);
    await kvClient.set(`clients:token:${token}`, rec.id);
  }
  memoryClients[rec.id] = rec;
  return rec;
}

export async function listClients(){
  if (isKvEnabled() && kvClient){
    const ids = await kvClient.smembers('clients:index');
    const out = [];
    for (const id of ids || []){
      const c = await kvClient.get(`clients:${id}`);
      if (c) out.push(c);
    }
    return out;
  }
  return Object.values(memoryClients);
}

export async function getClientByEmail(email){
  if (!email) return null;
  const all = await listClients();
  const lower = email.toLowerCase();
  return all.find(c => (c.email || '').toLowerCase() === lower) || null;
}

export async function getClientById(id){
  if (!id) return null;
  if (isKvEnabled() && kvClient){
    const c = await kvClient.get(`clients:${id}`);
    if (c) return c;
  }
  return memoryClients[id] || null;
}

export async function getClientByToken(token){
  if (!token) return null;
  if (isKvEnabled() && kvClient){
    const id = await kvClient.get(`clients:token:${token}`);
    if (id){
      const c = await kvClient.get(`clients:${id}`);
      if (c) return c;
    }
  }
  for (const c of Object.values(memoryClients)) if (c.token === token) return c;
  return null;
}

// ===== One-time login tokens =====
export async function createLoginToken(clientId, ttlSeconds = 900){
  const t = `lt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`;
  const key = `clients:login:${t}`;
  try{
    if (USE_REST){ await kvRestSetex(key, clientId, ttlSeconds); return t; }
    if (kvClient){ await kvClient.set(key, clientId, { ex: ttlSeconds }); return t; }
  }catch{}
  memoryLoginTokens.set(t, { clientId, exp: Date.now() + ttlSeconds*1000, used: false });
  return t;
}

export async function consumeLoginToken(loginToken){
  if (!loginToken) return null;
  const key = `clients:login:${loginToken}`;
  // KV paths
  try{
    if (USE_REST){
      const r = await kvRestGet(key);
      const clientId = r && r.result ? String(r.result) : '';
      if (clientId){ try{ await kvRestDel(key); }catch{} return clientId; }
    } else if (kvClient){
      const clientId = await kvClient.get(key);
      if (clientId){ try{ await kvClient.del(key); }catch{} return String(clientId); }
    }
  }catch{}
  // Memory path
  const rec = memoryLoginTokens.get(loginToken);
  if (rec && !rec.used && Date.now() < rec.exp){ rec.used = true; return rec.clientId; }
  return null;
}

export async function assignEmbedToClient(clientId, embedId){
  const embed = await getEmbedConfig(embedId);
  const updated = { ...(embed || {}), id: embedId, clientId };
  await setEmbedConfig(updated);
  if (isKvEnabled() && kvClient){ await kvClient.sadd(`clientEmbeds:${clientId}`, embedId); }
  memoryClientEmbeds[clientId] = memoryClientEmbeds[clientId] || new Set();
  memoryClientEmbeds[clientId].add(embedId);
  return updated;
}

export async function listEmbedsForClient(clientId){
  if (isKvEnabled() && kvClient){
    const ids = await kvClient.smembers(`clientEmbeds:${clientId}`);
    const out = [];
    for (const id of ids || []){
      const e = await kvClient.get(`embeds:${id}`);
      if (e) out.push(e);
    }
    return out;
  }
  const set = memoryClientEmbeds[clientId];
  if (!set) return [];
  return Array.from(set).map((id)=> memoryEmbeds[id]).filter(Boolean);
}

// CORS utility functions
function parseAllowedOrigins(){
  const raw = (process.env.ALLOWED_ORIGINS || '*').toString().trim();
  if (!raw || raw === '*') return '*';
  return raw.split(',').map(s=> s.trim()).filter(Boolean);
}

function requestOrigin(req){
  const o = (req.headers?.origin || '').toString();
  if (o) return o;
  const ref = (req.headers?.referer || '').toString();
  try{ if (ref){ const u = new URL(ref); return `${u.protocol}//${u.host}`; } }catch{}
  return '';
}

export function setCorsHeaders(req, res) {
  const allow = parseAllowedOrigins();
  const origin = requestOrigin(req);
  const allowedOrigin = (allow === '*') ? '*' : (allow.includes(origin) ? origin : '');
  if (allowedOrigin) res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function handleCorsPreflight(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(req, res);
    const allow = parseAllowedOrigins();
    const origin = requestOrigin(req);
    if (allow !== '*' && !allow.includes(origin)){
      return res.status(403).end();
    }
    return res.status(200).end();
  }
  return false;
}

// Simple counters for rate limiting / metrics
const memoryCounters = new Map();
export async function bumpCounter(key, by){
  try{
    if (USE_REST){
      const r = await kvRestIncr(key, by || 1);
      const v = (r && r.result) != null ? Number(r.result) : 0;
      return Number.isFinite(v) ? v : 0;
    }
    if (kvClient){
      const v = await kvClient.incrby(key, by || 1);
      return Number(v || 0);
    }
  }catch{}
  const v = (memoryCounters.get(key) || 0) + (by || 1);
  memoryCounters.set(key, v);
  return v;
}

export { fal };
