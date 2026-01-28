import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

function firstNameFromName(name: string): string {
  const n = String(name || '').trim();
  if (!n) return 'there';
  return n.split(/\s+/)[0] || 'there';
}

function escapeHtml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const replyTo = process.env.RESEND_REPLY_TO;

  if (!apiKey || !from) {
    return res.status(500).json({ error: 'Missing RESEND_API_KEY or RESEND_FROM' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const email = String(body?.email || '').trim();
    const name = String(body?.name || '').trim();
    const createProfileLink = String(body?.createProfileLink || '').trim();

    if (!email || !createProfileLink) {
      return res.status(400).json({ error: 'Missing email or createProfileLink' });
    }

    const firstName = firstNameFromName(name);
    const subject = 'Welcome to Game Centralen — Create your profile';

    const text = [
      `Hi ${firstName},`,
      ``,
      `Welcome to Game Centralen`,
      ``,
      `Your email has been successfully verified, and you’re all set to take the next step.`,
      ``,
      `Create your profile to showcase your studio, projects, and games on Game Centralen.`,
      ``,
      `Click the link below to get started to Create Your Profile:`,
      createProfileLink,
      ``,
      `Your profile will be reviewed by our team before it goes live. Once approved, it will be visible to publishers, partners, and the whole community on Game Centralen`,
      ``,
      `If you have any questions or need help, feel free to reply to this email—we’ll be happy to help.`,
      `Looking forward to seeing your work!`,
      ``,
      `Best,`,
      `The Game Centralen Team`,
      `www.gamecentralen.com`,
    ].join('\n');

    const safeFirstName = escapeHtml(firstName);
    const safeLink = escapeHtml(createProfileLink);

    const html = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.5; color:#0b1020;">
        <p>Hi ${safeFirstName},</p>
        <p><strong>Welcome to Game Centralen</strong></p>
        <p>Your email has been successfully verified, and you’re all set to take the next step.</p>
        <p>Create your profile to showcase your studio, projects, and games on Game Centralen.</p>
        <p style="margin:18px 0;">
          <a href="${safeLink}"
             style="display:inline-block; padding:12px 16px; background:#22d3ee; color:#001018; text-decoration:none; border-radius:10px; font-weight:800;">
            Create Your Profile
          </a>
        </p>
        <p style="color:#223; opacity:0.9;">Your profile will be reviewed by our team before it goes live. Once approved, it will be visible to publishers, partners, and the whole community on Game Centralen.</p>
        <p>If you have any questions or need help, feel free to reply to this email—we’ll be happy to help.<br/>Looking forward to seeing your work!</p>
        <p style="margin-top:18px;">Best,<br/>The Game Centralen Team<br/><a href="https://www.gamecentralen.com" style="color:#0ea5b7; text-decoration:none;">www.gamecentralen.com</a></p>
      </div>
    `.trim();

    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from,
      to: email,
      subject,
      text,
      html,
      ...(replyTo ? { replyTo } : {}),
    });

    return res.status(200).json({ ok: true, id: (result as any)?.data?.id || null });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to send email' });
  }
}

