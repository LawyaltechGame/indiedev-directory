import 'dotenv/config';
import { Client, Databases } from 'node-appwrite';

const endpoint = process.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const projectId = process.env.VITE_APPWRITE_PROJECT_ID || '6a71f754000631bfb4a4';
const apiKey = process.env.APPWRITE_API_KEY;

const DB_ID = process.env.VITE_APPWRITE_DATABASE_ID || 'game_centralen_db';
const PROFILE_TABLE_ID = process.env.VITE_APPWRITE_PROFILE_TABLE_ID || 'profiles';
const GAMES_TABLE_ID = process.env.VITE_APPWRITE_GAMES_TABLE_ID || 'games';

if (!apiKey) {
  console.error('❌ APPWRITE_API_KEY is missing from .env');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

async function deleteStudioByName(name: string) {
  console.log(`🔍 Searching for studio: "${name}"...`);

  // 1. Delete studio from profiles
  const profiles = await databases.listDocuments(DB_ID, PROFILE_TABLE_ID);
  let deletedStudioCount = 0;

  for (const doc of profiles.documents) {
    try {
      const data = typeof doc.profileData === 'string' ? JSON.parse(doc.profileData) : doc.profileData;
      if (data?.name?.toLowerCase() === name.toLowerCase()) {
        await databases.deleteDocument(DB_ID, PROFILE_TABLE_ID, doc.$id);
        console.log(`🗑️  Deleted studio profile: "${data.name}" (ID: ${doc.$id})`);
        deletedStudioCount++;
      }
    } catch {}
  }

  // 2. Delete associated games
  const games = await databases.listDocuments(DB_ID, GAMES_TABLE_ID);
  let deletedGameCount = 0;

  for (const doc of games.documents) {
    try {
      const data = typeof doc.gameData === 'string' ? JSON.parse(doc.gameData) : doc.gameData;
      if (data?.developedBy?.toLowerCase() === name.toLowerCase()) {
        await databases.deleteDocument(DB_ID, GAMES_TABLE_ID, doc.$id);
        console.log(`🗑️  Deleted game: "${data.name}" (ID: ${doc.$id})`);
        deletedGameCount++;
      }
    } catch {}
  }

  if (deletedStudioCount === 0 && deletedGameCount === 0) {
    console.log(`⚠️  No studio or games found matching "${name}".`);
  } else {
    console.log(`✅ Cleaned up ${deletedStudioCount} studio(s) and ${deletedGameCount} game(s) for "${name}".`);
  }
}

async function clearAllData() {
  console.log('⚠️  CLEARING ALL STUDIOS AND GAMES FROM APPWRITE...');

  const profiles = await databases.listDocuments(DB_ID, PROFILE_TABLE_ID);
  for (const doc of profiles.documents) {
    await databases.deleteDocument(DB_ID, PROFILE_TABLE_ID, doc.$id);
    console.log(`🗑️ Deleted studio ID: ${doc.$id}`);
  }

  const games = await databases.listDocuments(DB_ID, GAMES_TABLE_ID);
  for (const doc of games.documents) {
    await databases.deleteDocument(DB_ID, GAMES_TABLE_ID, doc.$id);
    console.log(`🗑️ Deleted game ID: ${doc.$id}`);
  }

  console.log('✨ Database completely cleared!');
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
🎮 Game Centralen — Delete Data CLI

Usage:
  Delete specific studio & its games:  npm run delete-studio -- "Io Interactive"
  Clear ALL studios and games:         npm run clear-all-data
`);
    process.exit(0);
  }

  if (args.includes('--all')) {
    await clearAllData();
  } else {
    for (const name of args) {
      await deleteStudioByName(name);
    }
  }
}

main().catch(err => {
  console.error('💥 Error deleting:', err);
  process.exit(1);
});
