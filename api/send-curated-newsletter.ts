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

interface NewsletterArticle {
  title: string;
  excerpt: string;
  url: string;
  image?: string;
}

interface CuratedNewsletterPayload {
  title: string; // e.g., "This Week's Game Dev Roundup"
  introduction: string; // introductory text
  articles: NewsletterArticle[]; // array of articles to feature
  footerMessage?: string; // optional custom footer message
  emails?: string[]; // specific emails to send to (if not provided, sends to all curated subscribers)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow only POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple shared secret guard
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

    const title = String(body?.title || '').trim();
    const introduction = String(body?.introduction || '').trim();
    const articles = Array.isArray(body?.articles) ? body.articles : [];
    const emails = Array.isArray(body?.emails) ? body.emails : [];
    const footerMessage = String(body?.footerMessage || '').trim();

    if (!title || !introduction || articles.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields: title, introduction, articles (non-empty array)',
      });
    }

    if (articles.length === 0 || !Array.isArray(articles)) {
      return res.status(400).json({
        error: 'articles must be a non-empty array with objects containing: title, excerpt, url',
      });
    }

    // Validate each article
    for (const article of articles) {
      if (!article.title || !article.excerpt || !article.url) {
        return res.status(400).json({
          error: 'Each article must have: title, excerpt, url',
        });
      }
    }

    const safeTitle = escapeHtml(title);
    const safeIntro = escapeHtml(introduction);
    const safeFooter = footerMessage ? escapeHtml(footerMessage) : '';

    const subject = title;

    // Build article cards for email
    const articleCards = articles
      .map(
        (article: any) => `
      <div style="background:#111827; border:1px solid rgba(34,211,238,0.15); border-radius:12px; padding:20px 24px; margin-bottom:16px;">
        ${article.image ? `<img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.title)}" style="width:100%; height:180px; object-fit:cover; border-radius:8px; margin-bottom:12px; display:block;" />` : ''}
        <h3 style="margin:0 0 8px; font-size:16px; font-weight:700; color:#f1f5f9; line-height:1.4;">
          <a href="${escapeHtml(article.url)}" style="color:#22d3ee; text-decoration:none;">
            ${escapeHtml(article.title)}
          </a>
        </h3>
        <p style="margin:0; font-size:13px; color:#94a3b8; line-height:1.6;">${escapeHtml(article.excerpt)}</p>
      </div>
    `
      )
      .join('');

    const text = [
      `Hi there,`,
      ``,
      title,
      ``,
      introduction,
      ``,
      articles.map((a: any) => `• ${a.title}: ${a.url}`).join('\n'),
      ``,
      footerMessage ? footerMessage : '',
      ``,
      `──────────────────────────`,
      `You're receiving this because you subscribed to Game Centralen curated newsletters.`,
      `To unsubscribe, reply to this email with "unsubscribe" in the subject line.`,
      ``,
      `Best,`,
      `The Game Centralen Team`,
      `www.gamecentralen.com`,
    ]
      .filter((line) => line !== '')
      .join('\n');

    const html = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width:600px; margin:0 auto; background:#0b1120; color:#e2e8f0; border-radius:16px; overflow:hidden;">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#0e7490,#0f172a); padding:32px 32px 24px; text-align:center;">
          <p style="margin:0 0 4px; font-size:12px; letter-spacing:2px; text-transform:uppercase; color:#67e8f9; font-weight:600;">Game Centralen</p>
          <h1 style="margin:0; font-size:22px; font-weight:800; color:#fff; line-height:1.3;">Weekly Roundup</h1>
        </div>

        <!-- Body -->
        <div style="padding:28px 32px;">
          <p style="margin:0 0 8px; color:#94a3b8; font-size:14px;">Hi there,</p>
          
          <div style="margin:20px 0;">
            <h2 style="margin:0 0 16px; font-size:20px; font-weight:700; color:#22d3ee;">${safeTitle}</h2>
            <p style="margin:0 0 24px; color:#cbd5e1; font-size:15px; line-height:1.6;">${safeIntro}</p>
          </div>

          <!-- Article Cards -->
          <div style="margin-bottom:24px;">
            ${articleCards}
          </div>

          ${safeFooter ? `<p style="margin:0 0 24px; color:#cbd5e1; font-size:14px; line-height:1.6; padding:16px; background:rgba(34,211,238,0.08); border-left:3px solid #22d3ee; border-radius:4px;">${safeFooter}</p>` : ''}

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

    // Send to specific emails if provided, otherwise we'd need to fetch from database
    if (emails && emails.length > 0) {
      let successCount = 0;
      let failCount = 0;
      const errors: string[] = [];

      for (const email of emails) {
        try {
          const result = await resend.emails.send({
            from,
            to: email,
            subject,
            text,
            html,
          });

          if ((result as any)?.data?.id) {
            successCount++;
          } else {
            failCount++;
            errors.push(`${email}: No response ID`);
          }
        } catch (err: any) {
          failCount++;
          errors.push(`${email}: ${err?.message || 'Unknown error'}`);
        }
      }

      return res.status(200).json({
        ok: true,
        successCount,
        failCount,
        errors: errors.length > 0 ? errors : undefined,
      });
    }

    // If no specific emails provided, return a warning
    return res.status(400).json({
      error: 'No emails provided. Pass emails array in request body or call from Google Apps Script that fetches subscribers.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to send newsletter' });
  }
}
