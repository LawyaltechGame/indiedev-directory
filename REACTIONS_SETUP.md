# Like/Dislike Reactions Setup Guide

## Overview

The like/dislike feature has been fully implemented for blog and news posts. Users must be authenticated to react to posts.

## Features

✅ **Like and Dislike buttons** on all post detail pages
✅ **Authentication required** - prompts users to login if not authenticated
✅ **Real-time counts** - shows number of likes and dislikes
✅ **Visual feedback** - active state when user has reacted
✅ **Toggle functionality** - click again to remove your reaction
✅ **Switch reactions** - click opposite button to change your reaction

## Appwrite Database Setup

You need to create a collection in Appwrite to store reactions.

### Step 1: Create Collection

1. Go to your Appwrite Console
2. Navigate to your database: `6901b1e30025389894cb`
3. Click "Add Collection"
4. Name it: `reactions`
5. Collection ID: `reactions` (or use auto-generated)

### Step 2: Add Attributes

Add these attributes to the collection:

| Attribute Name | Type   | Size | Required | Array |
|---------------|--------|------|----------|-------|
| postId        | String | 255  | Yes      | No    |
| userId        | String | 255  | Yes      | No    |
| type          | String | 20   | Yes      | No    |
| createdAt     | String | 255  | Yes      | No    |

### Step 3: Set Permissions

Set collection permissions:
- **Create**: Any authenticated user
- **Read**: Any (so counts can be displayed to everyone)
- **Update**: Document owner only
- **Delete**: Document owner only

Or use these permission rules:
```
Create: role:member
Read: any
Update: user:[USER_ID]
Delete: user:[USER_ID]
```

### Step 4: Create Indexes

Create these indexes for better performance:

1. **Index by postId**
   - Key: `postId_idx`
   - Type: Key
   - Attributes: `postId` (ASC)

2. **Index by userId**
   - Key: `userId_idx`
   - Type: Key
   - Attributes: `userId` (ASC)

3. **Compound index for user reactions**
   - Key: `user_post_idx`
   - Type: Unique
   - Attributes: `postId` (ASC), `userId` (ASC)

### Step 5: Update Environment Variable

The `.env` file has been updated with:
```
VITE_APPWRITE_REACTIONS_COLLECTION_ID=reactions
```

If you used a different collection ID, update this value.

## How It Works

### User Flow

1. **Unauthenticated User**:
   - Sees like/dislike buttons with counts
   - Clicking either button shows login modal
   - After login, can react to posts

2. **Authenticated User**:
   - Can click like or dislike
   - Button highlights when active
   - Click again to remove reaction
   - Click opposite button to switch reaction

### Technical Implementation

**Components**:
- `ReactionButtons.tsx` - Reusable component for like/dislike UI
- `reactions.ts` - Service for Appwrite database operations

**Data Structure**:
```typescript
{
  postId: "17130",        // WordPress post ID
  userId: "user123",      // Appwrite user ID
  type: "like",           // "like" or "dislike"
  createdAt: "2025-11-22T..."
}
```

**Features**:
- One reaction per user per post (enforced by unique index)
- Toggle: Click same button to remove
- Switch: Click opposite button to change
- Real-time counts update after each action

## Styling

The buttons have different states:

**Default State**:
- Dark background with border
- Cyan text
- Hover effect

**Active State (User Reacted)**:
- Like: Cyan glow with border
- Dislike: Red glow with border
- Highlighted appearance

**Disabled State**:
- Reduced opacity
- No pointer cursor
- Shown during API calls

## Location

Reactions appear at the bottom of each post detail page, after the author profile section:

```
┌─────────────────────────────┐
│ Post Content                │
│                             │
│ Author Profile              │
├─────────────────────────────┤
│ Was this helpful?           │
│ Let us know what you think  │
│                             │
│ [👍 12]  [👎 3]            │
└─────────────────────────────┘
```

## Testing

1. **Without Login**:
   - Visit any blog/news post
   - Click like/dislike
   - Should see login modal

2. **With Login**:
   - Login to your account
   - Visit a post
   - Click like - should highlight
   - Click like again - should remove
   - Click dislike - should switch
   - Refresh page - state should persist

3. **Multiple Users**:
   - Login with different accounts
   - Each user can have their own reaction
   - Counts update independently

## Troubleshooting

### Buttons not working
- Check Appwrite collection is created
- Verify collection ID in `.env`
- Check browser console for errors
- Ensure user is authenticated

### Counts not updating
- Check Appwrite permissions
- Verify indexes are created
- Check network tab for API errors

### Login modal not showing
- Verify `onAuthRequired` callback is working
- Check AuthContext is properly set up

## Future Enhancements

Possible additions:
- Reaction analytics dashboard
- Most liked/disliked posts
- Reaction notifications
- Emoji reactions (beyond like/dislike)
- Reaction history for users
- Export reaction data

## Files Modified

- `src/services/reactions.ts` - New service
- `src/components/ui/ReactionButtons.tsx` - New component
- `src/components/sections/ContentPostDetail.tsx` - Added reactions
- `src/components/sections/BlogPostDetail.tsx` - Added reactions
- `src/components/sections/NewsPostDetail.tsx` - Added reactions
- `.env` - Added REACTIONS_COLLECTION_ID

## Complete!

The like/dislike feature is now fully functional. Just create the Appwrite collection and you're ready to go!
