// Google Apps Script Web App endpoint — hardcoded
const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbywt1tqLIxaPZO961oX7bgFK_cXqqIxNzn2v6jByBJXrrHaw5qd-rUXkKFToGWHTL9vQA/exec';

/**
 * Submits newsletter subscription data to Google Sheet
 * via Google Apps Script Web App.
 * The Apps Script also sends an owner notification email via MailApp.
 */
export async function submitNewsletter(name: string, email: string) {
  console.log('📤 Sending newsletter subscription to:', SHEET_ENDPOINT);
  console.log('📤 Payload:', { name, email });

  const formData = new URLSearchParams();
  formData.append('name', name);
  formData.append('email', email);

  try {
    await fetch(SHEET_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      body: formData,
    });
    console.log('✅ Newsletter request sent');
    return { success: true };
  } catch (err) {
    console.error('❌ Newsletter fetch failed:', err);
    throw err;
  }
}
