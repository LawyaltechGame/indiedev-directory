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
  wpCommentId?: string; // WordPress comment ID for syncing
}

/**
 * Get all comments for a post (includes both Appwrite and synced WordPress comments)
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

/**
 * Delete a comment and all its replies recursively
 */
export async function deleteCommentAndReplies(commentId: string): Promise<void> {
  try {
    if (!DB_ID || !COMMENTS_COLLECTION_ID) {
      throw new Error('Comments collection not configured');
    }

    // Get all replies to this comment
    const replies = await getReplies(commentId);
    
    // Recursively delete all replies first
    for (const reply of replies) {
      await deleteCommentAndReplies(reply.$id);
    }
    
    // Then delete the comment itself
    await deleteComment(commentId);
  } catch (error) {
    console.error('Error deleting comment and replies:', error);
    throw error;
  }
}

/**
 * Get all WordPress comments for a post from Appwrite
 */
export async function getWordPressCommentsFromAppwrite(postId: string): Promise<Comment[]> {
  try {
    if (!DB_ID || !COMMENTS_COLLECTION_ID) {
      return [];
    }

    const response = await databases.listDocuments(DB_ID, COMMENTS_COLLECTION_ID, [
      Query.equal('postId', postId),
      Query.isNotNull('wpCommentId'), // Only get WordPress synced comments
      Query.limit(500),
    ]);

    return response.documents as unknown as Comment[];
  } catch (error: any) {
    if (error?.code === 404 || error?.type === 'collection_not_found') {
      return [];
    }
    console.error('Error getting WordPress comments from Appwrite:', error);
    return [];
  }
}

/**
 * Sync WordPress comment to Appwrite (create if doesn't exist, update if exists)
 */
export async function syncWordPressComment(
  wpCommentId: string,
  postId: string,
  userId: string,
  userName: string,
  content: string,
  userAvatar?: string,
  createdAt?: string,
  parentId?: string
): Promise<Comment | null> {
  try {
    if (!DB_ID || !COMMENTS_COLLECTION_ID) {
      console.warn('Comments collection not configured');
      return null;
    }

    // Check if WordPress comment already exists in Appwrite
    const existingComments = await databases.listDocuments(DB_ID, COMMENTS_COLLECTION_ID, [
      Query.equal('postId', postId),
      Query.equal('wpCommentId', wpCommentId),
      Query.limit(1),
    ]);

    const commentData: any = {
      postId,
      userId,
      userName,
      content,
      wpCommentId, // Store WordPress comment ID for reference
      createdAt: createdAt || new Date().toISOString(),
    };

    if (userAvatar) {
      commentData.userAvatar = userAvatar;
    }

    if (parentId) {
      commentData.parentId = parentId;
    }

    if (existingComments.documents.length > 0) {
      // Update existing comment
      const existing = existingComments.documents[0];
      const updated = await databases.updateDocument(
        DB_ID,
        COMMENTS_COLLECTION_ID,
        existing.$id,
        commentData
      );
      return updated as unknown as Comment;
    } else {
      // Create new comment
      const response = await databases.createDocument(
        DB_ID,
        COMMENTS_COLLECTION_ID,
        ID.unique(),
        commentData
      );
      return response as unknown as Comment;
    }
  } catch (error: any) {
    if (error?.code === 404 || error?.type === 'collection_not_found') {
      console.warn('Comments collection not found');
      return null;
    }
    console.error('Error syncing WordPress comment:', error);
    return null;
  }
}
