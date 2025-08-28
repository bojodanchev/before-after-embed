import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { fal } from "@fal-ai/client";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configure CORS
const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || "*";
const allowAll = allowedOriginsEnv === "*";
const allowedOrigins = allowAll ? [] : allowedOriginsEnv.split(",").map((s) => s.trim());

app.use(
  cors({
    origin: allowAll
      ? true
      : function (origin, callback) {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
    credentials: false,
  })
);

app.use(express.json({ limit: "15mb" }));

// Static hosting for widget/demo
app.use(express.static("public"));

// Multer for image uploads (memory storage to forward to API)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Configure Fal client
fal.config({ credentials: process.env.FAL_KEY || "" });

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// In-memory embed configurations (MVP)
// In production, replace with a database.
const embedConfigs = {
  "demo-barber": {
    id: "demo-barber",
    name: "Barber Demo",
    vertical: "barber",
    theme: "light",
    width: "100%",
    height: "520px",
  },
  "demo-dental": {
    id: "demo-dental",
    name: "Dental Demo",
    vertical: "dental",
    theme: "light",
    width: "100%",
    height: "520px",
  },
  "demo-detailing": {
    id: "demo-detailing",
    name: "Auto Detailing Demo",
    vertical: "detailing",
    theme: "light",
    width: "100%",
    height: "520px",
  },
};

// Simple in-memory usage log (MVP)
const usageEvents = [];
function logUsage(event, embedId, meta) {
  usageEvents.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    ts: Date.now(),
    event,
    embedId,
    meta: meta || {},
  });
}

// Public endpoint to fetch embed configuration
app.get("/api/embed/:id", (req, res) => {
  const id = req.params.id;
  const cfg = embedConfigs[id];
  if (!cfg) return res.status(404).json({ error: "Embed not found" });
  // Expose public fields only
  const { width, height, theme, vertical, id: cfgId, name } = cfg;
  res.json({ id: cfgId, name, vertical, theme, width, height });
});

// Map simple vertical presets to prompts
const verticalPromptPresets = {
  barber: "Apply a modern, realistic men's fade haircut; maintain identity and face shape; natural lighting; high fidelity.",
  dental: "Whiten teeth naturally, improve alignment subtly without changing face identity; realistic results; no overexposure.",
  detailing: "Make the car paint glossy like just detailed, remove minor scratches and swirl marks; realistic reflections; do not change car model or color drastically.",
};

app.post("/api/edit", upload.single("image"), async (req, res) => {
  try {
    const prompt = req.body.prompt?.toString().trim() || "";
    const embedId = req.body.embedId?.toString().trim() || "";

    if (!embedId) {
      return res.status(400).json({ error: "Missing embedId" });
    }

    const embedConfig = embedConfigs[embedId];
    if (!embedConfig) {
      return res.status(404).json({ error: "Unknown embedId" });
    }

    const vertical = (req.body.vertical?.toString().trim().toLowerCase() || embedConfig.vertical || "");

    if (!req.file) {
      return res.status(400).json({ error: "Missing image file under field 'image'" });
    }

    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const effectivePrompt = [verticalPromptPresets[vertical] || null, prompt || null]
      .filter(Boolean)
      .join(" ");

    if (!effectivePrompt) {
      return res.status(400).json({ error: "Missing prompt. Provide 'prompt' or choose a 'vertical'." });
    }

    // Use the correct edit endpoint; accepts image_urls (can be data URLs)
    const result = await fal.subscribe("fal-ai/nano-banana/edit", {
      input: {
        prompt: effectivePrompt,
        image_urls: [base64Image],
      },
      logs: false,
      timeout: 120000,
    });

    const { data } = result || {};
    if (!data) {
      logUsage("edit_error", embedId, { reason: "no_data", prompt: effectivePrompt });
      return res.status(502).json({ error: "No data from model" });
    }

    let outputUrl = null;
    if (typeof data === "string") {
      outputUrl = data;
    } else if (Array.isArray(data?.images) && data.images[0]?.url) {
      outputUrl = data.images[0].url;
    } else if (data?.image?.url) {
      outputUrl = data.image.url;
    } else if (data?.url) {
      outputUrl = data.url;
    }

    logUsage("edit_success", embedId, { prompt: effectivePrompt, hasOutputUrl: Boolean(outputUrl) });

    res.json({
      outputUrl,
      prompt: effectivePrompt,
    });
  } catch (err) {
    console.error("/api/edit error", err);
    const embedId = req.body?.embedId?.toString().trim() || "";
    if (embedId) {
      logUsage("edit_error", embedId, { reason: "exception", message: err?.message || "" });
    }
    res.status(500).json({ error: "Edit failed" });
  }
});

// Optional endpoint to receive client-side usage events
app.post("/api/usage", (req, res) => {
  const { embedId, event, meta } = req.body || {};
  if (!embedId || !event) return res.status(400).json({ error: "embedId and event are required" });
  logUsage(event, embedId, meta || {});
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});


