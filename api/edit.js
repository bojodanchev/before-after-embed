import formidable from "formidable";
import { fal, verticalPromptPresets, getEmbedConfig, logUsage } from "./_shared.js";

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

    const fileObj = files.image;
    const file = Array.isArray(fileObj) ? fileObj[0] : fileObj;
    if (!file) return res.status(400).json({ error: "Missing image file under field 'image'" });

    const buffer = await fsReadFile(file.filepath);
    const mime = file.mimetype || 'image/png';
    const base64Image = `data:${mime};base64,${buffer.toString('base64')}`;

    const chosenVertical = verticalField || embedConfig?.vertical || 'barber';
    const effectivePrompt = [verticalPromptPresets[chosenVertical] || null, promptField || null]
      .filter(Boolean)
      .join(' ');

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

    await logUsage('edit_success', embedId, { prompt: effectivePrompt, hasOutputUrl: Boolean(outputUrl) });

    res.status(200).json({ outputUrl, prompt: effectivePrompt });
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
