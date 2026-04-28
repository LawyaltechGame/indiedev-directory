// Google Apps Script endpoint — saves to Google Sheet
const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxD0ZCH-Y-vGBYPupsTa8_vdhRBwM_PjhC3d8m2VYD6QaVs6QcZvjA0gfls-JAEd9Cr8w/exec';

// Notification email via FormSubmit.co (no backend needed)
const NOTIFY_EMAIL = 'nandtlegaltech@gmail.com';

/**
 * Submits newsletter subscription:
 * 1. Saves name + email to Google Sheet
 * 2. Sends a notification email to the owner via FormSubmit.co
 */
export async function submitNewsletter(name: string, email: string) {
  // 1. Save to Google Sheet (fire and forget)
  fetch(`${SHEET_ENDPOINT}?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`, {
    method: 'GET',
    mode: 'no-cors',
  }).catch(() => {});

  // 2. Send notification email via FormSubmit.co
  const form = new FormData();
  form.append('name', name);
  form.append('email', email);
  form.append('subject', `📬 New Newsletter Subscriber: ${name}`);
  form.append('message', `Name: ${name}\nEmail: ${email}\nTime: ${new Date().toLocaleString()}`);
  form.append('_captcha', 'false');
  form.append('_template', 'table');

  const res = await fetch(`https://formsubmit.co/ajax/${NOTIFY_EMAIL}`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    throw new Error('Failed to send notification email');
  }

  return { success: true };
}
