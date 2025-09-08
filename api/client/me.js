import { getClientByToken, getClientByEmail, createClient } from "../_shared.js";
import nodemailer from 'nodemailer';

function extractToken(req){
  const auth = (req.headers.authorization || '').toString();
  const bearer = auth.replace(/^Bearer\s+/i, '').trim();
  const fromQuery = (req.query?.token || '').toString().trim();
  return bearer || fromQuery;
}

export default async function handler(req, res){
  if (req.method === 'POST'){
    const email = (req.body?.email || '').toString().trim();
    if (!email) return res.status(400).json({ error: 'email required' });
    let client = await getClientByEmail(email);
    if (!client){
      // Stable id derived from email (prefix + short hash)
      const prefix = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$|--+/g,'');
      let hash = 0; for (let i=0;i<email.length;i++){ hash = ((hash<<5)-hash + email.charCodeAt(i)) | 0; }
      const suffix = Math.abs(hash).toString(36).slice(0,4);
      const cid = `${prefix}-${suffix}`;
      client = await createClient({ id: cid, name: cid, email });
    }
    const origin = req.headers['x-forwarded-proto'] && req.headers['x-forwarded-host']
      ? `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}`
      : '';
    const link = `${origin}/client.html?token=${encodeURIComponent(client.token)}`;
    try{
      const transport = makeTransport();
      if (transport){
        const from = process.env.EMAIL_FROM || 'no-reply@before-after-embed.com';
        const subject = 'Your Before/After Client Portal Link';
        const html = `<p>Click the link to sign in:</p><p><a href="${link}">${link}</a></p><p>If you didn't request this, you can ignore this email.</p>`;
        await transport.sendMail({ from, to: email, subject, html });
      } else {
        console.log('[client/me] SMTP not configured; magic link:', link);
      }
    }catch(e){ console.error('Email send failed:', e?.message || e); }
    return res.status(200).json({ ok: true });
  }
  const token = extractToken(req);
  const client = await getClientByToken(token);
  if (!client) return res.status(401).json({ error: 'Unauthorized' });
  res.status(200).json({ client });
}

function makeTransport(){
  const host = (process.env.SMTP_HOST || '').trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();
  if (!host || !user || !pass) return null;
  const secure = (process.env.SMTP_SECURE || 'false').toString() === 'true';
  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}
