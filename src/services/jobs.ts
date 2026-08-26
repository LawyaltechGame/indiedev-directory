/**
 * Fetches jobs DIRECTLY from verified Game Studio career pages.
 *
 * Uses public APIs from Greenhouse, Lever, and Ashby.
 * Every listing is from an active game development studio and filtered for game-industry relevance.
 */

export interface JobListing {
  id: string;
  title: string;
  company: string;
  companyLogo: string | null;
  location: string;
  remote: boolean;
  type: string;
  salary: string | null;
  description: string;
  tags: string[];
  postedDate: string;
  applyUrl: string;
  source: string;
}

// ─── Verified Game Studios on Greenhouse ─────────────────────────────────────
const GREENHOUSE_STUDIOS: [string, string, string | null][] = [
  ['riotgames', 'Riot Games', 'https://logo.clearbit.com/riotgames.com'],
  ['roblox', 'Roblox', 'https://logo.clearbit.com/roblox.com'],
  ['epicgames', 'Epic Games', 'https://logo.clearbit.com/epicgames.com'],
  ['scopely', 'Scopely', 'https://logo.clearbit.com/scopely.com'],
  ['2k', '2K Games', 'https://logo.clearbit.com/2k.com'],
  ['remedy', 'Remedy Entertainment', 'https://logo.clearbit.com/remedygames.com'],
  ['bungie', 'Bungie', 'https://logo.clearbit.com/bungie.com'],
  ['bethesda', 'Bethesda Softworks', 'https://logo.clearbit.com/bethesda.net'],
  ['visualconcepts', 'Visual Concepts', 'https://logo.clearbit.com/vcfx.com'],
  ['firaxis', 'Firaxis Games', 'https://logo.clearbit.com/firaxis.com'],
  ['catdaddy', 'Cat Daddy Games', null],
  ['raven', 'Raven Software', 'https://logo.clearbit.com/ravensoftware.com'],
  ['gearbox', 'Gearbox Software', 'https://logo.clearbit.com/gearboxsoftware.com'],
  ['digitalextremes', 'Digital Extremes', 'https://logo.clearbit.com/digitalextremes.com'],
  ['housemarque', 'Housemarque', 'https://logo.clearbit.com/housemarque.com'],
];

// ─── Verified Game Studios on Lever ──────────────────────────────────────────
const LEVER_STUDIOS: [string, string, string | null][] = [
  ['kabam', 'Kabam', 'https://logo.clearbit.com/kabam.com'],
];

// ─── Verified Game Studios on Ashby ──────────────────────────────────────────
const ASHBY_STUDIOS: [string, string, string | null][] = [
  ['thatgamecompany', 'thatgamecompany', 'https://logo.clearbit.com/thatgamecompany.com'],
  ['seconddinner', 'Second Dinner', 'https://logo.clearbit.com/seconddinner.com'],
  ['voodoo', 'Voodoo', 'https://logo.clearbit.com/voodoo.io'],
  ['believer', 'Believer', null],
  ['lightspeed', 'Lightspeed Studios', null],
  ['yotta', 'Yotta Games', null],
];

// ─── Non-Gaming Corporate Role Filter ────────────────────────────────────────
// Exclude purely administrative / bureaucratic corporate roles
const NON_GAME_TITLE_PATTERNS = [
  /\bpublic policy\b/i,
  /\blaw enforcement\b/i,
  /\bgovernment affairs\b/i,
  /\bgovernment relations\b/i,
  /\bparalegal\b/i,
  /\blitigation\b/i,
  /\bcorporate tax\b/i,
  /\bpayroll\b/i,
  /\bfacilities manager\b/i,
  /\bworkplace operations\b/i,
  /\bdata center asset\b/i,
  /\bjanitor\b/i,
  /\bbenefits analyst\b/i,
  /\bprocurement specialist\b/i,
  /\bsox compliance\b/i,
];

function isGameRelevantJob(title: string): boolean {
  return !NON_GAME_TITLE_PATTERNS.some(pattern => pattern.test(title));
}

