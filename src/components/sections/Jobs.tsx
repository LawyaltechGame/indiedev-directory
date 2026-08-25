import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useHasProfile } from '../../hooks/useHasProfile';
import { AccountMenu } from '../ui/AccountMenu';
import { fetchJobs, type JobListing } from '../../services/jobs';

// ─── Types ──────────────────────────────────────────────────────────────────
type JobCategory = 'All' | 'Programming' | 'Art & Design' | 'Audio' | 'Game Design' | 'Production' | 'QA' | 'Marketing' | 'Community';

interface JobsProps {
  onCreateProfile?: () => void;
  onOpenSignup?: () => void;
  onEditProfile?: () => void;
}

const CATEGORIES: JobCategory[] = ['All', 'Programming', 'Art & Design', 'Audio', 'Game Design', 'Production', 'QA', 'Marketing', 'Community'];

const TYPE_COLORS: Record<string, string> = {
  'Full-Time': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  'Part-Time': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  'Contract': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'Freelance': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'Internship': 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  'Other': 'bg-white/10 text-white/70 border-white/20',
};

// Category keyword matching
const CATEGORY_KEYWORDS: Record<JobCategory, string[]> = {
  'All': [],
  'Programming': ['developer', 'engineer', 'programmer', 'software', 'backend', 'frontend', 'fullstack', 'full-stack', 'devops', 'unity', 'unreal', 'c++', 'c#', 'godot', 'rust', 'python', 'javascript', 'typescript', 'react', 'node'],
  'Art & Design': ['artist', 'art', 'design', 'designer', 'ui', 'ux', '2d', '3d', 'graphic', 'visual', 'illustrat', 'animator', 'animation', 'modeler', 'modeling', 'concept', 'texture', 'environment art', 'character art'],
  'Audio': ['audio', 'sound', 'music', 'composer', 'acoustic', 'voice', 'sfx', 'wwise', 'fmod'],
  'Game Design': ['game design', 'level design', 'narrative design', 'systems design', 'quest design', 'game mechanic', 'gameplay', 'world build'],
  'Production': ['producer', 'production', 'project manager', 'scrum', 'agile', 'program manager', 'coordinator'],
  'QA': ['qa', 'quality assurance', 'test', 'testing', 'tester', 'bug'],
  'Marketing': ['marketing', 'growth', 'acquisition', 'campaign', 'brand', 'content market', 'seo', 'analytics', 'copywriter'],
  'Community': ['community', 'social media', 'discord', 'moderator', 'support', 'customer success', 'engagement'],
};

function categorizeJob(job: JobListing): JobCategory {
  const titleText = `${job.title} ${(job.tags || []).join(' ')}`.toLowerCase();
  const descText = (job.description || '').toLowerCase();
  let bestMatch: JobCategory = 'Programming';
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'All') continue;
    let score = 0;
    for (const kw of keywords) {
      const lower = kw.toLowerCase();
      if (titleText.includes(lower)) {
        score += 4;
      } else if (descText.includes(lower)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = category as JobCategory;
    }
  }

  return bestMatch;
}

function getCompanyEmoji(company: string): string {
  const emojis = ['🎮', '🕹️', '🎯', '🚀', '⚡', '🌟', '💎', '🔥', '🌙', '⭐', '🎪', '🏔️', '🌊', '🎨', '🔮'];
  let hash = 0;
  for (let i = 0; i < company.length; i++) {
    hash = company.charCodeAt(i) + ((hash << 5) - hash);
  }
  return emojis[Math.abs(hash) % emojis.length];
}

