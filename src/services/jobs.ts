/**
 * Service for fetching game development jobs from multiple free public APIs.
 * 
 * Architecture:
 * - In production: calls /api/jobs serverless endpoint (aggregates 5 sources)
 * - Fallback: calls all APIs directly from the browser (all support CORS)
 * 
 * Uses multiple search terms to maximise coverage of game dev roles.
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

// Multiple search queries to cast a wide net for game-related roles
const GAME_SEARCH_TERMS = [
  'game',
  'gaming',
  'unity',
  'unreal',
  'game developer',
  'game designer',
  'game artist',
  '3d artist',
  'game producer',
  'gameplay',
];

/**
 * Fetch jobs — tries serverless aggregator first, falls back to direct multi-API fetch.
 */
export async function fetchJobs(search?: string): Promise<JobListing[]> {
  // Try the serverless aggregator first
  try {
    const params = new URLSearchParams();
    if (search && search.trim()) {
      params.set('search', search.trim());
    }
    params.set('limit', '100');

    const url = `/api/jobs?${params.toString()}`;
    const res = await fetch(url);

    if (res.ok) {
      const data = await res.json();
      if (data.jobs && data.jobs.length > 5) {
        return data.jobs;
      }
    }
  } catch {
    // Serverless not available — fall through to direct fetch
  }

  // Direct multi-API fetch (works from browser — all APIs support CORS)
  return fetchAllSourcesDirectly(search);
}

/**
 * Fetch from all 5 APIs directly from the browser.
 * Uses multiple search terms to maximize results.
 */
async function fetchAllSourcesDirectly(search?: string): Promise<JobListing[]> {
  const terms = search?.trim()
    ? [search.trim()]
    : GAME_SEARCH_TERMS;

  // Launch all fetches concurrently
  const promises: Promise<JobListing[]>[] = [];

  // Remotive — multiple searches for broader coverage
  for (const term of terms.slice(0, 5)) {
    promises.push(fetchRemotive(term));
  }

  // Himalayas — strong search support
  for (const term of terms.slice(0, 4)) {
    promises.push(fetchHimalayas(term));
  }

  // Jobicy — tag-based
  for (const term of terms.slice(0, 3)) {
    promises.push(fetchJobicy(term));
  }

  // Arbeitnow — full feed filtered client-side
  promises.push(fetchArbeitnow(search || ''));

  // RemoteOK — tag-based
  for (const term of terms.slice(0, 3)) {
    promises.push(fetchRemoteOK(term));
  }

  const results = await Promise.allSettled(promises);
  const allJobs: JobListing[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allJobs.push(...result.value);
    }
  }

  // Deduplicate by normalized title + company
  return deduplicateJobs(allJobs);
}

// ─── Remotive ────────────────────────────────────────────────────────────────
async function fetchRemotive(search: string): Promise<JobListing[]> {
  try {
    const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(search)}&limit=50`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.jobs || []).map((j: any): JobListing => ({
      id: `remotive-${j.id}`,
      title: j.title || 'Untitled',
      company: j.company_name || 'Unknown',
      companyLogo: j.company_logo || null,
      location: j.candidate_required_location || 'Remote',
      remote: true,
      type: formatType(j.job_type),
      salary: j.salary && j.salary.trim() !== '' ? j.salary : null,
      description: stripHtml(j.description || '').slice(0, 500),
      tags: (j.tags || []).slice(0, 6),
      postedDate: formatDate(j.publication_date),
      applyUrl: j.url || '#',
      source: 'Remotive',
    }));
  } catch {
    return [];
  }
}

// ─── Himalayas ───────────────────────────────────────────────────────────────
async function fetchHimalayas(search: string): Promise<JobListing[]> {
  try {
    const url = `https://himalayas.app/jobs/api?q=${encodeURIComponent(search)}&limit=50`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.jobs || []).map((j: any): JobListing => {
      let salary: string | null = null;
      if (j.minSalary && j.maxSalary) {
        salary = `$${Math.round(j.minSalary / 1000)}k – $${Math.round(j.maxSalary / 1000)}k`;
      } else if (j.minSalary) {
        salary = `From $${Math.round(j.minSalary / 1000)}k`;
      }
      return {
        id: `himalayas-${j.id || Math.random().toString(36).slice(2)}`,
        title: j.title || 'Untitled',
        company: j.companyName || 'Unknown',
        companyLogo: j.companyLogo || null,
        location: j.location || (j.worldwide ? 'Worldwide' : 'Remote'),
        remote: true,
        type: j.employmentType || 'Full-Time',
        salary,
        description: stripHtml(j.description || j.excerpt || '').slice(0, 500),
        tags: (j.categories || j.tags || []).slice(0, 6),
        postedDate: j.pubDate ? formatDate(new Date(j.pubDate * 1000).toISOString()) : 'Recently',
        applyUrl: j.applicationLink || j.url || '#',
        source: 'Himalayas',
      };
    });
  } catch {
    return [];
  }
}

