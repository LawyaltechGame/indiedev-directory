import { databases, ID, Query } from '../config/appwrite';

// Google Apps Script endpoint — saves to Google Sheet
const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxD0ZCH-Y-vGBYPupsTa8_vdhRBwM_PjhC3d8m2VYD6QaVs6QcZvjA0gfls-JAEd9Cr8w/exec';

// Notification email via FormSubmit.co (no backend needed)
const NOTIFY_EMAIL = 'nandtlegaltech@gmail.com';

// Appwrite configuration
const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID as string;
const NEWSLETTER_COLLECTION_ID = import.meta.env.VITE_APPWRITE_NEWSLETTER_COLLECTION_ID as string;

export interface NewsletterSubscriber {
  $id?: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Submits a free newsletter subscription.
 * Subscribers receive all emails: new article notifications and curated roundups.
 *
 * 1. Saves name + email to Appwrite (primary store)
 * 2. Also saves to Google Sheet (backup)
 * 3. Sends a notification email to the owner
 */
export async function submitNewsletter(
  name: string,
  email: string
): Promise<{ success: boolean; subscriber?: NewsletterSubscriber }> {
  try {
    // Check if already subscribed
    if (DB_ID && NEWSLETTER_COLLECTION_ID) {
      try {
        const existing = await databases.listDocuments(DB_ID, NEWSLETTER_COLLECTION_ID, [
          Query.equal('email', email),
        ]);

        if (existing.documents.length > 0) {
          // Re-activate existing subscription
          const doc = existing.documents[0] as any;
          const updated = await databases.updateDocument(
            DB_ID,
            NEWSLETTER_COLLECTION_ID,
            doc.$id,
            {
              isActive: true,
              updatedAt: new Date().toISOString(),
            }
          );
          
          // Still save to Sheet and notify
          saveToSheetAndNotify(name, email);
          
          return { success: true, subscriber: updated as NewsletterSubscriber };
        }
      } catch (e) {
        console.warn('Error checking existing subscriber:', e);
      }

      // Create new subscription in Appwrite
      try {
        const subscriber = await databases.createDocument(
          DB_ID,
          NEWSLETTER_COLLECTION_ID,
          ID.unique(),
          {
            email,
            name,
            isActive: true,
            createdAt: new Date().toISOString(),
          }
        );

        // Save to Sheet and notify
        saveToSheetAndNotify(name, email);

        return { success: true, subscriber: subscriber as NewsletterSubscriber };
      } catch (e) {
        console.error('Error creating Appwrite subscriber:', e);
        // Fall back to Sheet and notify only
        saveToSheetAndNotify(name, email);
        return { success: true };
      }
    }

    // Fallback if Appwrite not configured
    saveToSheetAndNotify(name, email);
    return { success: true };
  } catch (error) {
    console.error('Newsletter submission error:', error);
    throw error;
  }
}

/**
 * Helper function to save to Google Sheet and notify owner
 */
function saveToSheetAndNotify(name: string, email: string): void {
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

  fetch(`https://formsubmit.co/ajax/${NOTIFY_EMAIL}`, {
    method: 'POST',
    body: form,
  }).catch(() => {});
}

/**
 * Get all active newsletter subscribers.
 */
export async function getSubscribers(): Promise<NewsletterSubscriber[]> {
  if (!DB_ID || !NEWSLETTER_COLLECTION_ID) {
    return [];
  }

  try {
    const result = await databases.listDocuments(DB_ID, NEWSLETTER_COLLECTION_ID, [
      Query.equal('isActive', true),
    ]);

    return result.documents as NewsletterSubscriber[];
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return [];
  }
}

/**
 * Unsubscribe a user from newsletters
 */
export async function unsubscribeNewsletter(email: string): Promise<boolean> {
  if (!DB_ID || !NEWSLETTER_COLLECTION_ID) {
    return false;
  }

  try {
    const existing = await databases.listDocuments(DB_ID, NEWSLETTER_COLLECTION_ID, [
      Query.equal('email', email),
    ]);

    if (existing.documents.length > 0) {
      const doc = existing.documents[0] as any;
      await databases.updateDocument(
        DB_ID,
        NEWSLETTER_COLLECTION_ID,
        doc.$id,
        { isActive: false, updatedAt: new Date().toISOString() }
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return false;
  }
}
