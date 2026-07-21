import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

function escapeHtml(input: string) {
  return String(input || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function firstNameFromName(name: string): string {
  const n = String(name || '').trim();
  if (!n) return 'there';
  return n.split(/\s+/)[0] || 'there';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow only POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple shared secret guard — Apps Script passes this header
  const secret = req.headers['x-notify-secret'];
  if (secret !== process.env.NOTIFY_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!apiKey || !from) {
    return res.status(500).json({ error: 'Missing RESEND_API_KEY or RESEND_FROM' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const email = String(body?.email || '').trim();
    const name = String(body?.name || '').trim();
    const postTitle = String(body?.postTitle || '').trim();
    const postExcerpt = String(body?.postExcerpt || '').trim();
    const postUrl = String(body?.postUrl || '').trim();
    const postImage = String(body?.postImage || '').trim();

    if (!email || !postTitle || !postUrl) {
      return res.status(400).json({ error: 'Missing required fields: email, postTitle, postUrl' });
    }

    const firstName = firstNameFromName(name);
    const safeFirstName = escapeHtml(firstName);
    const safeTitle = escapeHtml(postTitle);
    const safeExcerpt = escapeHtml(postExcerpt);
    const safeUrl = escapeHtml(postUrl);
    const safeImage = escapeHtml(postImage);

    const subject = `New Post on Game Centralen: ${postTitle}`;

    const text = [
      `Hi ${firstName},`,
      ``,
      `A new post has just been published on Game Centralen.`,
      ``,
      `"${postTitle}"`,
      ``,
      postExcerpt ? `${postExcerpt}` : '',
      ``,
      `Read it here: ${postUrl}`,
      ``,
      `──────────────────────────`,
      `You're receiving this because you subscribed to Game Centralen updates.`,
      `To unsubscribe, reply to this email with "unsubscribe" in the subject line.`,
      ``,
      `Best,`,
      `The Game Centralen Team`,
      `www.gamecentralen.com`,
    ].join('\n');

    const html = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width:600px; margin:0 auto; background:#0b1120; color:#e2e8f0; border-radius:16px; overflow:hidden;">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#0e7490,#0f172a); padding:32px 32px 24px; text-align:center;">
          <p style="margin:0 0 4px; font-size:12px; letter-spacing:2px; text-transform:uppercase; color:#67e8f9; font-weight:600;">Game Centralen</p>
          <h1 style="margin:0; font-size:22px; font-weight:800; color:#fff; line-height:1.3;">New Post Published</h1>
        </div>

        <!-- Featured Image -->
        ${safeImage ? `<img src="${safeImage}" alt="${safeTitle}" style="width:100%; height:220px; object-fit:cover; display:block;" />` : ''}

        <!-- Body -->
        <div style="padding:28px 32px;">
          <p style="margin:0 0 16px; color:#94a3b8; font-size:14px;">Hi ${safeFirstName},</p>
          <p style="margin:0 0 20px; color:#cbd5e1; font-size:15px;">A new post has just been published on <strong style="color:#22d3ee;">Game Centralen</strong>:</p>

          <!-- Post card -->
          <div style="background:#111827; border:1px solid rgba(34,211,238,0.15); border-radius:12px; padding:20px 24px; margin-bottom:24px;">
            <h2 style="margin:0 0 10px; font-size:18px; font-weight:700; color:#f1f5f9; line-height:1.4;">${safeTitle}</h2>
            ${safeExcerpt ? `<p style="margin:0; font-size:14px; color:#94a3b8; line-height:1.6;">${safeExcerpt}</p>` : ''}
          </div>

          <!-- CTA Button -->
          <div style="text-align:center; margin-bottom:28px;">
            <a href="${safeUrl}"
               style="display:inline-block; padding:13px 28px; background:#22d3ee; color:#001018; text-decoration:none; border-radius:10px; font-weight:800; font-size:15px;">
              Read the Post →
            </a>
          </div>

          <hr style="border:none; border-top:1px solid rgba(255,255,255,0.08); margin:0 0 20px;" />
          <p style="margin:0; font-size:12px; color:#475569; text-align:center; line-height:1.7;">
            You're receiving this because you subscribed to Game Centralen updates.<br/>
            To unsubscribe, reply with "unsubscribe" in the subject line.
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#060d1a; padding:16px 32px; text-align:center;">
          <a href="https://www.gamecentralen.com" style="font-size:13px; color:#0ea5b7; text-decoration:none; font-weight:600;">www.gamecentralen.com</a>
        </div>
      </div>
    `.trim();

    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from,
      to: email,
      subject,
      text,
      html,
    });

    return res.status(200).json({ ok: true, id: (result as any)?.data?.id || null });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to send email' });
  }
}