// ─── Jobicy ──────────────────────────────────────────────────────────────────
async function fetchJobicy(search: string): Promise<JobListing[]> {
  try {
    const tag = search.split(/\s+/)[0] || 'game';
    const url = `https://jobicy.com/api/v2/remote-jobs?tag=${encodeURIComponent(tag)}&count=50`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.jobs || []).map((j: any): JobListing => {
      let salary: string | null = null;
      if (j.annualSalaryMin && j.annualSalaryMax) {
        salary = `$${Math.round(j.annualSalaryMin / 1000)}k – $${Math.round(j.annualSalaryMax / 1000)}k`;
      }
      return {
        id: `jobicy-${j.id || Math.random().toString(36).slice(2)}`,
        title: j.jobTitle || 'Untitled',
        company: j.companyName || 'Unknown',
        companyLogo: j.companyLogo || null,
        location: j.jobGeo || 'Remote',
        remote: true,
        type: Array.isArray(j.jobType) ? j.jobType[0] || 'Full-Time' : j.jobType || 'Full-Time',
        salary,
        description: stripHtml(j.jobExcerpt || j.jobDescription || '').slice(0, 500),
        tags: (j.jobIndustry || []).slice(0, 6),
        postedDate: formatDate(j.pubDate),
        applyUrl: j.url || '#',
        source: 'Jobicy',
      };
    });
  } catch {
    return [];
  }
}

// ─── Arbeitnow ───────────────────────────────────────────────────────────────
async function fetchArbeitnow(search: string): Promise<JobListing[]> {
  try {
    // Fetch multiple pages for more results
    const pages = [1, 2, 3];
    const allJobs: JobListing[] = [];

    for (const page of pages) {
      try {
        const url = `https://www.arbeitnow.com/api/job-board-api?page=${page}`;
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        const jobs: any[] = data?.data || [];

        // Filter for game/tech related jobs
        const searchLower = (search || '').toLowerCase();
        const keywords = [
          'game', 'gaming', 'unity', 'unreal', 'godot', '3d', 'gameplay',
          'developer', 'engineer', 'designer', 'artist', 'programmer',
          'software', 'frontend', 'backend', 'fullstack', 'mobile',
          'devops', 'cloud', 'data', 'machine learning', 'ai',
          'product', 'project manager', 'marketing', 'content',
          ...(searchLower ? [searchLower] : []),
        ];

        const filtered = jobs.filter((j: any) => {
          const text = `${j.title || ''} ${(j.tags || []).join(' ')}`.toLowerCase();
          return keywords.some(kw => text.includes(kw));
        });

        allJobs.push(...filtered.map((j: any): JobListing => ({
          id: `arbeitnow-${j.slug || Math.random().toString(36).slice(2)}`,
          title: j.title || 'Untitled',
          company: j.company_name || 'Unknown',
          companyLogo: j.company_logo || null,
          location: j.location || 'Not specified',
          remote: j.remote === true,
          type: 'Full-Time',
          salary: null,
          description: stripHtml(j.description || '').slice(0, 500),
          tags: (j.tags || []).slice(0, 6),
          postedDate: j.created_at ? formatDate(new Date(j.created_at * 1000).toISOString()) : 'Recently',
          applyUrl: j.url || '#',
          source: 'Arbeitnow',
        })));
      } catch {
        continue;
      }
    }

    return allJobs;
  } catch {
    return [];
  }
}

// ─── RemoteOK ────────────────────────────────────────────────────────────────
async function fetchRemoteOK(search: string): Promise<JobListing[]> {
  try {
    const tag = search.split(/\s+/)[0] || 'dev';
    const url = `https://remoteok.com/api?tag=${encodeURIComponent(tag)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'GameCentralen/1.0' },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const jobs: any[] = Array.isArray(data) ? data.slice(1) : [];

    return jobs.map((j: any): JobListing => {
      let salary: string | null = null;
      if (j.salary_min && j.salary_max) {
        salary = `$${Math.round(j.salary_min / 1000)}k – $${Math.round(j.salary_max / 1000)}k`;
      }
      return {
        id: `remoteok-${j.id || Math.random().toString(36).slice(2)}`,
        title: j.position || j.title || 'Untitled',
        company: j.company || 'Unknown',
        companyLogo: j.company_logo || j.logo || null,
        location: j.location || 'Remote',
        remote: true,
        type: 'Full-Time',
        salary,
        description: stripHtml(j.description || '').slice(0, 500),
        tags: (j.tags || []).slice(0, 6),
        postedDate: formatDate(j.date),
        applyUrl: j.url || j.apply_url || '#',
        source: 'RemoteOK',
      };
    });
  } catch {
    return [];
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function deduplicateJobs(jobs: JobListing[]): JobListing[] {
  const seen = new Set<string>();
  const unique: JobListing[] = [];

  for (const job of jobs) {
    // Normalize for dedup
    const key = `${job.title.toLowerCase().replace(/[^a-z0-9]/g, '')}|${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(job);
    }
  }

  // Sort: most recent first
  const recencyOrder = ['Today', '1 day ago', '2 days ago', '3 days ago', '4 days ago', '5 days ago', '6 days ago', '1 week ago'];
  unique.sort((a, b) => {
    const aIdx = recencyOrder.indexOf(a.postedDate);
    const bIdx = recencyOrder.indexOf(b.postedDate);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return 0;
  });

  return unique;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function formatType(type: string): string {
  if (!type) return 'Full-Time';
  const map: Record<string, string> = {
    full_time: 'Full-Time',
    part_time: 'Part-Time',
    contract: 'Contract',
    freelance: 'Freelance',
    internship: 'Internship',
  };
  return map[type.toLowerCase()] || type;
}

function formatDate(dateStr: string | undefined | null): string {
  try {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Recently';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Today';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 60) return '1 month ago';
    return `${Math.floor(diffDays / 30)} months ago`;
  } catch {
    return 'Recently';
  }
}
