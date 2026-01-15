# Initialize Games - Quick Fix

The games need to be added to the Appwrite database before they can be accessed. Here's how to do it:

## Option 1: Browser Console (Quickest)

1. Open your browser's developer console (F12 or right-click → Inspect → Console)
2. Run this command:
   ```javascript
   window.addGames()
   ```
3. Check the console output - you should see messages like:
   - `✅ 2 game(s) added/updated successfully!`
   - Or `ℹ️ All games already exist`

## Option 2: Refresh the Page

The games should initialize automatically on page load. If they don't appear:
1. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
2. Check the console for initialization messages

## Option 3: Check Database Configuration

Make sure your `.env` file has:
```env
VITE_APPWRITE_GAMES_TABLE_ID=games
```

And that the `games` collection exists in Appwrite with the correct attributes (see `ADD_GAMES.md`).

## Verify Games Were Added

After initialization, you can verify by:
1. Going to Appwrite Console → Databases → games collection
2. You should see "Just Cause 3" and "Mad Max" entries
3. Each should have a `gameData` JSON field with all the game information

## Troubleshooting

If games still don't appear:
1. Check browser console for errors
2. Verify the `games` collection exists in Appwrite
3. Check collection permissions (Read: Any, Create: Users/Team)
4. Verify the collection ID matches your `.env` file

