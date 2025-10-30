import { databases, ID } from '../config/appwrite';
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

  // Permissions: anyone can read, only owner can update/delete
  const permissions = [
    Permission.read(Role.any()),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
    Permission.write(Role.user(userId)),
  ];

  // Normalize payload to simple fields
  const documentData = {
    userId,
    name: data.name,
    tagline: data.tagline,
    genre: data.genre,
    platform: data.platform,
    teamSize: data.teamSize,
    location: data.location,
    description: data.description,
    website: data.website,
    email: data.email,
    createdAt,
  } as const;

  return await databases.createDocument(databaseId, tableId, ID.unique(), documentData as any, permissions);
}
