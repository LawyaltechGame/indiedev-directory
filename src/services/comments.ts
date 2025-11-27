import { databases } from '../config/appwrite';
import { ID, Query } from 'appwrite';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID as string;
const COMMENTS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID as string;

export interface Comment {
  $id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  parentId?: string; // For nested replies
}

/**
 * Get all comments for a post
 */
export async function getComments(postId: string): Promise<Comment[]> {
  try {
    if (!DB_ID || !COMMENTS_COLLECTION_ID) {
      console.warn('Comments collection not configured');
      return [];
    }

    const response = await databases.listDocuments(DB_ID, COMMENTS_COLLECTION_ID, [
      Query.equal('postId', postId),
      Query.isNull('parentId'), // Only get top-level comments
      Query.orderDesc('createdAt'),
      Query.limit(100),
    ]);

    return response.documents as unknown as Comment[];
  } catch (error: any) {
    if (error?.code === 404 || error?.type === 'collection_not_found') {
      console.warn('Comments collection not found');
      return [];
    }
    console.error('Error getting comments:', error);
    return [];
  }
}

/**
 * Get replies for a comment
 */
export async function getReplies(commentId: string): Promise<Comment[]> {
  try {
    if (!DB_ID || !COMMENTS_COLLECTION_ID) {
      return [];
    }

    const response = await databases.listDocuments(DB_ID, COMMENTS_COLLECTION_ID, [
      Query.equal('parentId', commentId),
      Query.orderAsc('createdAt'),
      Query.limit(50),
    ]);

    return response.documents as unknown as Comment[];
  } catch (error: any) {
    if (error?.code === 404) {
      return [];
    }
    console.error('Error getting replies:', error);
    return [];
  }
}

/**
 * Add a new comment
 */
export async function addComment(
  postId: string,
  userId: string,
  userName: string,
  content: string,
  userAvatar?: string,
  parentId?: string
): Promise<Comment> {
  try {
    if (!DB_ID || !COMMENTS_COLLECTION_ID) {
      throw new Error('Comments collection not configured');
    }

    const commentData: any = {
      postId,
      userId,
      userName,
      content,
      createdAt: new Date().toISOString(),
    };

    if (userAvatar) {
      commentData.userAvatar = userAvatar;
    }

    if (parentId) {
      commentData.parentId = parentId;
    }

    const response = await databases.createDocument(
      DB_ID,
      COMMENTS_COLLECTION_ID,
      ID.unique(),
      commentData
    );

    return response as unknown as Comment;
  } catch (error: any) {
    if (error?.code === 404 || error?.type === 'collection_not_found') {
      throw new Error('Comments collection not found. Please create it in Appwrite.');
    }
    console.error('Error adding comment:', error);
    throw error;
  }
}

/**
 * Update a comment
 */
export async function updateComment(commentId: string, content: string): Promise<void> {
  try {
    if (!DB_ID || !COMMENTS_COLLECTION_ID) {
      throw new Error('Comments collection not configured');
    }

    await databases.updateDocument(DB_ID, COMMENTS_COLLECTION_ID, commentId, {
      content,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<void> {
  try {
    if (!DB_ID || !COMMENTS_COLLECTION_ID) {
      throw new Error('Comments collection not configured');
    }

    await databases.deleteDocument(DB_ID, COMMENTS_COLLECTION_ID, commentId);
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}
