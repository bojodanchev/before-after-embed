import { fal } from "@fal-ai/client";
import { kv as vercelKv } from "@vercel/kv";

fal.config({ credentials: process.env.FAL_KEY || "" });

export const verticalPromptPresets = {
  barber: "Apply a modern, realistic men's fade haircut; maintain identity and face shape; natural lighting; high fidelity.",
  dental: "Whiten teeth naturally, improve alignment subtly without changing face identity; realistic results; no overexposure.",
  detailing: "Make the car paint glossy like just detailed, remove minor scratches and swirl marks; realistic reflections; do not change car model or color drastically.",
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

function today(){
  const d = new Date();
  return d.toISOString().slice(0,10);
}

export function buildSnippet(embedId, opts){
  const o = Object.assign({ theme:'light', variant:'compact', maxWidth:'640px', align:'center', radius:'14px', shadow:'true', border:'true', width:'100%', height:'460px' }, opts||{});
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
  return `<script async src="https://before-after-embed.vercel.app/embed.js" ${attrs}></script>`;
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

export { fal };
