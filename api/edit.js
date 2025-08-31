import formidable from "formidable";
import { fal, verticalPromptPresets, getEmbedConfig, logUsage, deliverWebhook, getClientPlan, getMonthlyUsageForClient, incrMonthlyUsageForClient, getClientSettings } from "./_shared.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try{
    const form = formidable({ multiples: false, keepExtensions: false, maxFileSize: 10 * 1024 * 1024 });
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => err ? reject(err) : resolve({ fields, files }));
    });

    let embedId = (fields.embedId?.toString() || '').trim();
    if (!embedId) embedId = 'anonymous';
    let embedConfig = await getEmbedConfig(embedId);

    const promptField = (fields.prompt?.toString() || '').trim();
    const verticalField = (fields.vertical?.toString() || '').trim().toLowerCase();
    const optionEntries = Object.keys(fields)
      .filter(k => k.startsWith('opt_'))
      .map(k => [k.slice(4), (fields[k]?.toString() || '').trim().toLowerCase()]);
    const options = Object.fromEntries(optionEntries);

    const fileObj = files.image;
    const file = Array.isArray(fileObj) ? fileObj[0] : fileObj;
    if (!file) return res.status(400).json({ error: "Missing image file under field 'image'" });

    const buffer = await fsReadFile(file.filepath);
    const mime = file.mimetype || 'image/png';
    const base64Image = `data:${mime};base64,${buffer.toString('base64')}`;

    const chosenVertical = verticalField || embedConfig?.vertical || 'barber';
    const embedClientId = embedConfig?.clientId || '';

    // Enforce monthly generation quota if embed belongs to a client
    let plan = null;
    let monthlyUsed = 0;
    let monthlyLimit = Infinity;
    if (embedClientId){
      try{
        plan = await getClientPlan(embedClientId);
        monthlyLimit = Number(plan?.monthlyGenerations || Infinity);
        monthlyUsed = await getMonthlyUsageForClient(embedClientId);
        if (Number.isFinite(monthlyLimit) && monthlyUsed >= monthlyLimit){
          await logUsage('edit_quota_exceeded', embedId, { clientId: embedClientId, plan: plan?.id || 'unknown', monthlyUsed, monthlyLimit });
          return res.status(402).json({ error: 'Generation limit reached for current plan. Upgrade to continue.' });
        }
      }catch{}
    }

    function optionPromptFor(vertical, opts){
      const v = (vertical || '').toLowerCase();
      if (v === 'barber'){
        const style = opts.style;
        if (style === 'fade') return 'High-contrast skin fade: sides and back tapered down to skin around ears and nape with a clean blend up into longer top; keep natural hairline, expose ears, and avoid altering beard or face.';
        if (style === 'buzz') return 'Buzz cut with even length across the scalp; neat edges and natural texture.';
        if (style === 'undercut') return 'Undercut: short sides and back with longer top; clean contrast between lengths.';
        if (style === 'pompadour') return 'Pompadour hairstyle with volume at the front, smooth sides, and polished finish.';
      }
      if (v === 'dental'){
        const treatment = opts.treatment;
        if (treatment === 'whitening') return 'Whiten teeth naturally to a brighter but realistic shade; preserve enamel texture.';
        if (treatment === 'alignment') return 'Subtly align teeth for a straighter smile without altering facial identity.';
        if (treatment === 'veneers') return 'Simulate natural-looking veneers with improved shape and shade; avoid over-whitening.';
      }
      if (v === 'detailing'){
        const focus = opts.focus;
        if (focus === 'interior') return 'Focus on car interior: deep-clean upholstery, remove stains, crisp textures, subtle matte finish.';
        if (focus === 'exterior') return 'Focus on car exterior: glossy paint, remove swirls and minor scratches, sharp reflections.';
      }
      return '';
    }

    const effectivePrompt = [
      verticalPromptPresets[chosenVertical] || null,
      optionPromptFor(chosenVertical, options) || null,
      promptField || null,
    ].filter(Boolean).join(' ');

    if (!effectivePrompt) return res.status(400).json({ error: "Missing prompt. Provide 'prompt' or choose a 'vertical'." });

    // log start
    await logUsage('edit_start', embedId, { vertical: chosenVertical, hasPrompt: Boolean(promptField) });

    const result = await fal.subscribe("fal-ai/nano-banana/edit", {
      input: {
        prompt: effectivePrompt,
        image_urls: [base64Image],
      },
      logs: false,
      timeout: 120000,
    });

    const { data } = result || {};
    if (!data){
      await logUsage('edit_error', embedId, { reason: 'no_data', prompt: effectivePrompt });
      return res.status(502).json({ error: 'No data from model' });
    }

    let outputUrl = null;
    if (typeof data === 'string') {
      outputUrl = data;
    } else if (Array.isArray(data?.images) && data.images[0]?.url) {
      outputUrl = data.images[0].url;
    } else if (data?.image?.url) {
      outputUrl = data.image.url;
    } else if (data?.url) {
      outputUrl = data.url;
    }

    await logUsage('edit_success', embedId, { prompt: effectivePrompt, hasOutputUrl: Boolean(outputUrl), options, clientId: embedClientId, plan: plan?.id || undefined });
    // Increment client monthly usage after success
    if (embedClientId && outputUrl){
      try{ await incrMonthlyUsageForClient(embedClientId, 1); }catch{}
    }
    // Also log a client_render to drive analytics without requiring a separate endpoint
    try { await logUsage('client_render', embedId, { from: 'server_after_success' }); } catch {}
    // optional webhook
    try { await deliverWebhook(embedId, { type:'render', embedId, outputUrl, ts: Date.now() }); } catch {}

    // Watermark: required by plan or opted-in via settings (poweredBy)
    let watermark = false;
    try{
      const s = embedClientId ? await getClientSettings(embedClientId) : null;
      const poweredBy = (s?.poweredBy || 'false').toString() === 'true';
      watermark = Boolean((plan && plan.watermarkRequired) || poweredBy);
    }catch{}

    res.status(200).json({ outputUrl, prompt: effectivePrompt, watermark });
  }catch(err){
    console.error('/api/edit error', err);
    const fallbackEmbedId = 'anonymous';
    try { await logUsage('edit_error', fallbackEmbedId, { reason: 'exception', message: err?.message || '' }); } catch {}
    res.status(500).json({ error: 'Edit failed' });
  }
}

async function fsReadFile(path){
  const { readFile } = await import('fs/promises');
  return readFile(path);
}
