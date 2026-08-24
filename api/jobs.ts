import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * /api/jobs — Aggregates game & tech job listings from 5 free public APIs.
 * Uses multiple search queries per source to maximize coverage.
 *
 * Sources (all free, no API key required):
 *  1. Remotive    2. Himalayas    3. Jobicy    4. Arbeitnow    5. RemoteOK
 *
 * Query params:
 *   search  — keyword filter (optional, defaults to broad game-dev terms)
 *   limit   — max results (default 100, max 200)
 */

interface NormalizedJob {
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

const DEFAULT_SEARCHES = ['game', 'gaming', 'unity', 'unreal', 'game developer', 'game designer', '3d artist', 'gameplay'];

// ─── Remotive ────────────────────────────────────────────────────────────────
async function fetchRemotive(search: string): Promise<NormalizedJob[]> {
  try {
    const res = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(search)}&limit=50`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.jobs || []).map((j: any) => ({
      id: `remotive-${j.id}`,
      title: j.title || '',
      company: j.company_name || '',
      companyLogo: j.company_logo || null,
      location: j.candidate_required_location || 'Remote',
      remote: true,
      type: fmtType(j.job_type),
      salary: j.salary?.trim() || null,
      description: strip(j.description || '').slice(0, 500),
      tags: (j.tags || []).slice(0, 6),
      postedDate: j.publication_date || '',
      applyUrl: j.url || '#',
      source: 'Remotive',
    }));
  } catch { return []; }
}

// ─── Himalayas ───────────────────────────────────────────────────────────────
async function fetchHimalayas(search: string): Promise<NormalizedJob[]> {
  try {
    const res = await fetch(`https://himalayas.app/jobs/api?q=${encodeURIComponent(search)}&limit=50`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.jobs || []).map((j: any) => {
      let salary: string | null = null;
      if (j.minSalary && j.maxSalary) salary = `$${Math.round(j.minSalary/1000)}k – $${Math.round(j.maxSalary/1000)}k`;
      return {
        id: `himalayas-${j.id || rnd()}`,
        title: j.title || '',
        company: j.companyName || '',
        companyLogo: j.companyLogo || null,
        location: j.location || 'Worldwide',
        remote: true,
        type: j.employmentType || 'Full-Time',
        salary,
        description: strip(j.description || j.excerpt || '').slice(0, 500),
        tags: (j.categories || j.tags || []).slice(0, 6),
        postedDate: j.pubDate ? new Date(j.pubDate * 1000).toISOString() : '',
        applyUrl: j.applicationLink || j.url || '#',
        source: 'Himalayas',
      };
    });
  } catch { return []; }
}

// ─── Jobicy ──────────────────────────────────────────────────────────────────
async function fetchJobicy(search: string): Promise<NormalizedJob[]> {
  try {
    const tag = search.split(/\s+/)[0] || 'game';
    const res = await fetch(`https://jobicy.com/api/v2/remote-jobs?tag=${encodeURIComponent(tag)}&count=50`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.jobs || []).map((j: any) => ({
      id: `jobicy-${j.id || rnd()}`,
      title: j.jobTitle || '',
      company: j.companyName || '',
      companyLogo: j.companyLogo || null,
      location: j.jobGeo || 'Remote',
      remote: true,
      type: Array.isArray(j.jobType) ? j.jobType[0] || 'Full-Time' : j.jobType || 'Full-Time',
      salary: j.annualSalaryMin && j.annualSalaryMax
        ? `$${Math.round(j.annualSalaryMin/1000)}k – $${Math.round(j.annualSalaryMax/1000)}k` : null,
      description: strip(j.jobExcerpt || j.jobDescription || '').slice(0, 500),
      tags: (j.jobIndustry || []).slice(0, 6),
      postedDate: j.pubDate || '',
      applyUrl: j.url || '#',
      source: 'Jobicy',
    }));
  } catch { return []; }
}

// ─── Arbeitnow (3 pages) ────────────────────────────────────────────────────
async function fetchArbeitnow(search: string): Promise<NormalizedJob[]> {
  const results: NormalizedJob[] = [];
  const keywords = ['game', 'developer', 'engineer', 'designer', 'artist', 'software', 'unity', 'unreal',
    'frontend', 'backend', 'data', 'product', 'mobile', 'devops', 'cloud', 'marketing',
    ...(search ? [search.toLowerCase()] : [])];
  try {
    for (const page of [1, 2, 3]) {
      const res = await fetch(`https://www.arbeitnow.com/api/job-board-api?page=${page}`);
      if (!res.ok) continue;
      const data = await res.json();
      for (const j of (data?.data || [])) {
        const text = `${j.title || ''} ${(j.tags || []).join(' ')}`.toLowerCase();
        if (keywords.some(kw => text.includes(kw))) {
          results.push({
            id: `arbeitnow-${j.slug || rnd()}`,
            title: j.title || '',
            company: j.company_name || '',
            companyLogo: j.company_logo || null,
            location: j.location || '',
            remote: j.remote === true,
            type: 'Full-Time',
            salary: null,
            description: strip(j.description || '').slice(0, 500),
            tags: (j.tags || []).slice(0, 6),
            postedDate: j.created_at ? new Date(j.created_at * 1000).toISOString() : '',
            applyUrl: j.url || '#',
            source: 'Arbeitnow',
          });
        }
      }
    }
  } catch { /* ignore */ }
  return results;
}

