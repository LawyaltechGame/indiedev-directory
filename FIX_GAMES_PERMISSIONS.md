# Fix Games Collection Permissions

## Issue
You're getting `401 (Unauthorized)` errors when trying to add games because the `games` collection has restrictive permissions.

## Quick Fix

1. **Go to Appwrite Console:**
   - Navigate to: Databases → Your Database → `games` collection
   - Click on the **"Settings"** tab

2. **Update Permissions:**
   - Find the **"Permissions"** section
   - Set **Create** permission to: **`Any`** (not `Users` or `Team`)
   - Set **Update** permission to: **`Any`** (not `Users` or `Team`)
   - This allows admin functions to create and update games without user authentication

3. **Save Changes**

## Why This is Needed

The admin functions (`addJustCause3`, `addMadMax`) create games automatically when the app loads. They don't require a logged-in user, so they need `Create: Any` permission, just like the `profiles` collection.

## After Fixing Permissions

1. Refresh your browser
2. Games should initialize automatically
3. Or run `window.addGames()` in the console to manually trigger

## Verify It Works

After updating permissions, check the browser console. You should see:
- `✅ 2 game(s) added/updated successfully!`
- No more `401 Unauthorized` errors

