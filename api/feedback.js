import nodemailer from 'nodemailer';

function makeTransport() {
  const host = (process.env.SMTP_HOST || '').trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();
  if (!host || !user || !pass) return null;
  const secure = (process.env.SMTP_SECURE || 'false').toString() === 'true';
  if ((host.includes('gmail.com') || user.endsWith('@gmail.com')) && pass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }
  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

function buildEmail(entry) {
  const lines = [
    `<p><strong>Context:</strong> ${entry.context}</p>`,
    `<p><strong>Message:</strong></p>`,
    `<p>${entry.message.replace(/\n/g, '<br/>')}</p>`,
  ];
  if (entry.contact) {
    lines.push(`<p><strong>Contact:</strong> ${entry.contact}</p>`);
  }
  lines.push('<p>Logged automatically from the landing feedback prompt.</p>');
  return lines.join('\n');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, contact, context } = req.body || {};
    const body = (message || '').toString().trim();
    if (!body) {
      return res.status(400).json({ error: 'message is required' });
    }

    const entry = {
      context: (context || 'general').toString(),
      message: body,
      contact: (contact || '').toString().trim() || undefined,
      ts: Date.now(),
    };

    console.log('feedback submission', entry);

    const transport = makeTransport();
    if (!transport) {
      console.error('feedback transport unavailable');
      return res.status(500).json({ error: 'Email transport unavailable' });
    }

    const to = (process.env.FEEDBACK_NOTIFY_EMAIL || process.env.EMAIL_FROM || process.env.SMTP_USER || 'bojodanchev@gmail.com').toString().trim();
    const from = (process.env.EMAIL_FROM || process.env.SMTP_USER || to || 'no-reply@beforeafter.app').toString().trim();
    const subject = `[Feedback] ${entry.context} – ${new Date(entry.ts).toLocaleString('en-US')}`;

    await transport.sendMail({
      from,
      to,
      subject,
      replyTo: entry.contact || undefined,
      html: buildEmail(entry),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('feedback handler error', err);
    return res.status(500).json({ error: 'Feedback failed', detail: err?.message || String(err) });
  }
}