// ─── RemoteOK ────────────────────────────────────────────────────────────────
async function fetchRemoteOK(search: string): Promise<NormalizedJob[]> {
  try {
    const tag = search.split(/\s+/)[0] || 'dev';
    const res = await fetch(`https://remoteok.com/api?tag=${encodeURIComponent(tag)}`, {
      headers: { 'User-Agent': 'GameCentralen/1.0' },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (Array.isArray(data) ? data.slice(1) : []).map((j: any) => ({
      id: `remoteok-${j.id || rnd()}`,
      title: j.position || j.title || '',
      company: j.company || '',
      companyLogo: j.company_logo || j.logo || null,
      location: j.location || 'Remote',
      remote: true,
      type: 'Full-Time',
      salary: j.salary_min && j.salary_max
        ? `$${Math.round(j.salary_min/1000)}k – $${Math.round(j.salary_max/1000)}k` : null,
      description: strip(j.description || '').slice(0, 500),
      tags: (j.tags || []).slice(0, 6),
      postedDate: j.date || '',
      applyUrl: j.url || j.apply_url || '#',
      source: 'RemoteOK',
    }));
  } catch { return []; }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const rnd = () => Math.random().toString(36).slice(2);

function strip(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/&\w+;/g, ' ').replace(/\s+/g, ' ').trim();
}

function fmtType(t: string): string {
  if (!t) return 'Full-Time';
  const m: Record<string, string> = { full_time: 'Full-Time', part_time: 'Part-Time', contract: 'Contract', freelance: 'Freelance', internship: 'Internship' };
  return m[t.toLowerCase()] || t;
}

function fmtDate(d: string): string {
  try {
    if (!d) return 'Recently';
    const date = new Date(d);
    if (isNaN(date.getTime())) return 'Recently';
    const diff = Math.floor((Date.now() - date.getTime()) / 86400000);
    if (diff < 0) return 'Today';
    if (diff === 0) return 'Today';
    if (diff === 1) return '1 day ago';
    if (diff < 7) return `${diff} days ago`;
    if (diff < 14) return '1 week ago';
    if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
    if (diff < 60) return '1 month ago';
    return `${Math.floor(diff / 30)} months ago`;
  } catch { return 'Recently'; }
}

// ─── Handler ─────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userSearch = (req.query.search as string) || '';
  const limit = Math.min(parseInt((req.query.limit as string) || '100', 10), 200);
  const searches = userSearch ? [userSearch] : DEFAULT_SEARCHES;

  // Build all fetch promises — multiple queries per source
  const promises: Promise<NormalizedJob[]>[] = [];

  for (const s of searches.slice(0, 5)) promises.push(fetchRemotive(s));
  for (const s of searches.slice(0, 4)) promises.push(fetchHimalayas(s));
  for (const s of searches.slice(0, 3)) promises.push(fetchJobicy(s));
  promises.push(fetchArbeitnow(userSearch));
  for (const s of searches.slice(0, 3)) promises.push(fetchRemoteOK(s));

  const results = await Promise.allSettled(promises);
  const all: NormalizedJob[] = [];
  const sourceCounts: Record<string, number> = {};

  for (const r of results) {
    if (r.status === 'fulfilled') {
      for (const job of r.value) {
        all.push(job);
        sourceCounts[job.source] = (sourceCounts[job.source] || 0) + 1;
      }
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  const unique: NormalizedJob[] = [];
  for (const job of all) {
    const key = `${job.title.toLowerCase().replace(/[^a-z0-9]/g, '')}|${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    if (key.length > 2 && !seen.has(key)) {
      seen.add(key);
      job.postedDate = fmtDate(job.postedDate);
      unique.push(job);
    }
  }

  // Sort by recency
  const order = ['Today', '1 day ago', '2 days ago', '3 days ago', '4 days ago', '5 days ago', '6 days ago', '1 week ago'];
  unique.sort((a, b) => {
    const ai = order.indexOf(a.postedDate), bi = order.indexOf(b.postedDate);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return 0;
  });

  const result = unique.slice(0, limit);

  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=300');
  return res.status(200).json({
    total: result.length,
    totalBeforeDedup: all.length,
    sources: sourceCounts,
    jobs: result,
  });
}
