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

// ── Helper: Automatically scrape studio logo from official website HTML ──
export async function scrapeWebsiteLogo(siteUrl: string): Promise<string | null> {
  if (!siteUrl) return null;
  try {
    const formattedUrl = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`;
    const res = await fetch(formattedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    if (!res.ok) return null;
    const html = await res.text();

    const candidateUrls: string[] = [];

    // 1. Look for img tag with logo/brand in src, class, alt or id
    const imgRegex = /<img[^>]+src=[\"']([^\"']+)[\"'][^>]*>/gi;
    let match: RegExpExecArray | null;
    while ((match = imgRegex.exec(html)) !== null) {
      const fullTag = match[0].toLowerCase();
      const src = match[1];
      if (fullTag.includes('logo') || fullTag.includes('brand') || fullTag.includes('header')) {
        candidateUrls.push(src);
      }
    }

    // 2. Look for og:image or twitter:image
    const ogMatch = html.match(/<meta\s+property=[\"']og:image[\"']\s+content=[\"']([^\"']+)[\"']/i) ||
                    html.match(/<meta\s+name=[\"']twitter:image[\"']\s+content=[\"']([^\"']+)[\"']/i);
    if (ogMatch) candidateUrls.push(ogMatch[1]);

    // 3. Look for touch icons / favicon
    const iconMatch = html.match(/<link\s+rel=[\"'](apple-touch-icon|icon|shortcut icon)[\"']\s+href=[\"']([^\"']+)[\"']/i);
    if (iconMatch) candidateUrls.push(iconMatch[2] || iconMatch[1]);

    for (let u of candidateUrls) {
      if (u.startsWith('//')) u = 'https:' + u;
      else if (u.startsWith('/')) u = new URL(formattedUrl).origin + u;
      else if (!u.startsWith('http')) u = new URL(formattedUrl).origin + '/' + u;

      try {
        const checkRes = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (checkRes.ok && checkRes.headers.get('content-type')?.includes('image')) {
          console.log(`  🌐 Scraped official logo from site: ${u}`);
          return u;
        }
      } catch {}
    }
    return null;
  } catch {
    return null;
  }
}

// ── Helper: Download image from URL and upload to Appwrite Storage ──
async function uploadImageFromUrl(url: string, prefix: string): Promise<string> {
  if (!url) return '';
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    if (!res.ok) {
      console.warn(`  ⚠️ Failed to fetch image (${res.status}): ${url}`);
      return '';
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const filename = `${prefix.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;
    const file = await storage.createFile(BUCKET_ID, ID.unique(), InputFile.fromBuffer(buffer, filename));
    console.log(`  🖼️  Uploaded image: ${file.$id}`);
    return file.$id;
  } catch (err: any) {
    console.warn(`  ⚠️ Image upload error: ${err.message}`);
    return '';
  }
}

// ── Studio Data Schema ─────────────────────────────────────────
interface StudioEntry {
  tagline?: string;
  description?: string;
  website?: string;
  profileImageUrl?: string;
  genre?: string;
  platform?: string;
  teamSize?: string;
  location?: string;
  foundedYear?: string;
  headquartersCountry?: string;
  city?: string;
  founders?: string[];
  studioType?: string;
  gameEngines?: string[];
  supportedPlatforms?: string[];
  publisherPartners?: string;
  fundingType?: string;
  distributionChannels?: string[];
  socialLinks?: Record<string, string>;
  recognitions?: Array<Record<string, string>>;
  knownFor?: string;
  
  // Extended fields from corporate profile
  legalEntityName?: string;
  registrationId?: string;
  stockSymbol?: string;
  parentCompany?: string;
  acquisitionStatus?: string;
  leadership?: Array<{ name: string; role: string; bio?: string }>;
  financials?: Array<{ year: string; revenue: string; ebitda?: string; ebit?: string; result?: string; fte?: string }>;
  workforce?: { headcount?: number; avgFte?: number; composition?: string };
  whatChanged?: Array<{ date: string; event: string }>;
  games?: Array<{
    name: string;
    publisher?: string;
    status?: string;
    releaseDate?: string;
    platforms?: string[];
    engine?: string;
    genre?: string;
    monetization?: string;
    description?: string;
    logoImageUrl?: string;
    trailerVideoUrl?: string;
    metacritic?: number | string;
    verificationDate?: string;
    keyFeatures?: Array<{ feature: string; description: string }>;
    recognitions?: Array<{ type?: string; title: string; source?: string }>;
    whereToPlay?: Array<{ name: string; url: string }>;
    tags?: string[];
  }>;
}

// ── Rich Studio Database ────────────────────────────────────────
const STUDIO_DATABASE: Record<string, StudioEntry> = {

  // ─── REMEDY ENTERTAINMENT ───
  "Remedy Entertainment": {
    tagline: "Listed Finnish AAA studio — Max Payne, Alan Wake, Control, and its own Northlight engine",
    description: "Remedy Entertainment is an Espoo-based AAA studio founded in 1995 by members of the Finnish demoscene group Future Crew. It builds story-driven third-person action games on Northlight, its own engine and toolchain, and owns two of its three major franchises outright — Control and Alan Wake, linked through the Remedy Connected Universe — while Max Payne remains a partner franchise with Rockstar Games. Since 2025 it publishes its own IP directly rather than through third-party publishers.",
    website: "https://www.remedygames.com/",
    profileImageUrl: "https://images.igdb.com/igdb/image/upload/t_logo_med/cl4xv.png",
    genre: "Action / Narrative / Mystery",
    platform: "PC, PlayStation, Xbox, iOS, Android",
    teamSize: "387",
    location: "Espoo, Finland",
    foundedYear: "1995",
    headquartersCountry: "Finland",
    city: "Espoo",
    legalEntityName: "Remedy Entertainment Oyj (Plc)",
    registrationId: "Y-tunnus 1017278-9",
    stockSymbol: "Nasdaq Helsinki: REMEDY",
    founders: ["Samuli Syvähuoko", "Markus Mäki", "Sami Nopanen", "John Kavaleff", "Sami Vanhatalo"],
    studioType: "AAA developer & publisher (listed)",
    gameEngines: ["Northlight (proprietary, in-house)"],
    supportedPlatforms: ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One", "iOS", "Android"],
    publisherPartners: "Epic Games Publishing, 505 Games, Rockstar Games, Microsoft Game Studios, Annapurna",
    fundingType: "Listed equity (Nasdaq Helsinki) & Tencent Convertible Loan",
    distributionChannels: ["Steam", "Epic Games Store", "PlayStation Store", "Microsoft Store", "App Store", "Google Play"],
    socialLinks: {
      twitter: "https://x.com/remedygames",
      youtube: "https://youtube.com/@remedygames",
      website: "https://www.remedygames.com/",
      investors: "https://investors.remedygames.com/"
    },
    leadership: [
      { name: "Jean-Charles Gaudechon", role: "CEO (from 1 March 2026)", bio: "Appointed 9 February 2026." },
      { name: "Markus Mäki", role: "Co-founder & Chief Product Officer", bio: "Founding member. Largest shareholder." },
      { name: "Henri Österlund", role: "Chair of the Board", bio: "Elected Chair in October 2025." },
      { name: "Santtu Kallionpää", role: "CFO", bio: "Started October 2024." },
      { name: "Sami Järvi (Sam Lake)", role: "Creative Director", bio: "Writer and creative lead across Max Payne, Alan Wake, Quantum Break and Control." },
      { name: "Mikael Kasurinen", role: "Creative Director", bio: "Creative director on the Control franchise." },
      { name: "Mika Vehkala", role: "CTO", bio: "Leads Northlight engine and technology." }
    ],
    financials: [
      { year: "2021", revenue: "44.7m EUR", ebit: "11.4m EUR" },
      { year: "2022", revenue: "43.6m EUR", ebit: "-0.6m EUR" },
      { year: "2023", revenue: "33.9m EUR", ebitda: "-17.0m EUR", ebit: "-28.6m EUR", fte: "334" },
      { year: "2024", revenue: "50.7m EUR", ebitda: "2.5m EUR", ebit: "-4.3m EUR", fte: "351" },
      { year: "2025", revenue: "59.5m EUR", ebitda: "11.3m EUR", ebit: "-14.9m EUR", fte: "371" }
    ],
    workforce: { headcount: 387, avgFte: 371, composition: "46% Finnish nationals, 54% representing 35 other nationalities" },
    whatChanged: [
      { date: "Mar 2026", event: "Jean-Charles Gaudechon started as CEO." },
      { date: "Dec 2025", event: "CONTROL Resonant revealed — the Control sequel — for publication in 2026." },
      { date: "Oct 2025", event: "Tero Virtala stepped down as CEO; Markus Mäki took over as interim CEO." },
      { date: "Sep 2025", event: "14.9m EUR non-cash impairment recognised on FBC: Firebreak." },
      { date: "Jun 2025", event: "FBC: Firebreak launched — Remedy's first self-published title." },
      { date: "Aug 2024", event: "Annapurna partnership: 50% Control sequel budget financed, plus film & TV rights." },
      { date: "Feb 2024", event: "Full Control franchise rights bought back from 505 Games for 17m EUR." }
    ],
    recognitions: [
      { type: "Award", title: "Best Game Direction - Control", source: "The Game Awards 2019" },
      { type: "Award", title: "Best Narrative - Alan Wake 2", source: "The Game Awards 2023" },
      { type: "Award", title: "Best Art Direction - Alan Wake 2", source: "The Game Awards 2023" },
      { type: "Award", title: "BAFTA Best Game - Control", source: "BAFTA 2020" }
    ],
    knownFor: "Max Payne, Alan Wake, Control, Alan Wake 2, Quantum Break",
    games: [
      { name: "Death Rally", publisher: "Apogee Software", status: "Released", releaseDate: "1996", platforms: ["MS-DOS"], genre: "Top-Down Racing / Action", monetization: "Paid Game", description: "Remedy's debut title: a top-down combat racing game built in a basement in Espoo." },
      { name: "Max Payne", publisher: "Gathering of Developers / Rockstar Games", status: "Released", releaseDate: "July 23, 2001", platforms: ["PC", "PlayStation 2", "Xbox"], engine: "MAX-FX Engine", genre: "Third-Person Shooter / Neo-Noir", monetization: "Paid Game", description: "Pioneered Bullet Time in gaming. A DEA agent wages a one-man war against the criminal underworld of New York.", logoImageUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2ept.jpg" },
      { name: "Max Payne 2: The Fall of Max Payne", publisher: "Rockstar Games", status: "Released", releaseDate: "October 15, 2003", platforms: ["PC", "PlayStation 2", "Xbox"], engine: "MAX-FX 2.0 Engine", genre: "Third-Person Shooter / Neo-Noir", monetization: "Paid Game", description: "A dark film-noir love story between Max Payne and Mona Sax with Havok physics." },
      { name: "Alan Wake", publisher: "Microsoft Game Studios", status: "Released", releaseDate: "May 14, 2010", platforms: ["Xbox 360", "PC"], engine: "Custom Engine", genre: "Psychological Action Thriller", monetization: "Paid Game", description: "Novelistic psychological action thriller set in Bright Falls." },
      { name: "Death Rally (2011)", publisher: "Remedy Entertainment", status: "Released", releaseDate: "2011", platforms: ["iOS", "Android", "PC"], genre: "Racing / Action", monetization: "Paid Game", description: "Remake of the classic 1996 top-down racing game." },
      { name: "Alan Wake's American Nightmare", publisher: "Microsoft Studios", status: "Released", releaseDate: "February 22, 2012", platforms: ["Xbox 360", "PC"], genre: "Action-Adventure", monetization: "Paid Game", description: "Standalone pulp-action spin-off following Alan Wake in Night Springs." },
      { name: "Agents of Storm", publisher: "Remedy Entertainment", status: "Discontinued", releaseDate: "2014", platforms: ["iOS"], genre: "Strategy / Mobile", monetization: "Free-to-play", description: "Mobile action-strategy game developed by Remedy." },
      { name: "Quantum Break", publisher: "Microsoft Studios", status: "Released", releaseDate: "April 5, 2016", platforms: ["Xbox One", "PC"], engine: "Northlight Engine", genre: "Action-Adventure / Sci-Fi", monetization: "Paid Game", description: "Time-bending action game starring Shawn Ashmore, integrated with a live-action TV show.", logoImageUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1qbu.jpg" },
      { name: "Control", publisher: "505 Games", status: "Released", releaseDate: "August 27, 2019", platforms: ["PC", "PlayStation 4", "PlayStation 5", "Xbox One", "Xbox Series X/S", "Nintendo Switch"], engine: "Northlight Engine", genre: "Action-Adventure / Sci-Fi", monetization: "Paid Game + DLCs", description: "Explore the brutalist labyrinth of the Oldest House as Federal Bureau of Control Director Jesse Faden.", logoImageUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7f.jpg" },
      { name: "CrossfireX (campaign)", publisher: "Smilegate", status: "Released · Servers Closed", releaseDate: "February 10, 2022", platforms: ["Xbox One", "Xbox Series X/S"], engine: "Northlight Engine", genre: "First-Person Shooter", monetization: "Paid Campaign", description: "Single-player campaign developed by Remedy for Smilegate's FPS franchise." },
      { name: "Alan Wake Remastered", publisher: "Epic Games Publishing", status: "Released", releaseDate: "October 5, 2021", platforms: ["PC", "PlayStation 4", "PlayStation 5", "Xbox One", "Xbox Series X/S", "Nintendo Switch"], engine: "Northlight Engine", genre: "Psychological Thriller", monetization: "Paid Game", description: "4K remastered release of the psychological action thriller." },
      { name: "Alan Wake 2", publisher: "Epic Games Publishing", status: "Released", releaseDate: "October 27, 2023", platforms: ["PC", "PlayStation 5", "Xbox Series X/S"], engine: "Northlight Engine", genre: "Survival Horror / Action", monetization: "Paid Game", description: "Dual-protagonist survival horror masterpiece following Saga Anderson and Alan Wake.", logoImageUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co6q21.jpg" },
      { name: "FBC: Firebreak", publisher: "Remedy Entertainment", status: "Released", releaseDate: "June 2025", platforms: ["PC", "PlayStation 5", "Xbox Series X/S"], engine: "Northlight Engine", genre: "Co-op FPS", monetization: "Paid Game", description: "Three-player co-op first-person shooter set inside the Federal Bureau of Control." },
      { name: "CONTROL Resonant", publisher: "Remedy Entertainment", status: "In Development", releaseDate: "2026", platforms: ["PC", "PlayStation 5", "Xbox Series X/S"], engine: "Northlight Engine", genre: "Action-Adventure", monetization: "Paid Game", description: "The full sequel to Control, co-financed by Annapurna." },
      { name: "Max Payne 1&2 Remake", publisher: "Rockstar Games", status: "In Development", releaseDate: "TBA", platforms: ["PC", "PlayStation 5", "Xbox Series X/S"], engine: "Northlight Engine", genre: "Action / Neo-Noir", monetization: "Paid Game", description: "Combined remake of Max Payne 1 & 2 in partnership with Rockstar Games." },
      { name: "Codename Kestrel", publisher: "Tencent / Remedy", status: "Cancelled", releaseDate: "TBA", platforms: ["PC"], genre: "Multiplayer", monetization: "Cancelled", description: "Rebooted co-op multiplayer game cancelled in 2024 to focus on core IP." }
    ]
  },

  // ─── IO INTERACTIVE ───
  "IO Interactive": {
    tagline: "Nordic independent AAA developer-publisher — Hitman and Project 007",
    description: "IO Interactive is an independent Danish video game developer based in Copenhagen, founded in 1998. Renowned for creating the Hitman franchise and the Glacier engine, IO Interactive successfully transitioned into a self-publishing independent AAA power-house with studio locations in Copenhagen, Malmö, Barcelona, Istanbul, and Brighton.",
    website: "https://www.ioi.dk",
    profileImageUrl: "https://images.igdb.com/igdb/image/upload/t_logo_med/cl4xu.png",
    genre: "Stealth / Action-Adventure",
    platform: "PC, PlayStation, Xbox, Nintendo Switch",
    teamSize: "400+",
    location: "Copenhagen, Denmark",
    foundedYear: "1998",
    headquartersCountry: "Denmark",
    city: "Copenhagen",
    founders: ["Reto Glaubitz", "Hakan Abrak", "Janos Flösser"],
    studioType: "Independent AAA Studio",
    gameEngines: ["Glacier Engine"],
    supportedPlatforms: ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One", "Nintendo Switch"],
    publisherPartners: "Self-Published (formerly Eidos, Square Enix, Warner Bros)",
    fundingType: "Private / Independent",
    distributionChannels: ["Steam", "Epic Games Store", "PlayStation Store", "Xbox Store"],
    socialLinks: { twitter: "https://twitter.com/IOInteractive", youtube: "https://youtube.com/@IOInteractive" },
    knownFor: "HITMAN 3, Hitman World of Assassination, Project 007, Freedom Fighters",
    games: [
      {
        name: "HITMAN 3",
        publisher: "IO Interactive (self-published)",
        status: "Released",
        releaseDate: "20 January 2021",
        platforms: ["PC", "PS4", "PS5", "Xbox One", "Xbox Series X|S", "Nintendo Switch (cloud)", "Stadia"],
        engine: "Glacier (with ray tracing support)",
        genre: "Stealth / Sandbox",
        monetization: "Paid game + expansion passes",
        metacritic: 88,
        verificationDate: "Verified 3 August 2026",
        description: "The trilogy's finale and IO Interactive's first fully self-published game. Six locations — the Dubai skyscraper, the Dartmoor murder-mystery manor, a Berlin techno club where every guest might be an assassin hunting you, Chongqing, Mendoza and a Carpathian train — that between them show the studio at the peak of its sandbox craft. Widely cited as one of the finest stealth games ever made.",
        keyFeatures: [
          { feature: "Dartmoor Mystery", description: "A self-contained whodunnit level where 47 can pose as a detective and solve a murder to reach his target." },
          { feature: "Berlin's Hunted Twist", description: "The only Hitman level where 47 is the one being tracked, with no marked targets on the map." },
          { feature: "Full Trilogy Carryover", description: "Imports the 2016 and 2018 locations, consolidating six years of content in one client." }
        ],
        recognitions: [
          { type: "Score", title: "Metacritic 88 — the first major critical hit of 2021, with several outlets calling it the best entry in the series.", source: "https://www.metacritic.com/game/hitman-3/" },
          { type: "Note", title: "Rebranded as HITMAN World of Assassination in January 2023.", source: "https://www.gamespot.com/articles/hitman-3-has-officially-been-renamed-adds-new-freelancer-mode/1100-6510886/" }
        ],
        whereToPlay: [
          { name: "Steam (as World of Assassination)", url: "https://store.steampowered.com/app/1659040/HITMAN_World_of_Assassination/" }
        ],
        tags: ["Stealth", "Sandbox", "Self-Published", "Replayable"]
      },
      { name: "Hitman World of Assassination", publisher: "IO Interactive", status: "Released", releaseDate: "January 20, 2021", platforms: ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One", "Nintendo Switch"], engine: "Glacier Engine", genre: "Stealth / Sandbox", monetization: "Paid Game + Live Service", description: "The definitive stealth sandbox experience encompassing Hitman 1, 2, and 3 with Freelancer roguelike mode." },
      { name: "Project 007 (James Bond)", publisher: "IO Interactive", status: "In Development", releaseDate: "TBA", platforms: ["PC", "PlayStation 5", "Xbox Series X/S"], engine: "Glacier Engine", genre: "Stealth / Action-Adventure", monetization: "Paid Game", description: "An original James Bond origin story developed and published by IO Interactive." },
      { name: "Freedom Fighters", publisher: "EA / IO Interactive", status: "Released", releaseDate: "September 26, 2003", platforms: ["PC", "PlayStation 2", "Xbox", "GameCube"], genre: "Third-Person Shooter", monetization: "Paid Game", description: "Classic squad-based third-person shooter set in an alternate history New York City." },
      { name: "Kane & Lynch: Dead Men", publisher: "Eidos Interactive", status: "Released", releaseDate: "November 13, 2007", platforms: ["PC", "PlayStation 3", "Xbox 360"], genre: "Action / Shooter", monetization: "Paid Game", description: "Gritty co-op crime shooter following two flawed mercenaries." }
    ]
  },

  // ─── LARIAN STUDIOS ───
  "Larian Studios": {
    tagline: "Creators of Baldur's Gate 3 and Divinity: Original Sin",
    description: "Larian Studios is a Belgian video game developer founded in 1996 by Swen Vincke. The studio gained massive acclaim for reviving the Baldur's Gate franchise with Baldur's Gate 3, which won Game of the Year 2023. Known for deep RPG systems, player freedom, and cooperative gameplay.",
    website: "https://larian.com",
    profileImageUrl: "https://upload.wikimedia.org/wikipedia/en/1/1a/Larian_Studios_Logo_2012.png",
    genre: "RPG / CRPG",
    platform: "PC, PlayStation, Xbox, macOS",
    teamSize: "450+",
    location: "Ghent, Belgium",
    foundedYear: "1996",
    headquartersCountry: "Belgium",
    city: "Ghent",
    founders: ["Swen Vincke"],
    studioType: "AAA Studio",
    gameEngines: ["Divinity Engine"],
    supportedPlatforms: ["PC", "PlayStation 5", "Xbox Series X/S", "macOS"],
    publisherPartners: "Self-Published",
    fundingType: "Private",
    distributionChannels: ["Steam", "GOG", "PlayStation Store", "Xbox Store"],
    socialLinks: { twitter: "https://twitter.com/laraboratory", youtube: "https://youtube.com/@LarianStudios" },
    recognitions: [
      { type: "Award", title: "Game of the Year - Baldur's Gate 3", source: "The Game Awards 2023" },
      { type: "Award", title: "Best RPG - Baldur's Gate 3", source: "The Game Awards 2023" }
    ],
    knownFor: "Baldur's Gate 3, Divinity: Original Sin 2, Divinity: Original Sin",
    games: [
      { name: "Baldur's Gate 3", publisher: "Larian Studios", status: "Released", releaseDate: "August 3, 2023", platforms: ["PC", "PlayStation 5", "Xbox Series X/S", "macOS"], engine: "Divinity Engine 4.0", genre: "RPG / CRPG", monetization: "Paid Game", description: "An epic RPG set in the Dungeons & Dragons universe. Gather your party and return to the Forgotten Realms in a tale of fellowship, betrayal, sacrifice, and survival.", trailerVideoUrl: "https://www.youtube.com/watch?v=1T22wNnSd3A", keyFeatures: [{ feature: "Turn-Based Combat", description: "D&D 5th Edition rules with deep tactical combat." }, { feature: "Player Freedom", description: "Unprecedented player choice with branching narratives and creative problem solving." }, { feature: "Co-op Multiplayer", description: "Full campaign playable in up to 4-player co-op." }], recognitions: [{ type: "Award", title: "Game of the Year", source: "The Game Awards 2023" }] },
      { name: "Divinity: Original Sin 2", publisher: "Larian Studios", status: "Released", releaseDate: "September 14, 2017", platforms: ["PC", "PlayStation 4", "Xbox One", "Nintendo Switch", "macOS"], engine: "Divinity Engine 3.0", genre: "RPG / CRPG", monetization: "Paid Game", description: "The critically acclaimed RPG with deep tactical combat, cooperative multiplayer, and a rich story of godhood and power." },
      { name: "Divinity: Original Sin", publisher: "Larian Studios", status: "Released", releaseDate: "June 30, 2014", platforms: ["PC", "PlayStation 4", "Xbox One"], engine: "Divinity Engine", genre: "RPG / CRPG", monetization: "Paid Game", description: "A classic RPG that revitalized the genre with deep turn-based combat and cooperative gameplay." }
    ]
  },

  // ─── CD PROJEKT RED ───
  "CD Projekt Red": {
    tagline: "Creators of The Witcher and Cyberpunk 2077",
    description: "CD Projekt Red is a Polish video game developer known for The Witcher series and Cyberpunk 2077. Founded in 2002, the studio is renowned for ambitious open-world RPGs with rich storytelling, deep player choices, and stunning visuals.",
    website: "https://www.cdprojektred.com",
    profileImageUrl: "https://images.igdb.com/igdb/image/upload/t_logo_med/cl4xx.png",
    genre: "Action RPG / Open World",
    platform: "PC, PlayStation, Xbox",
    teamSize: "1100+",
    location: "Warsaw, Poland",
    foundedYear: "2002",
    headquartersCountry: "Poland",
    city: "Warsaw",
    founders: ["Marcin Iwiński", "Michał Kiciński"],
    studioType: "AAA Studio",
    gameEngines: ["REDengine", "Unreal Engine 5"],
    supportedPlatforms: ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One"],
    publisherPartners: "Self-Published",
    fundingType: "Publicly Traded (WSE)",
    distributionChannels: ["Steam", "GOG", "Epic Games Store", "PlayStation Store", "Xbox Store"],
    socialLinks: { twitter: "https://twitter.com/CDPROJEKTRED", youtube: "https://youtube.com/@CDProjektRed" },
    recognitions: [
      { type: "Award", title: "Game of the Year - The Witcher 3", source: "The Game Awards 2015" }
    ],
    knownFor: "The Witcher 3: Wild Hunt, Cyberpunk 2077, The Witcher 2",
    games: [
      { name: "Cyberpunk 2077", publisher: "CD Projekt", status: "Released", releaseDate: "December 10, 2020", platforms: ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One"], engine: "REDengine 4", genre: "Action RPG / Open World", monetization: "Paid Game + DLC", description: "An open-world action RPG set in Night City, a megalopolis obsessed with power, glamour, and body modification." },
      { name: "The Witcher 3: Wild Hunt", publisher: "CD Projekt", status: "Released", releaseDate: "May 19, 2015", platforms: ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One", "Nintendo Switch"], engine: "REDengine 3", genre: "Action RPG / Open World", monetization: "Paid Game + DLC", description: "Geralt of Rivia embarks on an epic journey to find his adopted daughter, hunted by the supernatural Wild Hunt." },
      { name: "The Witcher 2: Assassins of Kings", publisher: "CD Projekt", status: "Released", releaseDate: "May 17, 2011", platforms: ["PC", "Xbox 360"], engine: "REDengine", genre: "Action RPG", monetization: "Paid Game", description: "Geralt navigates political intrigue and monster hunting in a dark fantasy world." },
      { name: "The Witcher IV", publisher: "CD Projekt", status: "In Development", releaseDate: "TBA", platforms: ["PC", "PlayStation 5", "Xbox Series X/S"], engine: "Unreal Engine 5", genre: "Action RPG / Open World", monetization: "Paid Game", description: "The next mainline entry in The Witcher saga, built on Unreal Engine 5." }
    ]
  },

  // ─── FROMSOFTWARE ───
  "FromSoftware": {
    tagline: "Masters of challenging action RPGs — Elden Ring & Dark Souls",
    description: "FromSoftware is a Japanese video game developer founded in 1986. Under Hidetaka Miyazaki, the studio redefined action RPGs with the Soulsborne genre. Known for punishing difficulty, cryptic storytelling, and meticulously designed worlds.",
    website: "https://www.fromsoftware.jp",
    profileImageUrl: "https://images.igdb.com/igdb/image/upload/t_logo_med/cl4xy.png",
    genre: "Action RPG / Souls-like",
    platform: "PC, PlayStation, Xbox",
    teamSize: "380+",
    location: "Tokyo, Japan",
    foundedYear: "1986",
    headquartersCountry: "Japan",
    city: "Tokyo",
    founders: ["Naotoshi Zin"],
    studioType: "AAA Studio",
    gameEngines: ["Proprietary Engine"],
    supportedPlatforms: ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One"],
    publisherPartners: "Bandai Namco, Sony Interactive Entertainment, Activision",
    fundingType: "Private (Kadokawa subsidiary)",
    distributionChannels: ["Steam", "PlayStation Store", "Xbox Store"],
    socialLinks: { twitter: "https://twitter.com/fromsoftware_pr" },
    recognitions: [
      { type: "Award", title: "Game of the Year - Elden Ring", source: "The Game Awards 2022" },
      { type: "Award", title: "Game of the Year - Sekiro", source: "The Game Awards 2019" }
    ],
    knownFor: "Elden Ring, Dark Souls, Bloodborne, Sekiro",
    games: [
      { name: "Elden Ring", publisher: "Bandai Namco", status: "Released", releaseDate: "February 25, 2022", platforms: ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One"], genre: "Action RPG / Open World", monetization: "Paid Game + DLC", description: "An action RPG set in the Lands Between, co-created with George R.R. Martin." },
      { name: "Sekiro: Shadows Die Twice", publisher: "Activision", status: "Released", releaseDate: "March 22, 2019", platforms: ["PC", "PlayStation 4", "Xbox One"], genre: "Action-Adventure", monetization: "Paid Game", description: "Sengoku-era action adventure focused on posture combat and stealth." },
      { name: "Bloodborne", publisher: "Sony Interactive Entertainment", status: "Released", releaseDate: "March 24, 2015", platforms: ["PlayStation 4"], genre: "Action RPG / Horror", monetization: "Paid Game + DLC", description: "Gothic Victorian horror action RPG set in the nightmare city of Yharnam." },
      { name: "Dark Souls III", publisher: "Bandai Namco", status: "Released", releaseDate: "April 12, 2016", platforms: ["PC", "PlayStation 4", "Xbox One"], genre: "Action RPG", monetization: "Paid Game + DLC", description: "The epic conclusion of the Dark Souls trilogy." }
    ]
  },

  // ─── SUPERGIANT GAMES ───
  "Supergiant Games": {
    tagline: "Small team, unforgettable games — Hades, Bastion, Transistor",
    description: "Supergiant Games is an independent game studio based in San Francisco, founded in 2009. Known for stunning hand-painted art, dynamic music by Darren Korb, and inventive gameplay mechanics.",
    website: "https://www.supergiantgames.com",
    profileImageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/59/Supergiant_Games_New_Logo.png",
    genre: "Action / RPG / Indie",
    platform: "PC, PlayStation, Xbox, Nintendo Switch",
    teamSize: "25",
    location: "San Francisco, USA",
    foundedYear: "2009",
    headquartersCountry: "USA",
    city: "San Francisco",
    founders: ["Amir Rao", "Gavin Simon"],
    studioType: "Indie Studio",
    gameEngines: ["Proprietary Engine"],
    supportedPlatforms: ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Nintendo Switch"],
    publisherPartners: "Self-Published",
    fundingType: "Private / Self-Funded",
    distributionChannels: ["Steam", "Epic Games Store", "PlayStation Store", "Nintendo eShop"],
    socialLinks: { twitter: "https://twitter.com/SupergiantGames" },
    recognitions: [
      { type: "Award", title: "Game of the Year - Hades", source: "BAFTA 2021" }
    ],
    knownFor: "Hades, Hades II, Bastion, Transistor, Pyre",
    games: [
      { name: "Hades II", publisher: "Supergiant Games", status: "Early Access", releaseDate: "May 6, 2024", platforms: ["PC"], genre: "Roguelike / Action", monetization: "Paid Game", description: "Play as Melinoë, Princess of the Underworld, to defeat the Titan of Time." },
      { name: "Hades", publisher: "Supergiant Games", status: "Released", releaseDate: "September 17, 2020", platforms: ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One", "Nintendo Switch"], genre: "Roguelike / Action", monetization: "Paid Game", description: "Defy the god of the dead as you hack and slash out of the Underworld." }
    ]
  },

  // ─── TEAM CHERRY ───
  "Team Cherry": {
    tagline: "Creators of Hollow Knight and Hollow Knight: Silksong",
    description: "Team Cherry is an Australian indie game studio based in Adelaide. They created Hollow Knight, a critically acclaimed Metroidvania with over 3 million copies sold.",
    website: "https://www.teamcherry.com.au",
    profileImageUrl: "https://images.igdb.com/igdb/image/upload/t_logo_med/cl4y0.png",
    genre: "Metroidvania / Action / Platformer",
    platform: "PC, PlayStation, Xbox, Nintendo Switch",
    teamSize: "3-5",
    location: "Adelaide, Australia",
    foundedYear: "2014",
    headquartersCountry: "Australia",
    city: "Adelaide",
    founders: ["Ari Gibson", "William Pellen"],
    studioType: "Indie Studio",
    gameEngines: ["Unity"],
    supportedPlatforms: ["PC", "PlayStation 4", "Xbox One", "Nintendo Switch"],
    publisherPartners: "Self-Published",
    fundingType: "Kickstarter / Self-Funded",
    distributionChannels: ["Steam", "GOG", "PlayStation Store", "Nintendo eShop"],
    socialLinks: { twitter: "https://twitter.com/TeamCherryGames" },
    knownFor: "Hollow Knight, Hollow Knight: Silksong",
    games: [
      { name: "Hollow Knight", publisher: "Team Cherry", status: "Released", releaseDate: "February 24, 2017", platforms: ["PC", "PlayStation 4", "Xbox One", "Nintendo Switch"], genre: "Metroidvania / Action", monetization: "Paid Game", description: "An epic action-adventure through a vast ruined kingdom of insects and heroes." },
      { name: "Hollow Knight: Silksong", publisher: "Team Cherry", status: "In Development", releaseDate: "TBA", platforms: ["PC", "Nintendo Switch"], genre: "Metroidvania / Action", monetization: "Paid Game", description: "Play as Hornet in an all-new adventure set in a haunted kingdom." }
    ]
  },

  // ─── NAUGHTY DOG ───
  "Naughty Dog": {
    tagline: "Sony's flagship narrative studio — The Last of Us & Uncharted",
    description: "Naughty Dog is an American first-party PlayStation studio founded in 1984. Renowned for cinematic storytelling, Crash Bandicoot, Jak and Daxter, Uncharted, and The Last of Us.",
    website: "https://www.naughtydog.com",
    profileImageUrl: "https://upload.wikimedia.org/wikipedia/en/b/b0/Naughty_Dog_logo.png",
    genre: "Action-Adventure / Narrative",
    platform: "PlayStation, PC",
    teamSize: "500+",
    location: "Santa Monica, California, USA",
    foundedYear: "1984",
    headquartersCountry: "USA",
    city: "Santa Monica",
    founders: ["Andy Gavin", "Jason Rubin"],
    studioType: "AAA First-Party Studio",
    gameEngines: ["Naughty Dog Engine"],
    supportedPlatforms: ["PlayStation 5", "PlayStation 4", "PC"],
    publisherPartners: "Sony Interactive Entertainment",
    fundingType: "Sony First-Party",
    distributionChannels: ["PlayStation Store", "Steam"],
    socialLinks: { twitter: "https://twitter.com/Naughty_Dog" },
    knownFor: "The Last of Us, Uncharted, Crash Bandicoot",
    games: [
      { name: "The Last of Us Part II", publisher: "Sony Interactive Entertainment", status: "Released", releaseDate: "June 19, 2020", platforms: ["PlayStation 4", "PlayStation 5", "PC"], genre: "Action-Adventure / Survival Horror", monetization: "Paid Game", description: "Ellie embarks on a relentless journey of revenge across post-pandemic America." },
      { name: "Uncharted 4: A Thief's End", publisher: "Sony Interactive Entertainment", status: "Released", releaseDate: "May 10, 2016", platforms: ["PlayStation 4", "PlayStation 5", "PC"], genre: "Action-Adventure", monetization: "Paid Game", description: "Nathan Drake's final treasure-hunting adventure." }
    ]
  },

  // ─── ROCKSTAR GAMES ───
  "Rockstar Games": {
    tagline: "Pioneers of open-world entertainment — GTA & Red Dead",
    description: "Rockstar Games is an American developer and publisher known for Grand Theft Auto and Red Dead Redemption, defining open-world gaming at unmatched scale.",
    website: "https://www.rockstargames.com",
    profileImageUrl: "https://images.igdb.com/igdb/image/upload/t_logo_med/cl4y2.png",
    genre: "Open World / Action-Adventure",
    platform: "PC, PlayStation, Xbox",
    teamSize: "2000+",
    location: "New York City, USA",
    foundedYear: "1998",
    headquartersCountry: "USA",
    city: "New York City",
    founders: ["Sam Houser", "Dan Houser", "Terry Donovan"],
    studioType: "AAA Publisher/Developer",
    gameEngines: ["RAGE Engine"],
    supportedPlatforms: ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One"],
    publisherPartners: "Take-Two Interactive",
    fundingType: "Publicly Traded (Take-Two)",
    distributionChannels: ["Rockstar Games Launcher", "Steam", "Epic Games Store", "PlayStation Store", "Xbox Store"],
    socialLinks: { twitter: "https://twitter.com/RockstarGames" },
    knownFor: "Grand Theft Auto V, Red Dead Redemption 2, GTA VI",
    games: [
      { name: "Grand Theft Auto VI", publisher: "Rockstar Games", status: "In Development", releaseDate: "Fall 2025", platforms: ["PlayStation 5", "Xbox Series X/S"], genre: "Open World / Action-Adventure", monetization: "Paid Game", description: "Set in Vice City, Leonida. Follow Lucia and her partner in Rockstar's biggest title yet." },
      { name: "Red Dead Redemption 2", publisher: "Rockstar Games", status: "Released", releaseDate: "October 26, 2018", platforms: ["PC", "PlayStation 4", "Xbox One"], genre: "Open World / Western", monetization: "Paid Game", description: "Arthur Morgan and the Van der Linde gang on the run at the end of the Wild West era." }
    ]
  },

  // ─── MOJANG STUDIOS ───
  "Mojang Studios": {
    tagline: "Home of Minecraft — Best-selling video game of all time",
    description: "Mojang Studios is a Swedish developer created in 2009. Creators of Minecraft, the best-selling game in history with over 300 million copies sold.",
    website: "https://www.minecraft.net",
    profileImageUrl: "https://images.igdb.com/igdb/image/upload/t_logo_med/cl4y3.png",
    genre: "Sandbox / Survival",
    platform: "PC, Mobile, Consoles",
    teamSize: "600+",
    location: "Stockholm, Sweden",
    foundedYear: "2009",
    headquartersCountry: "Sweden",
    city: "Stockholm",
    founders: ["Markus 'Notch' Persson", "Jakob Porsér"],
    studioType: "AAA First-Party Studio",
    gameEngines: ["Bedrock Engine"],
    supportedPlatforms: ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One", "Nintendo Switch", "iOS", "Android"],
    publisherPartners: "Xbox Game Studios",
    fundingType: "Microsoft First-Party",
    distributionChannels: ["Microsoft Store", "Steam", "PlayStation Store", "App Store", "Google Play"],
    socialLinks: { twitter: "https://twitter.com/Mojang" },
    knownFor: "Minecraft, Minecraft Dungeons, Minecraft Legends",
    games: [
      { name: "Minecraft", publisher: "Mojang Studios / Xbox Game Studios", status: "Released", releaseDate: "November 18, 2011", platforms: ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One", "Nintendo Switch", "iOS", "Android"], genre: "Sandbox / Survival", monetization: "Paid Game", description: "Build, explore, and survive in infinite blocky sandbox worlds." }
    ]
  }
};

// ── Appwrite Database Sync Functions ─────────────────────────────

async function findStudioDoc(name: string) {
  const existing = await databases.listDocuments(DB_ID, PROFILE_TABLE_ID, [
    Query.equal('status', 'approved'),
  ]);
  return existing.documents.find((doc: any) => {
    try {
      const data = typeof doc.profileData === 'string' ? JSON.parse(doc.profileData) : doc.profileData;
      return data?.name?.toLowerCase() === name.toLowerCase();
    } catch { return false; }
  });
}

async function addOrUpdateStudio(name: string): Promise<void> {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🏢 Processing Studio: "${name}"`);
  console.log(`${'═'.repeat(60)}`);

  const data = STUDIO_DATABASE[name];
  if (!data) {
    console.log(`⚠️  No detailed entry found for "${name}" in STUDIO_DATABASE.`);
    console.log(`   Creating basic record...`);
  }

  // Studio profile images disabled for now as requested
  const profileImageId = '';

  const projects = data?.games?.map(g => ({
    gameTitle: g.name,
    status: g.status || 'Released',
    platforms: g.platforms || ['PC'],
    projectPageUrl: '',
    shortDescription: g.description ? g.description.substring(0, 120) + '...' : '',
  })) || [];

  const profileData = JSON.stringify({
    name,
    tagline: data?.tagline || '',
    description: data?.description || '',
    website: data?.website || '',
    genre: data?.genre || '',
    platform: data?.platform || '',
    teamSize: data?.teamSize || '',
    location: data?.location || '',
    email: '',
    publicContactEmail: '',
    revenue: data?.financials?.[data.financials.length - 1]?.revenue || '',
    foundedYear: data?.foundedYear || '',
    tools: [],
    tags: [],
    studioType: data?.studioType || '',
    headquartersCountry: data?.headquartersCountry || '',
    city: data?.city || '',
    legalEntityName: data?.legalEntityName || '',
    registrationId: data?.registrationId || '',
    stockSymbol: data?.stockSymbol || '',
    languagesSupported: [],
    regionsServed: ['Global'],
    founders: data?.founders || [],
    parentCompany: data?.parentCompany || '',
    acquisitionStatus: data?.acquisitionStatus || 'Independent',
    acquiredBy: '',
    targetAudience: '',
    primaryExpertise: [],
    gameEngines: data?.gameEngines || [],
    deploymentType: '',
    supportedPlatforms: data?.supportedPlatforms || [],
    projects,
    lookingFor: [],
    openToPublishingDeals: false,
    publisherPartners: data?.publisherPartners || '',
    fundingType: data?.fundingType || '',
    latestFundingRound: '',
    totalFunding: '',
    distributionChannels: data?.distributionChannels || [],
    storeLinks: [],
    socialLinks: data?.socialLinks || {},
    recognitions: data?.recognitions || [],
    leadership: data?.leadership || [],
    financials: data?.financials || [],
    workforce: data?.workforce || {},
    whatChanged: data?.whatChanged || [],
    trailerVideoUrl: '',
    gameplayVideoUrl: '',
    knownFor: data?.knownFor || '',
    profileImageId,
  });

  const existingDoc = await findStudioDoc(name);
  const documentPayload = {
    userId: 'admin-team',
    status: 'approved',
    createdByTeam: true,
    createdAt: new Date().toISOString(),
    profileData,
  };

  if (existingDoc) {
    await databases.updateDocument(DB_ID, PROFILE_TABLE_ID, existingDoc.$id, documentPayload);
    console.log(`✅ Updated studio profile: ${name} (ID: ${existingDoc.$id})`);
  } else {
    const doc = await databases.createDocument(DB_ID, PROFILE_TABLE_ID, ID.unique(), documentPayload);
    console.log(`✅ Created studio profile: ${name} (ID: ${doc.$id})`);
  }

  // Process & Upload Games
  if (data?.games && data.games.length > 0) {
    console.log(`🎮 Processing ${data.games.length} game(s)...`);

    const existingGamesRes = await databases.listDocuments(DB_ID, GAMES_TABLE_ID, [
      Query.equal('status', 'approved'),
    ]);

    for (const game of data.games) {
      console.log(`  👉 Processing game: "${game.name}"...`);

      let logoImageId = '';
      if (game.logoImageUrl) {
        logoImageId = await uploadImageFromUrl(game.logoImageUrl, `${game.name}_cover`);
      }

      const gameData = JSON.stringify({
        name: game.name,
        developedBy: name,
        publisher: game.publisher || name,
        status: game.status || 'Released',
        releaseDate: game.releaseDate || 'TBA',
        platforms: game.platforms || ['PC'],
        engine: game.engine || (data.gameEngines?.[0] || ''),
        genre: game.genre || data.genre || '',
        monetization: game.monetization || 'Paid Game',
        description: game.description || '',
        metacritic: game.metacritic || '',
        verificationDate: game.verificationDate || 'Verified August 2026',
        keyFeatures: game.keyFeatures || [],
        recognitions: game.recognitions || [],
        whereToPlay: game.whereToPlay || [],
        tags: game.tags || [],
        logoImageId,
        trailerVideoUrl: game.trailerVideoUrl || '',
        gameplayVideoUrl: '',
      });

      const gameDocumentPayload = {
        userId: 'admin-team',
        status: 'approved',
        createdByTeam: true,
        createdAt: new Date().toISOString(),
        gameData,
      };

      const existingGame = existingGamesRes.documents.find((gDoc: any) => {
        try {
          const gData = typeof gDoc.gameData === 'string' ? JSON.parse(gDoc.gameData) : gDoc.gameData;
          return gData?.name?.toLowerCase() === game.name.toLowerCase();
        } catch { return false; }
      });

      if (existingGame) {
        await databases.updateDocument(DB_ID, GAMES_TABLE_ID, existingGame.$id, gameDocumentPayload);
        console.log(`  ✅ Updated game: ${game.name}`);
      } else {
        const gameDoc = await databases.createDocument(DB_ID, GAMES_TABLE_ID, ID.unique(), gameDocumentPayload);
        console.log(`  ✅ Created game: ${game.name} (ID: ${gameDoc.$id})`);
      }
    }
  }
}

// ── CLI Main ──────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`
🎮 Game Centralen — Add / Update Studio Profiles

Usage:
  npm run add-studio -- "Remedy Entertainment"
  npm run add-studios -- studios.txt
`);
    process.exit(0);
  }

  const studioNames: string[] = [];

  if (args.length === 0) {
    // Default to studios in studios.txt or STUDIO_DATABASE
    if (fs.existsSync('studios.txt')) {
      const lines = fs.readFileSync('studios.txt', 'utf-8')
        .split('\n')
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('#'));
      studioNames.push(...lines);
    } else {
      studioNames.push(...Object.keys(STUDIO_DATABASE));
    }
  } else {
    for (const arg of args) {
      if (arg.endsWith('.txt')) {
        const filePath = path.resolve(arg);
        if (fs.existsSync(filePath)) {
          const lines = fs.readFileSync(filePath, 'utf-8')
            .split('\n')
            .map(l => l.trim())
            .filter(l => l && !l.startsWith('#'));
          studioNames.push(...lines);
        }
      } else {
        studioNames.push(arg);
      }
    }
  }

  console.log(`🚀 Processing ${studioNames.length} studio(s)...\n`);

  let success = 0;
  let failed = 0;

  for (const name of studioNames) {
    try {
      await addOrUpdateStudio(name);
      success++;
    } catch (err: any) {
      console.error(`❌ Failed: ${name} — ${err.message}`);
      failed++;
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`✅ Done! ${success} processed, ${failed} failed.`);
  console.log(`${'═'.repeat(60)}\n`);
}

main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
