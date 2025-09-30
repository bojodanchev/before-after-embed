import formidable from "formidable";
import { fal, verticalPromptPresets, getEmbedConfig, logUsage, deliverWebhook, getClientPlan, getMonthlyUsageForClient, incrMonthlyUsageForClient, getClientSettings, handleCorsPreflight, setCorsHeaders, bumpCounter } from "./_shared.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res){
  // Handle CORS preflight
  if (handleCorsPreflight(req, res)) return;

  // Set CORS headers for all requests
  setCorsHeaders(req, res);

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed', received: req.method, expected: 'POST' });
  }

  try{
    console.log('Processing edit request...');
    // Allow larger smartphone photos (up to ~25MB)
    const form = formidable({ multiples: false, keepExtensions: false, maxFileSize: 25 * 1024 * 1024 });
    let parsed;
    try {
      parsed = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => err ? reject(err) : resolve({ fields, files }));
      });
    } catch (parseErr) {
      const message = (parseErr?.message || '').toLowerCase();
      const code = (parseErr?.code || '').toString();
      if (code === 'LIMIT_FILE_SIZE' || message.includes('max file size')) {
        return res.status(413).json({ error: 'Image too large. Please upload JPG/PNG/WEBP/HEIC under 25MB.' });
      }
      if (message.includes('greater than 0') || message.includes('empty')) {
        return res.status(400).json({ error: 'Uploaded image appears to be empty. Please re-upload the photo.' });
      }
      console.error('Form parse error', parseErr);
      return res.status(400).json({ error: 'Unable to read the uploaded image. Please try again.' });
    }

    const { fields, files } = parsed;
    
    // Parsed field/file keys available for debugging; avoid verbose logs in production
    // console.debug('Parsed fields:', Object.keys(fields));
    // console.debug('Parsed files:', Object.keys(files));

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

    // Basic file type validation
    const allowed = ['image/jpeg','image/png','image/webp','image/heic','image/heif'];
    const mime = (file.mimetype || '').toLowerCase();
    if (!allowed.includes(mime)){
      return res.status(415).json({ error: 'Unsupported media type. Please upload JPG, PNG, WEBP, or HEIC images.' });
    }

    // Lightweight rate limiting per IP + embed (per minute window via rolling key)
    try{
      const ip = ((req.headers['x-forwarded-for'] || '') + '').split(',')[0].trim() || 'unknown';
      const now = new Date();
      const minute = now.toISOString().slice(0,16).replace(':',''); // YYYY-MM-DDTHHMM
      const rlKey = `rl:edit:${embedId}:${ip}:${minute}`;
      const limit = Number(process.env.RATE_LIMIT_PER_MINUTE || 30);
      const count = await bumpCounter(rlKey, 1);
      if (Number.isFinite(limit) && count > limit){
        try{ await logUsage('rate_limited', embedId, { ip }); }catch{}
        return res.status(429).json({ error: 'Too many requests. Please slow down.' });
      }
    }catch(_e){}

    const buffer = await fsReadFile(file.filepath);
    const maxBytes = 12 * 1024 * 1024; // 12MB guard for upstream service
    if (buffer.length > maxBytes) {
      return res.status(413).json({ error: 'Image too large. Please upload JPG/PNG/WEBP/HEIC under 12MB.' });
    }
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
        if (treatment === 'whitening') return 'Избелване на зъбите до естествено, но по-светло ниво; запазете текстурата на емайла и реалистичния вид.';
        if (treatment === 'alignment') return 'Деликатно подравняване за по-равна усмивка без промяна на лицевата идентичност; запазете естествените контури.';
        if (treatment === 'veneers') return 'Фасети с естествен вид: подобрена форма и нюанс, без прекомерно избелване; поддържайте реалистичен блясък.';
      }
      if (v === 'detailing'){
        const focus = opts.focus;
        if (focus === 'interior') return 'Operate ONLY on the car interior visible in the photo: deep-clean upholstery and plastics, remove dust and stains, revive leather with a subtle satin finish, sharpen console details; DO NOT alter exterior body, car model, or colors; ensure a clearly visible, realistic improvement.';
        if (focus === 'exterior') return 'Operate ONLY on the car exterior body: clean road grime, increase paint gloss, reduce light swirl marks and water spots, strengthen natural reflections; DO NOT change car model, wheel design, badges, or paint color; ensure a clearly visible, realistic improvement.';
        if (focus === 'wheels') return 'Operate ONLY on wheels and tires: remove brake dust and dirt, brighten and clarify rims WITHOUT changing the design, add natural tire dressing shine, keep sidewall texture realistic; DO NOT change wheel model/size or car paint; ensure a clearly visible, realistic improvement.';
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
        image_url: base64Image,
      },
      logs: false,
      timeout: 120000,
    });

    if (result?.error) {
      console.error('fal edit error', result.error);
      await logUsage('edit_error', embedId, { reason: 'fal_error', detail: result.error, prompt: effectivePrompt, clientId: embedClientId });
      return res.status(502).json({ error: 'Image edit failed', detail: result.error });
    }

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
    // optional webhook (deliver to clientId, not embedId)
    try { if (embedClientId) { await deliverWebhook(embedClientId, { type:'render', embedId, outputUrl, ts: Date.now(), vertical: chosenVertical, treatment: options?.treatment }); } } catch {}

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
    console.error('Error details:', {
      message: err?.message,
      stack: err?.stack,
      name: err?.name
    });
    const fallbackEmbedId = 'anonymous';
    try { await logUsage('edit_error', fallbackEmbedId, { reason: 'exception', message: err?.message || '' }); } catch {}
    res.status(500).json({ error: 'Edit failed', details: err?.message, detail: err?.response?.body || err?.body });
  }
}

async function fsReadFile(path){
  const { readFile } = await import('fs/promises');
  return readFile(path);
}
