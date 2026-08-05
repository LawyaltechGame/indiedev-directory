import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { Client, Databases, Storage, ID, Query } from 'node-appwrite';
import { InputFile } from 'node-appwrite/file';

// ── Configuration ──────────────────────────────────────────────
const endpoint = process.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const projectId = process.env.VITE_APPWRITE_PROJECT_ID || '6a71f754000631bfb4a4';
const apiKey = process.env.APPWRITE_API_KEY;

const DB_ID = process.env.VITE_APPWRITE_DATABASE_ID || 'game_centralen_db';
const PROFILE_TABLE_ID = process.env.VITE_APPWRITE_PROFILE_TABLE_ID || 'profiles';
const GAMES_TABLE_ID = process.env.VITE_APPWRITE_GAMES_TABLE_ID || 'games';
const BUCKET_ID = process.env.VITE_APPWRITE_STUDIO_IMAGES_BUCKET_ID || 'studio_images';

if (!apiKey) {
  console.error('❌ APPWRITE_API_KEY is missing from .env');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);
const storage = new Storage(client);

// ── Types ──────────────────────────────────────────────────────
interface GameData {
  name: string;
  developedBy?: string;
  publisher?: string;
  status?: string;
  releaseDate?: string;
  platforms?: string[];
  engine?: string;
  genre?: string;
  monetization?: string;
  description?: string;
  keyFeatures?: Array<{ feature: string; description: string }>;
  recognitions?: Array<{ type: string; title: string; source?: string }>;
  logoImageUrl?: string;
  logoImageId?: string;
  trailerVideoUrl?: string;
  gameplayVideoUrl?: string;
}

interface StudioData {
  name: string;
  tagline?: string;
  description?: string;
  website?: string;
  genre?: string;
  platform?: string;
  teamSize?: string;
  location?: string;
  email?: string;
  publicContactEmail?: string;
  foundedYear?: string;
  headquartersCountry?: string;
  city?: string;
  founders?: string[];
  languagesSupported?: string[];
  regionsServed?: string[];
  studioType?: string;
  gameEngines?: string[];
  supportedPlatforms?: string[];
  targetAudience?: string;
  deploymentType?: string;
  projects?: Array<{
    gameTitle: string;
    status: string;
    platforms: string[];
    projectPageUrl?: string;
    shortDescription?: string;
  }>;
  lookingFor?: string[];
  openToPublishingDeals?: boolean;
  publisherPartners?: string;
  fundingType?: string;
  latestFundingRound?: string;
  totalFunding?: string;
  distributionChannels?: string[];
  storeLinks?: string[];
  socialLinks?: Record<string, string>;
  recognitions?: Array<Record<string, string>>;
  trailerVideoUrl?: string;
  gameplayVideoUrl?: string;
  knownFor?: string;
  profileImageUrl?: string;
  profileImageId?: string;
  parentCompany?: string;
  acquisitionStatus?: string;
  acquiredBy?: string;
}

interface ImportPayload {
  studio: StudioData;
  games?: GameData[];
}

// ── Helpers ────────────────────────────────────────────────────
async function uploadImageFromUrl(url: string, name: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) return '';
    const buffer = Buffer.from(await response.arrayBuffer());
    const filename = `${name.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.jpg`;
    const file = await storage.createFile(BUCKET_ID, ID.unique(), InputFile.fromBuffer(buffer, filename));
    console.log(`  🖼️  Uploaded image: ${file.$id}`);
    return file.$id;
  } catch (err: any) {
    console.warn(`  ⚠️  Image upload failed: ${err.message}`);
    return '';
  }
}

