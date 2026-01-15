# Adding Games to Appwrite Database

This guide explains how to set up the games database in Appwrite and add game details.

## Appwrite Database Setup

### 1. Create Games Collection

1. Go to your Appwrite Console → Databases → Your Database
2. Create a new collection called `games` (or use the ID you'll set in `.env`)
3. Set the collection ID and note it down

### 2. Add Collection Attributes

Add the following attributes to the `games` collection:

| Attribute Name | Type | Size | Required | Array |
|---------------|------|------|----------|-------|
| `userId` | string | 255 | Yes | No |
| `status` | string | 20 | Yes | No |
| `createdByTeam` | boolean | - | Yes | No |
| `createdAt` | string | 255 | Yes | No |
| `gameData` | string | 10000 | Yes | No |

**Note:** All game details (name, description, features, etc.) are stored in the `gameData` JSON string column to keep within Appwrite's free tier column limits.

### 3. Set Collection Permissions

**IMPORTANT:** Set these permissions to allow admin functions to create games:

- **Read**: `Any` (so anyone can view games)
- **Create**: `Any` ⚠️ (Required for admin functions to work - same as studios collection)
- **Update**: `Any` (or `Team` if you want only admins to update)
- **Delete**: `Team` (only admins can delete)

**Note:** The `Create: Any` permission is necessary because admin functions create games automatically without user authentication. This matches how the studios collection is configured.

### 4. Environment Variables

Add to your `.env` file:

```env
VITE_APPWRITE_GAMES_TABLE_ID=your_games_collection_id_here
```

## Adding Games

### Automatic (On App Load)

Games are automatically initialized when the app loads. The system will:
1. Try to upload game logos from common paths
2. Add "Just Cause 3" and "Mad Max" to the database
3. If games already exist, it will skip adding them

### Manual (Browser Console)

You can also manually trigger game initialization:

```javascript
// In browser console
window.addGames()
```

### Manual (Code)

```typescript
import { addJustCause3, addMadMax } from './services/adminGames';

// Add individual games
await addJustCause3();
await addMadMax();
```

## Game Logo Images

The game logos need to be accessible from the browser. You have two options:

### Option 1: Place in Public Folder (Recommended)

1. Copy the game logo images to your `public` folder:
   - `public/Just Cause 3 Profilephoto.png`
   - `public/Madmax Profilephoto.png`

2. The system will automatically find and upload them

### Option 2: Manual Upload

1. Upload the logos to Appwrite Storage (Studio Images bucket)
2. Note the file IDs
3. Update the games manually in Appwrite console with the `logoImageId` in the `gameData` JSON

## Game Detail Pages

Game detail pages are accessible at:
- `/game/just-cause-3`
- `/game/mad-max`

The system automatically converts game names to URL-friendly slugs.

## Game Data Structure

Each game's `gameData` JSON contains:

```json
{
  "name": "Just Cause 3",
  "developedBy": "Avalanche Studios",
  "publisher": "Square Enix",
  "status": "Released",
  "releaseDate": "December 1st, 2015",
  "platforms": ["PC", "Playstation", "Xbox"],
  "engine": "Apex Engine",
  "genre": "Action/Adventure/Open World",
  "monetization": "Paid Game + Optional DLC",
  "description": "...",
  "keyFeatures": [
    {
      "feature": "Destruction Mechanics",
      "description": "..."
    }
  ],
  "recognitions": [
    {
      "type": "Review",
      "title": "...",
      "source": "https://..."
    }
  ],
  "logoImageId": "file_id_from_appwrite_storage"
}
```

## Linking Games from Studio Profiles

In the Projects Portfolio section of studio detail pages, game titles are now clickable and will navigate to the game detail page.