// ─── Greenhouse Fetcher ──────────────────────────────────────────────────────
async function fetchGreenhouseJobs(
  boardToken: string,
  studioName: string,
  logoUrl: string | null
): Promise<JobListing[]> {
  try {
    const url = `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs?content=true`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const jobs: any[] = data?.jobs || [];

    return jobs
      .filter((j: any) => isGameRelevantJob(j.title || ''))
      .map((j: any): JobListing => {
        const loc = j.location?.name || 'Not specified';
        const isRemote = /remote/i.test(loc) || /remote/i.test(j.title || '');
        const dept = j.departments?.[0]?.name || '';

        return {
          id: `gh-${boardToken}-${j.id}`,
          title: (j.title || 'Untitled').trim(),
          company: studioName,
          companyLogo: logoUrl,
          location: loc,
          remote: isRemote,
          type: 'Full-Time',
          salary: null,
          description: stripHtml(j.content || '').slice(0, 600),
          tags: [dept, ...extractTags(j.title)].filter(Boolean).slice(0, 5),
          postedDate: formatDate(j.updated_at || j.created_at),
          applyUrl: j.absolute_url || `https://boards.greenhouse.io/${boardToken}/jobs/${j.id}`,
          source: studioName,
        };
      });
  } catch {
    return [];
  }
}

// ─── Lever Fetcher ───────────────────────────────────────────────────────────
async function fetchLeverJobs(
  companySlug: string,
  studioName: string,
  logoUrl: string | null
): Promise<JobListing[]> {
  try {
    const url = `https://api.lever.co/v0/postings/${companySlug}?mode=json`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const jobs: any[] = await res.json();
    if (!Array.isArray(jobs)) return [];

    return jobs
      .filter((j: any) => isGameRelevantJob(j.text || ''))
      .map((j: any): JobListing => {
        const loc = j.categories?.location || 'Not specified';
        const isRemote = /remote/i.test(loc) || /remote/i.test(j.workplaceType || '') || /remote/i.test(j.text || '');
        const dept = j.categories?.department || j.categories?.team || '';
        const commitment = j.categories?.commitment || 'Full-Time';

        return {
          id: `lever-${companySlug}-${j.id}`,
          title: (j.text || 'Untitled').trim(),
          company: studioName,
          companyLogo: logoUrl,
          location: loc,
          remote: isRemote,
          type: commitment,
          salary: j.salaryRange ? `${j.salaryRange.min} – ${j.salaryRange.max} ${j.salaryRange.currency || ''}`.trim() : null,
          description: stripHtml(j.descriptionPlain || j.description || '').slice(0, 600),
          tags: [dept, ...extractTags(j.text)].filter(Boolean).slice(0, 5),
          postedDate: formatDate(j.createdAt),
          applyUrl: j.hostedUrl || j.applyUrl || '#',
          source: studioName,
        };
      });
  } catch {
    return [];
  }
}