// ─── Skeleton Loader ────────────────────────────────────────────────────────
const JobCardSkeleton = () => (
  <div className="bg-[#07101b] border border-white/6 rounded-xl overflow-hidden animate-pulse">
    <div className="p-5">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-white/10 shrink-0" />
        <div className="flex-1">
          <div className="h-5 bg-white/10 rounded-md w-3/4 mb-2" />
          <div className="h-4 bg-white/8 rounded-md w-1/2" />
        </div>
      </div>
      <div className="flex gap-2 mb-3">
        <div className="h-6 bg-white/8 rounded-md w-20" />
        <div className="h-6 bg-white/8 rounded-md w-28" />
      </div>
      <div className="h-4 bg-white/8 rounded-md w-full mb-2" />
      <div className="h-4 bg-white/8 rounded-md w-5/6 mb-4" />
      <div className="flex gap-1.5 mb-4">
        <div className="h-5 bg-white/6 rounded-md w-16" />
        <div className="h-5 bg-white/6 rounded-md w-14" />
        <div className="h-5 bg-white/6 rounded-md w-12" />
      </div>
      <div className="pt-3 border-t border-white/6 flex justify-between">
        <div className="h-4 bg-white/6 rounded-md w-20" />
        <div className="h-9 bg-white/10 rounded-lg w-20" />
      </div>
    </div>
  </div>
);