// ── Import Logic ───────────────────────────────────────────────
async function importStudioAndGames(payload: ImportPayload) {
  const { studio, games = [] } = payload;

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🏢 Importing Studio: "${studio.name}"`);
  console.log(`${'═'.repeat(60)}`);

  // Upload studio logo
  let profileImageId = studio.profileImageId || '';
  if (!profileImageId && studio.profileImageUrl) {
    profileImageId = await uploadImageFromUrl(studio.profileImageUrl, `${studio.name}-logo`);
  }

  // Build projects list
  const projects = studio.projects || games.map(g => ({
    gameTitle: g.name,
    status: g.status || 'Released',
    platforms: g.platforms || ['PC'],
    projectPageUrl: '',
    shortDescription: g.description ? g.description.substring(0, 120) + '...' : '',
  }));

  // Build the profileData JSON (matches existing site format exactly)
  const profileData = JSON.stringify({
    name: studio.name,
    tagline: studio.tagline || '',
    description: studio.description || '',
    website: studio.website || '',
    genre: studio.genre || '',
    platform: studio.platform || '',
    teamSize: studio.teamSize || '',
    location: studio.location || '',
    email: studio.email || '',
    publicContactEmail: studio.publicContactEmail || '',
    revenue: '',
    foundedYear: studio.foundedYear || '',
    tools: [],
    tags: [],
    studioType: studio.studioType || '',
    headquartersCountry: studio.headquartersCountry || '',
    city: studio.city || '',
    languagesSupported: studio.languagesSupported || [],
    regionsServed: studio.regionsServed || ['Global'],
    founders: studio.founders || [],
    parentCompany: studio.parentCompany || '',
    acquisitionStatus: studio.acquisitionStatus || 'Independent',
    acquiredBy: studio.acquiredBy || '',
    targetAudience: studio.targetAudience || '',
    primaryExpertise: [],
    gameEngines: studio.gameEngines || [],
    deploymentType: studio.deploymentType || '',
    supportedPlatforms: studio.supportedPlatforms || [],
    projects,
    lookingFor: studio.lookingFor || [],
    openToPublishingDeals: studio.openToPublishingDeals ?? false,
    publisherPartners: studio.publisherPartners || '',
    fundingType: studio.fundingType || '',
    latestFundingRound: studio.latestFundingRound || '',
    totalFunding: studio.totalFunding || '',
    distributionChannels: studio.distributionChannels || [],
    storeLinks: studio.storeLinks || [],
    socialLinks: studio.socialLinks || {},
    recognitions: studio.recognitions || [],
    trailerVideoUrl: studio.trailerVideoUrl || '',
    gameplayVideoUrl: studio.gameplayVideoUrl || '',
    knownFor: studio.knownFor || games.map(g => g.name).join(', '),
    profileImageId,
  });

  // Check if studio already exists
  const existing = await databases.listDocuments(DB_ID, PROFILE_TABLE_ID, [
    Query.equal('status', 'approved'),
  ]);
  const existingDoc = existing.documents.find((doc: any) => {
    try {
      const data = typeof doc.profileData === 'string' ? JSON.parse(doc.profileData) : doc.profileData;
      return data?.name?.toLowerCase() === studio.name.toLowerCase();
    } catch { return false; }
  });

  const documentData = {
    userId: 'admin-team',
    status: 'approved',
    createdByTeam: true,
    createdAt: new Date().toISOString(),
    profileData,
  };

  if (existingDoc) {
    await databases.updateDocument(DB_ID, PROFILE_TABLE_ID, existingDoc.$id, documentData);
    console.log(`✅ Updated studio: ${studio.name}`);
  } else {
    const doc = await databases.createDocument(DB_ID, PROFILE_TABLE_ID, ID.unique(), documentData);
    console.log(`✅ Created studio: ${studio.name} (ID: ${doc.$id})`);
  }

  // Import games
  if (games.length > 0) {
    console.log(`\n🎮 Importing ${games.length} game(s)...`);

    const existingGames = await databases.listDocuments(DB_ID, GAMES_TABLE_ID, [
      Query.equal('status', 'approved'),
    ]);

    for (const game of games) {
      if (!game.name) continue;
      console.log(`  👉 ${game.name}...`);

      let logoImageId = game.logoImageId || '';
      if (!logoImageId && game.logoImageUrl) {
        logoImageId = await uploadImageFromUrl(game.logoImageUrl, `${game.name}-cover`);
      }

      const gameData = JSON.stringify({
        name: game.name,
        developedBy: game.developedBy || studio.name,
        publisher: game.publisher || studio.name,
        status: game.status || 'Released',
        releaseDate: game.releaseDate || 'TBA',
        platforms: game.platforms || ['PC'],
        engine: game.engine || '',
        genre: game.genre || studio.genre || '',
        monetization: game.monetization || 'Paid Game',
        description: game.description || '',
        keyFeatures: game.keyFeatures || [],
        recognitions: game.recognitions || [],
        logoImageId,
        trailerVideoUrl: game.trailerVideoUrl || '',
        gameplayVideoUrl: game.gameplayVideoUrl || '',
      });

      const gameDocData = {
        userId: 'admin-team',
        status: 'approved',
        createdByTeam: true,
        createdAt: new Date().toISOString(),
        gameData,
      };

      const existingGame = existingGames.documents.find((doc: any) => {
        try {
          const data = typeof doc.gameData === 'string' ? JSON.parse(doc.gameData) : doc.gameData;
          return data?.name?.toLowerCase() === game.name.toLowerCase();
        } catch { return false; }
      });

      if (existingGame) {
        await databases.updateDocument(DB_ID, GAMES_TABLE_ID, existingGame.$id, gameDocData);
        console.log(`  ✅ Updated: ${game.name}`);
      } else {
        const doc = await databases.createDocument(DB_ID, GAMES_TABLE_ID, ID.unique(), gameDocData);
        console.log(`  ✅ Created: ${game.name} (ID: ${doc.$id})`);
      }
    }
  }

  console.log(`\n🎉 Done! "${studio.name}" + ${games.length} game(s) imported.\n`);
}

// ── CLI ────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const inputPath = args[0];

  if (!inputPath || args.includes('--help')) {
    console.log(`
🎮 Game Centralen — Claude JSON Importer

Usage:
  npx tsx src/scripts/importClaudeData.ts <file.json or directory>
  npm run import-data -- my-studio.json
`);
    process.exit(0);
  }

  const absPath = path.resolve(inputPath);
  if (!fs.existsSync(absPath)) {
    console.error(`❌ Error: Path not found: ${absPath}`);
    process.exit(1);
  }

  const stat = fs.statSync(absPath);
  const files: string[] = [];

  if (stat.isDirectory()) {
    for (const f of fs.readdirSync(absPath)) {
      if (f.endsWith('.json')) files.push(path.join(absPath, f));
    }
  } else if (absPath.endsWith('.json')) {
    files.push(absPath);
  }

  console.log(`🚀 Found ${files.length} JSON file(s) to import.\n`);

  for (const file of files) {
    try {
      console.log(`📖 Reading: ${path.basename(file)}`);
      const payload: ImportPayload = JSON.parse(fs.readFileSync(file, 'utf-8'));
      await importStudioAndGames(payload);
    } catch (err: any) {
      console.error(`❌ Failed: ${path.basename(file)} — ${err.message}`);
    }
  }
}

main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