// ─── Ashby Fetcher ───────────────────────────────────────────────────────────
async function fetchAshbyJobs(
  boardSlug: string,
  studioName: string,
  logoUrl: string | null
): Promise<JobListing[]> {
  try {
    const url = `https://api.ashbyhq.com/posting-api/job-board/${boardSlug}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const jobs: any[] = data?.jobs || [];

    return jobs
      .filter((j: any) => isGameRelevantJob(j.title || ''))
      .map((j: any): JobListing => {
        const loc = j.location || (j.address?.postalAddress ? `${j.address.postalAddress.addressLocality || ''}, ${j.address.postalAddress.addressCountry || ''}` : 'Not specified');
        const isRemote = j.isRemote === true || /remote/i.test(loc) || /remote/i.test(j.title || '');
        const dept = j.department || j.team || '';

        return {
          id: `ashby-${boardSlug}-${j.id}`,
          title: (j.title || 'Untitled').trim(),
          company: studioName,
          companyLogo: logoUrl,
          location: loc,
          remote: isRemote,
          type: j.employmentType ? formatEmploymentType(j.employmentType) : 'Full-Time',
          salary: null,
          description: stripHtml(j.descriptionPlain || j.descriptionHtml || '').slice(0, 600),
          tags: [dept, ...extractTags(j.title)].filter(Boolean).slice(0, 5),
          postedDate: formatDate(j.publishedAt),
          applyUrl: j.applyUrl || j.jobUrl || '#',
          source: studioName,
        };
      });
  } catch {
    return [];
  }
}

// ─── Main fetch function ─────────────────────────────────────────────────────

export async function fetchJobs(search?: string): Promise<JobListing[]> {
  // Try serverless aggregator first (faster on Vercel deployment)
  try {
    const params = new URLSearchParams();
    if (search?.trim()) params.set('search', search.trim());
    params.set('limit', '300');
    const res = await fetch(`/api/jobs?${params}`);
    if (res.ok) {
      const data = await res.json();
      if (data.jobs && data.jobs.length > 5) return data.jobs;
    }
  } catch { /* fall through to direct fetch */ }

  // Direct fetch from all studio career pages
  const promises: Promise<JobListing[]>[] = [];

  for (const [token, name, logo] of GREENHOUSE_STUDIOS) {
    promises.push(fetchGreenhouseJobs(token, name, logo));
  }
  for (const [slug, name, logo] of LEVER_STUDIOS) {
    promises.push(fetchLeverJobs(slug, name, logo));
  }
  for (const [slug, name, logo] of ASHBY_STUDIOS) {
    promises.push(fetchAshbyJobs(slug, name, logo));
  }

  const results = await Promise.allSettled(promises);
  let allJobs: JobListing[] = [];

  for (const r of results) {
    if (r.status === 'fulfilled') allJobs.push(...r.value);
  }

  // Apply search filter if provided
  if (search?.trim()) {
    const q = search.toLowerCase();
    allJobs = allJobs.filter(j => {
      const text = `${j.title} ${j.company} ${j.location} ${j.tags.join(' ')} ${j.description}`.toLowerCase();
      return text.includes(q);
    });
  }

  // Deduplicate and sort
  return deduplicateAndSort(allJobs);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractTags(title: string): string[] {
  const tags: string[] = [];
  const t = (title || '').toLowerCase();
  const checks: [string, string][] = [
    ['unity', 'Unity'], ['unreal', 'Unreal'], ['c++', 'C++'], ['c#', 'C#'],
    ['python', 'Python'], ['java', 'Java'], ['rust', 'Rust'], ['react', 'React'],
    ['gameplay', 'Gameplay'], ['combat', 'Combat'], ['systems', 'Systems'],
    ['level design', 'Level Design'], ['narrative', 'Narrative'],
    ['artist', 'Art'], ['character', 'Character Art'], ['environment', 'Environment Art'],
    ['animation', 'Animation'], ['animator', 'Animation'], ['vfx', 'VFX'], ['ui', 'UI/UX'],
    ['designer', 'Design'], ['sound', 'Audio'], ['audio', 'Audio'],
    ['producer', 'Production'], ['qa', 'QA'], ['test', 'QA'],
    ['mobile', 'Mobile'], ['graphics', 'Graphics/Rendering'], ['shader', 'Shaders'],
    ['engine', 'Engine'], ['network', 'Netcode'], ['multiplayer', 'Multiplayer'],
    ['marketing', 'Marketing'], ['community', 'Community'],
  ];
  for (const [kw, tag] of checks) {
    if (t.includes(kw) && !tags.includes(tag)) tags.push(tag);
  }
  return tags;
}

function formatEmploymentType(t: string): string {
  if (/full/i.test(t)) return 'Full-Time';
  if (/part/i.test(t)) return 'Part-Time';
  if (/contract/i.test(t)) return 'Contract';
  if (/intern/i.test(t)) return 'Internship';
  if (/freelance/i.test(t)) return 'Freelance';
  return 'Full-Time';
}

function deduplicateAndSort(jobs: JobListing[]): JobListing[] {
  const seen = new Set<string>();
  const unique: JobListing[] = [];
  for (const job of jobs) {
    const key = `${job.title.toLowerCase().replace(/[^a-z0-9]/g, '')}|${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    if (key.length > 2 && !seen.has(key)) {
      seen.add(key);
      unique.push(job);
    }
  }
  // Sort: most recent first
  const order = ['Today', '1 day ago', '2 days ago', '3 days ago', '4 days ago', '5 days ago', '6 days ago', '1 week ago'];
  unique.sort((a, b) => {
    const ai = order.indexOf(a.postedDate), bi = order.indexOf(b.postedDate);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return 0;
  });
  return unique;
}

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#039;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function stripHtml(html: string): string {
  if (!html) return '';
  // Decode HTML entities first so encoded tags (&lt;div&gt;) are recognized
  let text = decodeHtmlEntities(html);
  // Remove script and style tags and contents
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ');
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ');
  // Remove all HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  // Decode any remaining entities
  text = decodeHtmlEntities(text);
  // Collapse multiple whitespaces and trim
  return text.replace(/\s+/g, ' ').trim();
}

function formatDate(d: string | number | undefined | null): string {
  try {
    if (!d) return 'Recently';
    const date = typeof d === 'number' ? new Date(d) : new Date(d);
    if (isNaN(date.getTime())) return 'Recently';
    const diff = Math.floor((Date.now() - date.getTime()) / 86400000);
    if (diff <= 0) return 'Today';
    if (diff === 1) return '1 day ago';
    if (diff < 7) return `${diff} days ago`;
    if (diff < 14) return '1 week ago';
    if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
    if (diff < 60) return '1 month ago';
    return `${Math.floor(diff / 30)} months ago`;
  } catch { return 'Recently'; }
}
