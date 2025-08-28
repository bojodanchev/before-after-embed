export { fal } from "@fal-ai/client";
import { fal } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_KEY || "" });

export const verticalPromptPresets = {
  barber: "Apply a modern, realistic men's fade haircut; maintain identity and face shape; natural lighting; high fidelity.",
  dental: "Whiten teeth naturally, improve alignment subtly without changing face identity; realistic results; no overexposure.",
  detailing: "Make the car paint glossy like just detailed, remove minor scratches and swirl marks; realistic reflections; do not change car model or color drastically.",
};

export const embedConfigs = {
  "demo-barber": { id: "demo-barber", name: "Barber Demo", vertical: "barber", theme: "light", width: "100%", height: "520px" },
  "demo-dental": { id: "demo-dental", name: "Dental Demo", vertical: "dental", theme: "light", width: "100%", height: "520px" },
  "demo-detailing": { id: "demo-detailing", name: "Auto Detailing Demo", vertical: "detailing", theme: "light", width: "100%", height: "520px" },
};

export const usageEvents = [];
export function logUsage(event, embedId, meta) {
  usageEvents.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, ts: Date.now(), event, embedId, meta: meta || {} });
}
