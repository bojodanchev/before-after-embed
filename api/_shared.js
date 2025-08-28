import { fal } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_KEY || "" });

export const verticalPromptPresets = {
  barber: "Apply a modern, realistic men's fade haircut; maintain identity and face shape; natural lighting; high fidelity.",
  dental: "Whiten teeth naturally, improve alignment subtly without changing face identity; realistic results; no overexposure.",
  detailing: "Make the car paint glossy like just detailed, remove minor scratches and swirl marks; realistic reflections; do not change car model or color drastically.",
};

// ----- Storage layer: Vercel KV if available, otherwise in-memory fallback -----
let kvClient = null;
try {
  // Lazy import to avoid errors if not installed in some environments
  const mod = await import("@vercel/kv");
  kvClient = mod.kv;
} catch (_err) {
  kvClient = null;
}

const memoryEmbeds = {
  "demo-barber": { id: "demo-barber", name: "Barber Demo", vertical: "barber", theme: "light", width: "100%", height: "520px" },
  "demo-dental": { id: "demo-dental", name: "Dental Demo", vertical: "dental", theme: "light", width: "100%", height: "520px" },
  "demo-detailing": { id: "demo-detailing", name: "Auto Detailing Demo", vertical: "detailing", theme: "light", width: "100%", height: "520px" },
};
const memoryUsage = [];

function isKvEnabled(){
  return Boolean(kvClient && (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL));
}

export async function setEmbedConfig(config){
  const cfg = { ...config, id: config.id };
  if (!cfg.id) throw new Error("Embed id is required");
  if (isKvEnabled()){
    await kvClient.set(`embeds:${cfg.id}`, cfg);
    await kvClient.sadd("embeds:index", cfg.id);
  } else {
    memoryEmbeds[cfg.id] = cfg;
  }
  return cfg;
}

export async function getEmbedConfig(id){
  if (!id) return null;
  if (isKvEnabled()){
    const cfg = await kvClient.get(`embeds:${id}`);
    return cfg || null;
  }
  return memoryEmbeds[id] || null;
}

export async function listEmbeds(){
  if (isKvEnabled()){
    const ids = await kvClient.smembers("embeds:index");
    const results = [];
    for (const id of ids || []){
      const cfg = await kvClient.get(`embeds:${id}`);
      if (cfg) results.push(cfg);
    }
    return results;
  }
  return Object.values(memoryEmbeds);
}

export async function logUsage(event, embedId, meta){
  const record = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, ts: Date.now(), event, embedId, meta: meta || {} };
  if (isKvEnabled()){
    await kvClient.lpush(`usage:${embedId || 'all'}`, JSON.stringify(record));
    await kvClient.ltrim(`usage:${embedId || 'all'}`, 0, 999); // retain last 1000
  } else {
    memoryUsage.unshift(record);
    if (memoryUsage.length > 1000) memoryUsage.length = 1000;
  }
  return record.id;
}

export async function listUsage(embedId, limit = 50){
  const key = `usage:${embedId || 'all'}`;
  if (isKvEnabled()){
    const items = await kvClient.lrange(key, 0, limit - 1);
    return (items || []).map((s) => {
      try { return JSON.parse(s); } catch { return null; }
    }).filter(Boolean);
  }
  return memoryUsage.filter((u) => !embedId || u.embedId === embedId).slice(0, limit);
}

export { fal };