// ─── Job Card Component ─────────────────────────────────────────────────────
const JobCard = ({ job }: { job: JobListing & { category?: JobCategory } }) => (
  <article className="bg-[#07101b] border border-white/6 rounded-xl overflow-hidden transition-all hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10 group">
    <div className="p-5">
      {/* Header row */}
      <div className="flex items-start gap-4 mb-4">
        {job.companyLogo ? (
          <img
            src={job.companyLogo}
            alt={job.company}
            className="w-12 h-12 rounded-xl bg-[#0f172a] object-contain shrink-0"
            onError={(e) => {
              // If logo fails to load, replace with emoji
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement?.insertAdjacentHTML(
                'afterbegin',
                `<div class="w-12 h-12 rounded-xl bg-[#0f172a] text-white font-bold flex items-center justify-center text-2xl shrink-0">${getCompanyEmoji(job.company)}</div>`
              );
            }}
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-[#0f172a] text-white font-bold flex items-center justify-center text-2xl shrink-0">
            {getCompanyEmoji(job.company)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-white group-hover:text-cyan-200 transition-colors truncate">
            {job.title}
          </h3>
          <div className="text-sm text-cyan-300 mt-0.5">{job.company}</div>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${TYPE_COLORS[job.type] || TYPE_COLORS['Other']}`}>
          {job.type}
        </span>
        <span className="text-xs text-cyan-200/70 flex items-center gap-1">
          📍 {job.location}
        </span>
        {job.remote && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 text-xs border border-cyan-500/20">
            🌐 Remote
          </span>
        )}
      </div>

      {/* Salary */}
      {job.salary && (
        <div className="text-sm text-emerald-300 font-semibold mb-3">
          {job.salary}
        </div>
      )}

      {/* Description */}
      <p className="text-cyan-100/80 text-sm leading-relaxed mb-4 line-clamp-3">
        {job.description}
      </p>

      {/* Tags */}
      {job.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.tags.map((tag) => (
            <span key={tag} className="inline-block px-2 py-0.5 rounded-md bg-[#071826] border border-[#123044] text-xs text-cyan-200">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between pt-3 border-t border-white/6">
        <div className="flex items-center gap-2">
          <span className="text-xs text-cyan-300/50">{job.postedDate}</span>
          <span className="text-xs text-cyan-300/30">•</span>
          <span className="text-xs text-cyan-300/40">{job.source}</span>
        </div>
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-linear-to-b from-cyan-500 to-cyan-400 text-[#001018] text-sm font-bold hover:shadow-lg hover:shadow-cyan-500/30 transition-all active:scale-[0.97]"
        >
          Apply →
        </a>
      </div>
    </div>
  </article>
);

// ─── Main Component ─────────────────────────────────────────────────────────
export default function Jobs({ onCreateProfile, onOpenSignup, onEditProfile }: JobsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { hasProfile } = useHasProfile();

  const isStudiosActive = location.pathname === '/studios_directory';
  const isPublishersActive = location.pathname.startsWith('/studios_directory/publishers');
  const isToolsActive = location.pathname.startsWith('/studios_directory/tools');
  const isResourcesActive = location.pathname.startsWith('/studios_directory/resources');
  const isJobsActive = location.pathname.startsWith('/studios_directory/jobs');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Data state
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<JobCategory>('All');
  const [remoteOnly, setRemoteOnly] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch jobs from API — fresh data on every page load
  const loadJobs = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJobs(search);
      setJobs(data);
    } catch (err) {
      setError('Failed to load jobs. Please try again later.');
      console.error('Job fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + reload when debounced search changes
  useEffect(() => {
    loadJobs(debouncedSearch || undefined);
  }, [debouncedSearch, loadJobs]);

  // Categorize and filter jobs client-side
  const filteredJobs = useMemo(() => {
    return jobs
      .map((job) => ({
        ...job,
        category: categorizeJob(job),
      }))
      .filter((job) => {
        if (selectedCategory !== 'All' && job.category !== selectedCategory) return false;
        if (remoteOnly && !job.remote) return false;
        return true;
      });
  }, [jobs, selectedCategory, remoteOnly]);

  return (
    <>
      {/* ─── StudioHub Header ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-linear-to-b bg-[#0B1020] backdrop-blur-xl border-b border-white/8">
        <div className="max-w-[1240px] mx-auto px-6 py-4 flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-400 to-cyan-500 flex items-center justify-center text-[#001018] font-bold text-lg">
              S
            </div>
            <span className="text-xl font-extrabold text-white hidden sm:block">StudioHub</span>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg bg-[rgba(9,14,22,0.55)] border border-white/8"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white mt-1.5 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white mt-1.5 transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
          </button>

          <nav className="hidden md:flex items-center gap-8 font-bold">
            <a onClick={() => navigate('/')} className="text-cyan-300 hover:text-white cursor-pointer transition">Home</a>
            <a onClick={() => navigate('/studios_directory')} className={`cursor-pointer transition ${isStudiosActive ? 'text-white' : 'text-cyan-300 hover:text-white'}`}>Studios</a>
            <a onClick={() => navigate('/studios_directory/publishers')} className={`cursor-pointer transition ${isPublishersActive ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}>Publishers</a>
            <a onClick={() => navigate('/studios_directory/tools')} className={`cursor-pointer transition ${isToolsActive ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}>Tools</a>
            <a onClick={() => navigate('/studios_directory/resources')} className={`cursor-pointer transition ${isResourcesActive ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}>Resources</a>
            <a onClick={() => navigate('/studios_directory/jobs')} className={`cursor-pointer transition ${isJobsActive ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}>Jobs</a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                {!hasProfile && (
                  <button
                    onClick={onCreateProfile}
                    className="px-4 h-10 rounded-xl bg-linear-to-b from-cyan-500 to-cyan-400 text-[#001018] font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all hidden md:block"
                  >
                    Create a Profile
                  </button>
                )}
                <AccountMenu
                  displayName={(user as any).name || (user as any).email}
                  items={[
                    ...(!hasProfile ? [{ id: 'add-company', label: 'Add company', onClick: () => onCreateProfile?.() }] : []),
                    { id: 'settings', label: 'Settings', onClick: () => navigate('/account/settings') },
                    ...(hasProfile ? [{ id: 'edit-profile', label: 'Edit profile', onClick: () => onEditProfile?.() }] : []),
                    { id: 'logout', label: 'Logout', tone: 'danger' as const, onClick: () => logout() },
                  ]}
                />
              </>
            ) : (
              <button
                onClick={onOpenSignup}
                className="px-4 h-10 rounded-xl bg-linear-to-b from-cyan-500 to-cyan-400 text-[#001018] font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all hidden md:block"
              >
                Sign up to create a profile
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#0B1020] backdrop-blur-xl border-b border-white/8 py-4 px-6">
            <nav className="flex flex-col gap-4 font-bold">
              <a onClick={() => { navigate('/'); setIsMenuOpen(false); }} className="text-cyan-300 hover:text-white cursor-pointer transition py-2">Home</a>
              <a onClick={() => { navigate('/studios_directory'); setIsMenuOpen(false); }} className={`cursor-pointer transition py-2 ${isStudiosActive ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}>Studios</a>
              <a onClick={() => { navigate('/studios_directory/publishers'); setIsMenuOpen(false); }} className={`cursor-pointer transition py-2 ${isPublishersActive ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}>Publishers</a>
              <a onClick={() => { navigate('/studios_directory/tools'); setIsMenuOpen(false); }} className={`cursor-pointer transition py-2 ${isToolsActive ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}>Tools</a>
              <a onClick={() => { navigate('/studios_directory/resources'); setIsMenuOpen(false); }} className={`cursor-pointer transition py-2 ${isResourcesActive ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}>Resources</a>
              <a onClick={() => { navigate('/studios_directory/jobs'); setIsMenuOpen(false); }} className={`cursor-pointer transition py-2 ${isJobsActive ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}>Jobs</a>
              {user ? (
                !hasProfile && onCreateProfile && (
                  <button
                    onClick={() => { onCreateProfile(); setIsMenuOpen(false); }}
                    className="px-4 h-10 rounded-xl bg-linear-to-b from-cyan-500 to-cyan-400 text-[#001018] font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                  >
                    Create a Profile
                  </button>
                )
              ) : (
                onOpenSignup && (
                  <button
                    onClick={() => { onOpenSignup(); setIsMenuOpen(false); }}
                    className="px-4 h-10 rounded-xl bg-linear-to-b from-cyan-500 to-cyan-400 text-[#001018] font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                  >
                    Sign up to create a profile
                  </button>
                )
              )}
            </nav>
          </div>
        )}
      </header>

      {/* ─── Main Content ──────────────────────────────────────────────── */}
      <main className="min-h-screen py-8 bg-transparent">
        <div className="max-w-[1240px] mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="text-sm text-cyan-300 mb-6 mt-6">
            <a onClick={() => navigate('/')} className="cursor-pointer hover:text-cyan-100">Home</a>
            <span className="mx-2">›</span>
            <strong className="text-white">Jobs</strong>
          </nav>

          {/* ─── Hero Banner ─────────────────────────────────────────── */}
          <section className="relative rounded-2xl overflow-hidden mb-8 bg-linear-to-br from-[#071826] via-[#0a1e32] to-[#07101b] border border-white/6">
            {/* Decorative glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 px-4 py-8 sm:px-10 sm:py-14 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs sm:text-sm font-semibold mb-4">
                <span>💼</span> Live Game Industry Jobs
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-white mb-3 leading-tight">
                Find Your Next Role in<br />
                <span className="bg-linear-to-r from-cyan-300 to-cyan-500 bg-clip-text text-transparent">Game Development</span>
              </h1>
              <p className="text-cyan-200/70 max-w-2xl mx-auto text-sm sm:text-base mb-6">
                Real-time job listings aggregated from top job boards. Fresh data loaded every time you visit.
              </p>

              {/* Search bar */}
              <div className="max-w-xl mx-auto">
                <div className="flex items-center bg-[rgba(9,14,22,0.7)] rounded-xl border border-white/10 overflow-hidden focus-within:border-cyan-400/50 transition-colors">
                  <span className="pl-3 sm:pl-4 text-cyan-300/50">🔍</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, company, skill..."
                    className="flex-1 bg-transparent px-2 sm:px-3 py-3 text-cyan-100 outline-none placeholder:text-cyan-300/30 text-sm sm:text-base"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-3 text-cyan-300/50 hover:text-white transition-colors"
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ─── Filters Bar ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-4 mb-8">
            {/* Category tabs — horizontally scrollable on mobile */}
            <div className="overflow-x-auto -mx-6 px-6" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
              <div className="flex gap-2 min-w-max pb-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-semibold border transition-all min-w-fit
                      ${selectedCategory === cat
                        ? 'bg-cyan-500/15 text-cyan-200 border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.15)]'
                        : 'bg-[#07101b] text-cyan-300/60 border-white/6 hover:border-cyan-500/30 hover:text-cyan-200'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Remote toggle */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <div
                  className={`relative w-11 h-6 rounded-full transition-colors ${remoteOnly ? 'bg-cyan-500' : 'bg-white/10'}`}
                  onClick={() => setRemoteOnly(!remoteOnly)}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${remoteOnly ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <span className="text-sm text-cyan-200/70 font-medium">Remote only</span>
              </label>
            </div>
          </div>

          {/* ─── Results info ────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-cyan-300/60">
              {loading ? (
                'Loading fresh jobs...'
              ) : error ? (
                <span className="text-red-300">{error}</span>
              ) : (
                <>
                  {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
                  {selectedCategory !== 'All' && <span> in <strong className="text-cyan-300">{selectedCategory}</strong></span>}
                  {remoteOnly && <span> • Remote only</span>}
                  {debouncedSearch && <span> • Search: "<strong className="text-cyan-300">{debouncedSearch}</strong>"</span>}
                </>
              )}
            </p>
            {!loading && (
              <button
                onClick={() => loadJobs(debouncedSearch || undefined)}
                className="text-xs text-cyan-300/50 hover:text-cyan-200 transition-colors flex items-center gap-1"
                title="Refresh jobs"
              >
                🔄 Refresh
              </button>
            )}
          </div>

          {/* ─── Job Listings Grid ───────────────────────────────────── */}
          {loading ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-white mb-2">Something went wrong</h3>
              <p className="text-cyan-200/60 max-w-md mx-auto mb-6">{error}</p>
              <button
                onClick={() => loadJobs(debouncedSearch || undefined)}
                className="px-5 py-2.5 rounded-lg bg-linear-to-b from-cyan-500 to-cyan-400 text-[#001018] text-sm font-bold hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
              >
                Try Again
              </button>
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔎</div>
              <h3 className="text-xl font-bold text-white mb-2">No jobs found</h3>
              <p className="text-cyan-200/60 max-w-md mx-auto">
                Try adjusting your search or filters. New positions are added regularly.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setRemoteOnly(false); }}
                className="mt-6 px-5 py-2.5 rounded-lg bg-[#07101b] border border-white/10 text-cyan-200 text-sm font-semibold hover:border-cyan-500/40 transition-all"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* ─── Post a Job CTA ──────────────────────────────────────── */}
          <section className="mt-16 mb-12 relative rounded-2xl overflow-hidden bg-linear-to-br from-[#071826] via-[#0a1e32] to-[#07101b] border border-white/6">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,211,238,0.08),transparent_60%)] pointer-events-none" />
            <div className="relative z-10 px-6 py-12 sm:px-10 sm:py-14 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                  Hiring for your game studio?
                </h2>
                <p className="text-cyan-200/70 max-w-lg">
                  Post your open positions and reach thousands of talented game developers, artists, designers, and producers in the indie community.
                </p>
              </div>
              <a
                href="mailto:cryptotrader035@gmail.com?subject=Job%20Posting%20Request%20—%20StudioHub"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-linear-to-b from-cyan-500 to-cyan-400 text-[#001018] font-extrabold text-base hover:shadow-lg hover:shadow-cyan-500/40 transition-all active:scale-[0.97] shrink-0"
              >
                Post a Job ✉️
              </a>
            </div>
          </section>

          <footer className="mt-8 text-sm text-cyan-300">© {new Date().getFullYear()} StudioHub</footer>
        </div>
      </main>
    </>
  );
}
