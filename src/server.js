import express from "express";
import cors from "cors";
import multer from "multer";
import nodemailer from "nodemailer";
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
const feedbackSubmissions = [];
function logUsage(event, embedId, meta) {
  usageEvents.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    ts: Date.now(),
    event,
    embedId,
    meta: meta || {},
  });
}

function makeMailTransport() {
  const host = (process.env.SMTP_HOST || '').trim();
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();
  if (!host || !user || !pass) return null;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = (process.env.SMTP_SECURE || 'false').toString() === 'true';
  if ((host.includes('gmail.com') || user.endsWith('@gmail.com')) && pass) {
    return nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
  }
  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

async function notifyFeedback(entry) {
  const to = (process.env.FEEDBACK_NOTIFY_EMAIL || process.env.EMAIL_FROM || process.env.SMTP_USER || '').trim();
  const from = (process.env.EMAIL_FROM || process.env.SMTP_USER || to || 'no-reply@beforeafter.app').trim();
  const transport = makeMailTransport();
  if (!transport || !to) {
    return;
  }
  const subject = `[Feedback] ${entry.context || 'general'} – ${new Date(entry.ts).toLocaleString('en-US')}`;
  const lines = [
    `<p><strong>Context:</strong> ${entry.context}</p>`,
    `<p><strong>Message:</strong></p>`,
    `<p>${entry.message.replace(/\n/g, '<br/>')}</p>`,
  ];
  if (entry.contact) {
    lines.push(`<p><strong>Contact:</strong> ${entry.contact}</p>`);
  }
  lines.push('<p>Logged automatically from the landing feedback prompt.</p>');
  try {
    await transport.sendMail({ from, to, subject, html: lines.join('\n'), replyTo: entry.contact || undefined });
  } catch (err) {
    console.error('Feedback email failed', err?.message || err);
  }
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

    // Collect vertical-specific options from form fields (opt_*)
    const options = Object.fromEntries(
      Object.entries(req.body || {})
        .filter(([k]) => k && k.toString().startsWith('opt_'))
        .map(([k, v]) => [k.slice(4), (v?.toString() || '').trim().toLowerCase()])
    );

    if (!req.file) {
      return res.status(400).json({ error: "Missing image file under field 'image'" });
    }

    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    function optionPromptFor(v, opts){
      const vv = (v || '').toLowerCase();
      if (vv === 'barber'){
        const style = opts.style;
        if (style === 'fade') return 'High-contrast skin fade: sides and back tapered down to skin around ears and nape with a clean blend up into longer top; keep natural hairline, expose ears, and avoid altering beard or face.';
        if (style === 'buzz') return 'Buzz cut with even length across the scalp; neat edges and natural texture.';
        if (style === 'undercut') return 'Undercut: short sides and back with longer top; clean contrast between lengths.';
        if (style === 'pompadour') return 'Pompadour hairstyle with volume at the front, smooth sides, and polished finish.';
      }
      if (vv === 'dental'){
        const treatment = opts.treatment;
        if (treatment === 'whitening') return 'Избелване на зъбите до естествено, но по-светло ниво; запазете текстурата на емайла и реалистичния вид.';
        if (treatment === 'alignment') return 'Деликатно подравняване за по-равна усмивка без промяна на лицевата идентичност; запазете естествените контури.';
        if (treatment === 'veneers') return 'Фасети с естествен вид: подобрена форма и нюанс, без прекомерно избелване; поддържайте реалистичен блясък.';
      }
      if (vv === 'detailing'){
        const focus = opts.focus;
        if (focus === 'interior') return 'Focus on car interior: deep-clean upholstery, remove stains, crisp textures, subtle matte finish.';
        if (focus === 'exterior') return 'Focus on car exterior: glossy paint, remove swirls and minor scratches, sharp reflections.';
      }
      return '';
    }

    const effectivePrompt = [verticalPromptPresets[vertical] || null, optionPromptFor(vertical, options) || null, prompt || null]
      .filter(Boolean)
      .join(" ");

    if (!effectivePrompt) {
      return res.status(400).json({ error: "Missing prompt. Provide 'prompt' or choose a 'vertical'." });
    }

    // Use the edit endpoint; accepts data URLs via image_urls array.
    const result = await fal.subscribe("fal-ai/nano-banana/edit", {
      input: {
        prompt: effectivePrompt,
        image_urls: [base64Image],
        image_url: base64Image,
      },
      logs: false,
      timeout: 120000,
    });

    if (result?.error) {
      console.error("fal edit error", result.error);
      logUsage("edit_error", embedId, { reason: "fal_error", detail: result.error, prompt: effectivePrompt });
      return res.status(502).json({ error: "Image edit failed", detail: result.error });
    }

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

app.post("/api/feedback", (req, res) => {
  const { context, message, contact } = req.body || {};
  const body = (message || "").toString().trim();
  if (!body) {
    return res.status(400).json({ error: "message is required" });
  }
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    ts: Date.now(),
    context: (context || "general").toString(),
    message: body,
    contact: (contact || "").toString().trim(),
  };
  feedbackSubmissions.push(entry);
  console.log("Feedback received", entry);
  notifyFeedback(entry).catch(() => {});
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
