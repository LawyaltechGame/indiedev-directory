import { databases, ID, Query } from '../config/appwrite';
import { Permission, Role } from 'appwrite';
import type { FormData } from '../types';

export async function createProfileDocument(params: {
  databaseId: string;
  tableId: string; // collection/table id
  userId: string;
  data: FormData;
}) {
  const { databaseId, tableId, userId, data } = params;

  const createdAt = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());

  // Normalize payload to simple fields
  const documentData = {
    userId,
    name: data.name,
    tagline: data.tagline,
    genre: data.genre,
    platform: data.platform,
    teamSize: data.teamSize,
    location: data.location,
    description: data.description || '',
    website: data.website || '',
    email: data.email,
    status: 'pending', // pending, approved, rejected
    createdAt,
  } as const;

  // For Appwrite Tables, don't pass permissions during creation
  // Use table-level permissions instead (configured in Appwrite Console)
  // Row security can be enabled later if document-level permissions are needed
  return await databases.createDocument(databaseId, tableId, ID.unique(), documentData as any);
}

export async function getAllProfiles(databaseId: string, tableId: string) {
  try {
    const response = await databases.listDocuments(databaseId, tableId);
    return response.documents;
  } catch (error) {
    console.error('Error fetching profiles:', error);
    throw error;
  }
}

export async function getApprovedProfiles(databaseId: string, tableId: string) {
  try {
    const response = await databases.listDocuments(databaseId, tableId, [
      Query.equal('status', 'approved')
    ]);
    return response.documents;
  } catch (error) {
    console.error('Error fetching approved profiles:', error);
    throw error;
  }
}

export async function updateProfileStatus(
  databaseId: string,
  tableId: string,
  documentId: string,
  status: 'pending' | 'approved' | 'rejected'
) {
  try {
    return await databases.updateDocument(databaseId, tableId, documentId, {
      status,
    });
  } catch (error) {
    console.error('Error updating profile status:', error);
    throw error;
  }
}

export async function getUserPendingProfile(databaseId: string, tableId: string, userId: string) {
  try {
    const response = await databases.listDocuments(databaseId, tableId, [
      Query.equal('userId', userId),
      Query.equal('status', 'pending')
    ]);
    return response.documents.length > 0 ? response.documents[0] : null;
  } catch (error) {
    console.error('Error fetching user pending profile:', error);
    return null;
  }
}

export async function updateProfilePermissions(
  databaseId: string,
  tableId: string,
  documentId: string
) {
  try {
    const REVIEW_TEAM_ID = import.meta.env.VITE_REVIEW_TEAM_ID as string;
    
    if (!REVIEW_TEAM_ID) {
      console.warn('REVIEW_TEAM_ID not configured. Cannot add team permissions.');
      return null;
    }

    // Get the current document to preserve existing permissions
    const document = await databases.getDocument(databaseId, tableId, documentId);
    const userId = document.userId;

    // Build permissions array with both user and team permissions
    // Note: Document-level permissions support read/update/delete. Avoid 'write' on documents.
    const permissions = [
      Permission.read(Role.any()),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
      Permission.update(Role.team(REVIEW_TEAM_ID)),
      Permission.delete(Role.team(REVIEW_TEAM_ID)),
    ];

    // Try to update permissions (this requires write access)
    return await databases.updateDocument(
      databaseId,
      tableId,
      documentId,
      {},
      permissions
    );
  } catch (error) {
    console.error('Error updating profile permissions:', error);
    // Return null if we can't update permissions (might not have access)
    return null;
  }
}

export async function deleteProfile(
  databaseId: string,
  tableId: string,
  documentId: string
) {
  try {
    // First, try to update permissions if this is an old profile without team permissions
    // This will silently fail if we don't have write access, which is fine
    await updateProfilePermissions(databaseId, tableId, documentId);
    
    // Then delete the document
    return await databases.deleteDocument(databaseId, tableId, documentId);
  } catch (error) {
    console.error('Error deleting profile:', error);
    throw error;
  }
}
