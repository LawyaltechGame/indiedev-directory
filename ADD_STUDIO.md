# How to Add Studios Manually (Admin)

This guide explains how to add studio profiles manually without using the form submission process.

## Overview

- **User-submitted studios**: Go through the form → Review Dashboard → Approval process
- **Admin-added studios**: Added directly by the team, automatically approved, marked as `createdByTeam: true`

## Method 1: Using Browser Console (Quick)

1. Open your website in the browser
2. Open Developer Console (F12 or Cmd+Option+I)
3. Run this command:

```javascript
// Import the function (if using ES modules)
import { addAvalancheStudios } from './src/services/adminStudios';

// Add Avalanche Studios
addAvalancheStudios().then(result => {
  console.log(result);
});
```

Or if that doesn't work, you can access it via the window object (if exposed) or use the function directly in the code.

## Method 2: Add via Code (Recommended)

1. Open `src/services/adminStudios.ts`
2. Use the `addAdminStudio()` function with your studio data
3. Call it from anywhere in your app (e.g., a one-time script or admin page)

Example:

```typescript
import { addAdminStudio } from './services/adminStudios';

// Add a new studio
const result = await addAdminStudio({
  name: 'Studio Name',
  tagline: 'Studio Tagline',
  description: 'Studio description...',
  website: 'https://example.com',
  genre: 'Action',
  platform: 'PC, Console',
  teamSize: '50-100',
  location: 'City, Country',
  // ... add other fields as needed
});

console.log(result); // { success: true, id: '...', message: 'Studio added successfully' }
```

## Method 3: Pre-configured Studios

For Avalanche Studios, you can use the pre-configured function:

```typescript
import { addAvalancheStudios } from './services/adminStudios';

await addAvalancheStudios();
```

## Important Notes

- Admin-added studios are **automatically approved** (`status: 'approved'`)
- They are marked as **team-created** (`createdByTeam: true`)
- They appear immediately in the directory
- They bypass the review process
- If a studio with the same name already exists, it won't be duplicated

## Studio Data Structure

All fields are optional except:
- `name` (required)
- `tagline` (required)
- `description` (required)
- `website` (required)
- `genre` (required)
- `platform` (required)
- `teamSize` (required)
- `location` (required)

See `src/services/adminStudios.ts` for the full interface definition.

