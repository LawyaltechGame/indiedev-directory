# Newsletter System

Game Centralen's free newsletter. Subscribers receive **all** emails — no tiers, no paywalls.

## What Subscribers Get

1. **New Article Notifications** — automatic email each time a post is published on the GC WordPress blog
2. **Curated Newsletters** — manually sent roundups (e.g., "This Week's Game Dev Roundup")

## How It Works

### Subscription Flow

1. User enters name + email in the footer form or the popup modal
2. Frontend saves to **Appwrite** (primary store) + **Google Sheet** (backup)
3. Owner gets notified via FormSubmit.co

### Automatic Article Emails

1. Google Apps Script runs an **hourly trigger** (`checkAndNotify`)
2. Fetches the latest WordPress post via REST API
3. Compares with the last notified post ID
4. If new → reads all subscribers from Google Sheet → sends branded HTML email via **Brevo API**

### Curated Newsletter Emails

1. Admin runs `sendCuratedNewsletter(title, intro, articles[], footer)` in the Apps Script editor
2. Script reads all subscribers from Google Sheet
3. Sends a branded HTML roundup email to each subscriber via **Brevo API**

## Architecture

```
┌─────────────┐     ┌──────────────┐
│  Frontend   │────▶│   Appwrite   │
│  (React)    │     │  (primary)   │
└──────┬──────┘     └──────────────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐     ┌────────────┐
│ Google Sheet │◀───│  Apps Script  │────▶│   Brevo    │
│  (backup)    │    │  (triggers)   │     │  (emails)  │
└──────────────┘    └──────┬───────┘     └────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  WordPress   │
                    │  REST API    │
                    └──────────────┘
```

## Key Files

| File | Purpose |
|------|---------|
| `src/services/newsletter.ts` | Frontend subscription logic (Appwrite + Sheet + notify) |
| `google-apps-script/blog-notifier.gs` | Hourly WordPress check + curated newsletter + Brevo sending |

## Setup

### 1. Google Apps Script — Script Properties

In the Apps Script editor, run these **once** (edit the placeholder values first):

```
saveBrevoApiKey()    → stores your Brevo API key
setupProperties()    → stores Sheet ID + sender info
createHourlyTrigger() → creates the hourly trigger for checkAndNotify
```

| Property | How to get it |
|----------|---------------|
| `BREVO_API_KEY` | [app.brevo.com](https://app.brevo.com) → Settings → SMTP & API → API Keys |
| `SHEET_ID` | From your Google Sheet URL: `/spreadsheets/d/<SHEET_ID>/edit` |
| `SENDER_EMAIL` | A verified sender email in Brevo (e.g., `newsletter@gamecentralen.com`) |
| `SENDER_NAME` | Display name (e.g., `Game Centralen`) |

### 2. Frontend — `.env`

| Variable | Purpose |
|----------|---------|
| `VITE_APPWRITE_DATABASE_ID` | Appwrite database ID |
| `VITE_APPWRITE_NEWSLETTER_COLLECTION_ID` | Appwrite collection for subscribers |

## Testing

### Test automatic article notification
Run `testRun()` in the Apps Script editor — clears the last post ID and triggers `checkAndNotify()`.

### Test curated newsletter
Run `testCuratedNewsletter()` in the Apps Script editor — sends a sample roundup to all subscribers.

### Verify build
```bash
npm run build
```
