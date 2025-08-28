import { fal } from "@fal-ai/client";
import { kv as vercelKv } from "@vercel/kv";

fal.config({ credentials: process.env.FAL_KEY || "" });

export const verticalPromptPresets = {
  barber: "Apply a modern, realistic men's fade haircut; maintain identity and face shape; natural lighting; high fidelity.",
  dental: "Whiten teeth naturally, improve alignment subtly without changing face identity; realistic results; no overexposure.",
  detailing: "Make the car paint glossy like just detailed, remove minor scratches and swirl marks; realistic reflections; do not change car model or color drastically.",
};

const kvClient = vercelKv || null;

const memoryEmbeds = {
  "demo-barber": { id: "demo-barber", name: "Barber Demo", vertical: "barber", theme: "light", width: "100%", height: "520px" },
  "demo-dental": { id: "demo-dental", name: "Dental Demo", vertical: "dental", theme: "light", width: "100%", height: "520px" },
  "demo-detailing": { id: "demo-detailing", name: "Auto Detailing Demo", vertical: "detailing", theme: "light", width: "100%", height: "520px" },
};
const memoryUsage = [];

function isKvEnabled(){
  return Boolean((process.env.KV_REST_API_URL || process.env.KV_URL || process.env.UPSTASH_REDIS_REST_URL));
}

export function getStorageMode(){
  return (isKvEnabled() && kvClient) ? 'kv' : 'memory';
}

export async function setEmbedConfig(config){
  const cfg = { ...config, id: config.id };
  if (!cfg.id) throw new Error("Embed id is required");
  if (isKvEnabled() && kvClient){
    await kvClient.set(`embeds:${cfg.id}`, cfg);
    await kvClient.sadd("embeds:index", cfg.id);
  }
  memoryEmbeds[cfg.id] = cfg;
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
  if (isKvEnabled() && kvClient){
    await kvClient.lpush(`usage:${embedId || 'all'}`, JSON.stringify(record));
    await kvClient.lpush(`usage:all`, JSON.stringify(record));
    await kvClient.ltrim(`usage:${embedId || 'all'}`, 0, 999);
    await kvClient.ltrim(`usage:all`, 0, 1999);
  } else {
    memoryUsage.unshift(record);
    if (memoryUsage.length > 2000) memoryUsage.length = 2000;
  }
  return record.id;
}

export async function listUsage(embedId, limit = 50){
  if (isKvEnabled() && kvClient){
    const key = embedId ? `usage:${embedId}` : `usage:all`;
    const items = await kvClient.lrange(key, 0, limit - 1);
    return (items || []).map((s) => {
      try { return JSON.parse(s); } catch { return null; }
    }).filter(Boolean);
  }
  return memoryUsage.filter((u) => !embedId || u.embedId === embedId).slice(0, limit);
}

export { fal };
