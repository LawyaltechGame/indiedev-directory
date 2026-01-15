# Game Logos Setup Guide

## Professional Approach: Appwrite Storage

The **best professional option** for game logos is to store them in **Appwrite Storage** (same bucket as studio logos). This provides:
- ✅ Centralized asset management
- ✅ Automatic compression and optimization
- ✅ CDN delivery
- ✅ Consistent with studio logo handling
- ✅ Easy updates without code changes

## Setup Options

### Option 1: Manual Upload (Recommended for Initial Setup)

1. **Upload logos to Appwrite Storage:**
   - Go to Appwrite Console → Storage → Studio Images bucket
   - Upload:
     - `Just Cause 3 Profilephoto.png` → Note the file ID
     - `Madmax Profilephoto.png` → Note the file ID

2. **Update game initialization:**
   ```typescript
   import { initializeGames } from './utils/addGames';
   
   await initializeGames({
     justCause3: 'your_file_id_here',
     madMax: 'your_file_id_here'
   });
   ```

### Option 2: Automated Upload Script

1. **Place logos in public folder:**
   ```
   public/
     game-logos/
       just-cause-3-logo.png
       mad-max-logo.png
   ```

2. **Run upload script in browser console:**
   ```javascript
   window.uploadGameLogos()
   ```

3. **Copy the file IDs** from console output and use them in Option 1

### Option 3: Direct File Upload via Code

If you have the file IDs already:

```typescript
import { addJustCause3, addMadMax } from './services/adminGames';

// Add games with logo IDs
await addJustCause3('file_id_from_appwrite');
await addMadMax('file_id_from_appwrite');
```

## Current Implementation

The system will:
1. Try to find logos in `public/game-logos/` folder
2. Automatically compress and upload to Appwrite Storage
3. Store the file ID in the game's `gameData` JSON
4. Display logos using `getStudioImageUrl()` function

## Logo Requirements

- **Format:** PNG (recommended) or JPG
- **Size:** Will be automatically compressed to max 800px width
- **Quality:** 85% compression for optimal file size
- **Naming:** Use URL-friendly names (lowercase, hyphens)

## Updating Logos

To update a game logo:
1. Upload new logo to Appwrite Storage
2. Get the new file ID
3. Update the game document's `gameData.logoImageId` in Appwrite Console
   OR
4. Re-run the game initialization with new file IDs

## Best Practice

**For production:** Upload logos manually to Appwrite Storage and store file IDs in your code or environment variables. This ensures:
- Logos are always available
- No dependency on public folder structure
- Easy to update without code changes
- Better performance (CDN delivery)

