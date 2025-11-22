import { databases } from '../config/appwrite';
import { ID, Query } from 'appwrite';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID as string;
const REACTIONS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_REACTIONS_COLLECTION_ID as string;

export interface Reaction {
  $id?: string;
  postId: string;
  userId: string;
  type: 'like' | 'dislike';
  createdAt: string;
}

export interface ReactionCounts {
  likes: number;
  dislikes: number;
  userReaction: 'like' | 'dislike' | null;
}

/**
 * Get reaction counts for a post
 */
export async function getReactionCounts(postId: string, userId?: string): Promise<ReactionCounts> {
  try {
    if (!DB_ID || !REACTIONS_COLLECTION_ID) {
      console.warn('Reactions collection not configured');
      return { likes: 0, dislikes: 0, userReaction: null };
    }

    // Get all reactions for this post
    const response = await databases.listDocuments(DB_ID, REACTIONS_COLLECTION_ID, [
      Query.equal('postId', postId),
      Query.limit(1000),
    ]);

    const likes = response.documents.filter((doc) => doc.type === 'like').length;
    const dislikes = response.documents.filter((doc) => doc.type === 'dislike').length;

    let userReaction: 'like' | 'dislike' | null = null;
    if (userId) {
      const userDoc = response.documents.find((doc) => doc.userId === userId);
      if (userDoc) {
        userReaction = userDoc.type as 'like' | 'dislike';
      }
    }

    return { likes, dislikes, userReaction };
  } catch (error: any) {
    // If collection doesn't exist (404), return zeros silently
    if (error?.code === 404 || error?.type === 'collection_not_found') {
      console.warn('Reactions collection not found. Please create it in Appwrite.');
      return { likes: 0, dislikes: 0, userReaction: null };
    }
    console.error('Error getting reaction counts:', error);
    return { likes: 0, dislikes: 0, userReaction: null };
  }
}

/**
 * Add or update a reaction
 */
export async function addReaction(
  postId: string,
  userId: string,
  type: 'like' | 'dislike'
): Promise<void> {
  try {
    if (!DB_ID || !REACTIONS_COLLECTION_ID) {
      throw new Error('Reactions collection not configured. Please add VITE_APPWRITE_REACTIONS_COLLECTION_ID to your .env file.');
    }

    // Check if user already reacted
    const existing = await databases.listDocuments(DB_ID, REACTIONS_COLLECTION_ID, [
      Query.equal('postId', postId),
      Query.equal('userId', userId),
    ]);

    if (existing.documents.length > 0) {
      const existingDoc = existing.documents[0];
      
      // If same reaction, remove it (toggle off)
      if (existingDoc.type === type) {
        await databases.deleteDocument(DB_ID, REACTIONS_COLLECTION_ID, existingDoc.$id);
      } else {
        // Update to new reaction type
        await databases.updateDocument(DB_ID, REACTIONS_COLLECTION_ID, existingDoc.$id, {
          type,
        });
      }
    } else {
      // Create new reaction
      await databases.createDocument(DB_ID, REACTIONS_COLLECTION_ID, ID.unique(), {
        postId,
        userId,
        type,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    // If collection doesn't exist, show helpful error
    if (error?.code === 404 || error?.type === 'collection_not_found') {
      throw new Error('Reactions collection not found. Please create the "reactions" collection in Appwrite. See REACTIONS_SETUP.md for instructions.');
    }
    console.error('Error adding reaction:', error);
    throw error;
  }
}

/**
 * Remove a reaction
 */
export async function removeReaction(postId: string, userId: string): Promise<void> {
  try {
    if (!DB_ID || !REACTIONS_COLLECTION_ID) {
      throw new Error('Reactions collection not configured');
    }

    const existing = await databases.listDocuments(DB_ID, REACTIONS_COLLECTION_ID, [
      Query.equal('postId', postId),
      Query.equal('userId', userId),
    ]);

    if (existing.documents.length > 0) {
      await databases.deleteDocument(DB_ID, REACTIONS_COLLECTION_ID, existing.documents[0].$id);
    }
  } catch (error) {
    console.error('Error removing reaction:', error);
    throw error;
  }
}
