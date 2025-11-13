import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getApprovedProfiles } from '../../services/profile';
import { ProfileDetailModal } from './ProfileDetailModal';
import { TAGS } from '../../constants';
import type { Studio } from '../../types';

const PAGE_SIZE = 12;

interface StudiosDirectoryProps {
  onCreateProfile?: () => void;
}

const OPTIONS = {
  sizes: ['1-10', '11-50', '51-200', '200+'],
  platforms: ['PC', 'PS5', 'Xbox', 'Switch', 'iOS', 'Android', 'Web'],
  tools: ['Unity', 'Unreal', 'Godot', 'Blender', 'Maya', 'ZBrush', 'Figma'],
  tags: TAGS,
  revenue: ['Premium', 'F2P', 'Subscription'],
  locations: ['Austin, USA', 'Vancouver, CA', 'Helsinki, FI', 'Kyoto, JP', 'Lisbon, PT', 'Berlin, DE', 'Birmingham, UK', 'Wellington, NZ', 'Seoul, KR', 'Gdańsk, PL', 'Montreal, CA', 'San Jose, USA', 'Dublin, IE', 'Copenhagen, DK', 'Valencia, ES'],
} as const;

function useLocalSet(key: string, initial: string[]) {
  const [value, setValue] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, setValue] as const;
}

export default function StudiosDirectory({ onCreateProfile }: StudiosDirectoryProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isStudiosActive = location.pathname === '/studios_directory';
  const isPublishersActive = location.pathname.startsWith('/studios_directory/publishers');
  const isResourcesActive = location.pathname.startsWith('/studios_directory/resources');

  const [approvedProfiles, setApprovedProfiles] = useState<any[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState<boolean>(true);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // data: use approved profiles as the source of studios (no mock data)
  const studios = useMemo<Studio[]>(() => {
    return approvedProfiles.map((profile: any, index: number) => ({
      id: profile.$id || String(index + 1),
      name: profile.name || 'Unknown Studio',
      tagline: profile.tagline || '',
      genre: profile.genre || '',
      platform: profile.platform || '',
      teamSize: profile.teamSize || '',
      location: profile.location || '',
      founded: profile.foundedYear || profile.founded || '',
      tags: profile.tags || [],
      tools: profile.tools || [],
      revenue: profile.revenue || '',
      platforms: profile.platforms || (profile.platform ? [profile.platform] : []),
      hue: ((index * 37) % 360),
      fullProfile: profile,
    } as Studio));
  }, [approvedProfiles]);

  const [query, setQuery] = useState('');
  const [view, setView] = useLocalSet('studios:view', ['grid']);
  const [sort, setSort] = useLocalSet('studios:sort', ['relevance']);
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [recentOnly, setRecentOnly] = useState(false);
  const [filters, setFilters] = useState<Record<string, string[]>>({ sizes: [], platforms: [], tools: [], tags: [], revenue: [], locations: [] });
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>(() => {
    try { return Object.fromEntries(JSON.parse(localStorage.getItem('bookmarks') || '[]').map((n: string) => [n, true])); } catch { return {}; }
  });
  const [compare, setCompare] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [filteredCache, setFilteredCache] = useState<Studio[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const cardsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { localStorage.setItem('bookmarks', JSON.stringify(Object.keys(bookmarks).filter(k => bookmarks[k]))); }, [bookmarks]);

  const parsedView = Array.isArray(view) ? view[0] : view;
  const parsedSort = Array.isArray(sort) ? sort[0] : sort;

  // Filtering logic
  const currentFiltered = useMemo(() => {
    const q = (query || '').toLowerCase();
    return studios.filter(s => {
      const text = `${s.name} ${s.tagline} ${(s as any).genre || ''}`.toLowerCase();
      const textOK = text.includes(q);
      const quickOK = (!recentOnly || ((s as any).founded ? (s as any).founded >= 2018 : true)) && (!onlyBookmarked || bookmarks[s.name]);
      const fullOK = Object.entries(filters).every(([k, vals]) => {
        if (!vals || vals.length === 0) return true;
        const val = (s as any)[k === 'locations' ? 'location' : k === 'sizes' ? 'teamSize' : k];
        if (!val) return false;
        if (Array.isArray(val)) return vals.some(v => val.includes(v));
        return vals.includes(String(val));
      });
      return textOK && quickOK && fullOK;
    }).sort((a, b) => {
      if (parsedSort === 'name') return String(a.name).localeCompare(String(b.name));
      if (parsedSort === 'newest') return ((b as any).founded || 0) - ((a as any).founded || 0);
      if (parsedSort === 'rating') return ((b as any).rating || 0) - ((a as any).rating || 0);
      return 0;
    });
  }, [studios, query, recentOnly, onlyBookmarked, filters, parsedSort, bookmarks]);

  // reset pagination when filtered list changes
  useEffect(() => { setFilteredCache(currentFiltered); setPage(1); }, [currentFiltered]);

  // infinite scroll
  useEffect(() => {
    function onScroll() {
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 300) {
        const totalPages = Math.ceil(filteredCache.length / PAGE_SIZE);
        if (page < totalPages) setPage(p => p + 1);
      }
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [filteredCache.length, page]);

  // Fetch approved profiles from database
  useEffect(() => {
    const fetchApprovedProfiles = async () => {
      try {
        setLoadingProfiles(true);
        const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID as string;
        const PROFILE_TABLE_ID = import.meta.env.VITE_APPWRITE_PROFILE_TABLE_ID as string;
        
        if (!DB_ID || !PROFILE_TABLE_ID) {
          console.warn('Missing database configuration for approved profiles');
          return;
        }

        const profiles = await getApprovedProfiles(DB_ID, PROFILE_TABLE_ID);
        setApprovedProfiles(profiles || []);
      } catch (error) {
        console.error('Error fetching approved profiles:', error);
      }
      finally {
        setLoadingProfiles(false);
      }
    };

    fetchApprovedProfiles();
  }, []);

  // helpers
  const toggleBookmark = (name: string) => setBookmarks(b => ({ ...b, [name]: !b[name] }));
  const toggleCompare = (id: any) => setCompare(c => ({ ...c, [id]: !c[id] }));
  const resetFilters = () => setFilters({ sizes: [], platforms: [], tools: [], tags: [], revenue: [], locations: [] });

  const visible = filteredCache.slice(0, page * PAGE_SIZE);

  return (
    <>
      {/* StudioHub Full Header */}
      <header className="sticky top-0 z-50 bg-linear-to-b bg-[#0B1020] backdrop-blur-xl border-b border-white/8">
        <div className="max-w-[1240px] mx-auto px-6 py-4 flex items-center justify-between h-20">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-400 to-cyan-500 flex items-center justify-center text-[#001018] font-bold text-lg">S</div>
            <span className="text-xl font-extrabold text-white hidden sm:block">StudioHub</span>
          </div>

          {/* Center Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            <a onClick={() => navigate('/')} className="text-cyan-300 hover:text-white cursor-pointer transition">Home</a>
            <a onClick={() => navigate('/studios_directory')} className={`cursor-pointer transition ${isStudiosActive ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}>Studios</a>
            <a onClick={() => navigate('/studios_directory/publishers')} className={`cursor-pointer transition ${isPublishersActive ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}>Publishers</a>
            <a onClick={() => navigate('/studios_directory/tools')} className={`cursor-pointer transition ${location.pathname.startsWith('/studios_directory/tools') ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}>Tools</a>
            <a onClick={() => navigate('/studios_directory/resources')} className={`cursor-pointer transition ${isResourcesActive ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}>Resources</a>
          </nav>          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* <button className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition" title="Search">🔍</button> */}
            <button onClick={onCreateProfile} className="px-4 h-10 rounded-xl bg-linear-to-b from-cyan-500 to-cyan-400 text-[#001018] font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all">Create a Profile</button>
          </div>
        </div>
      </header>

      <main className="min-h-screen bg-bg" style={{
        background: `radial-gradient(1000px 600px at 10% -10%, #12203a 10%, transparent 60%),
                     radial-gradient(1200px 700px at 110% 0%, #0a162a 10%, transparent 60%),
                     #0b1020`
      }}>
        <div className="py-6 px-4 max-w-[1240px] mx-auto">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-cyan-300 mb-6">
            <a onClick={() => navigate('/')} className="hover:text-cyan-100 cursor-pointer transition">Home</a>
            <span className="text-cyan-300">›</span>
            <strong className="text-white">Studios</strong>
          </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        <aside className="hidden lg:block">
          <div className="sticky top-20 bg-linear-to-b from-[#0e1628] to-[#0b1222] border border-white/8 rounded-2xl p-5 shadow-lg">
            <div className="font-bold text-lg mb-4 text-white">Filters</div>
            <div className="mb-4">
              <label className="text-xs text-cyan-200 block mb-2 font-semibold">Search</label>
              <div className="flex items-center gap-2 bg-[#0a1426] rounded-lg p-2.5 border border-white/8">
                <span>🔎</span>
                <input value={query} onChange={(e) => setQuery(e.target.value)} className="bg-transparent outline-none w-full text-sm text-white placeholder-cyan-300/50" placeholder="Search studios, tags, tools…" />
              </div>
            </div>

            <div className="mb-4 pb-4 border-b border-white/8">
              <div className="text-xs font-semibold text-cyan-200 mb-3 uppercase tracking-wide">Quick filters</div>
              <label className="flex items-center gap-2.5 text-sm text-cyan-100 mb-2.5 cursor-pointer">
                <input type="checkbox" checked={onlyBookmarked} onChange={() => setOnlyBookmarked(v => !v)} className="accent-cyan-400" />
                <span>Only bookmarked ★</span>
              </label>
              <label className="flex items-center gap-2.5 text-sm text-cyan-100 cursor-pointer">
                <input type="checkbox" checked={recentOnly} onChange={() => setRecentOnly(v => !v)} className="accent-cyan-400" />
                <span>Founded ≥ 2018</span>
              </label>
            </div>

            <div id="filter-groups">
              {(['sizes', 'platforms', 'tools', 'tags', 'revenue', 'locations'] as Array<keyof typeof OPTIONS>).map((key) => (
                <div key={key} className="mb-4 pb-4 border-b border-white/8">
                  <div className="text-xs font-semibold text-cyan-200 mb-2.5 uppercase tracking-wide">{key}</div>
                  <div className="space-y-2">
                    {OPTIONS[key].map(opt => (
                      <label key={opt} className="flex items-center gap-2.5 text-sm text-cyan-100 cursor-pointer hover:text-white transition">
                        <input
                          type="checkbox"
                          checked={(filters as any)[key].includes(opt)}
                          onChange={(e) => {
                            setFilters(prev => {
                              const cur = new Set(prev[key] || []);
                              e.target.checked ? cur.add(opt) : cur.delete(opt);
                              return { ...prev, [key]: Array.from(cur) };
                            });
                          }}
                          className="accent-cyan-400"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => resetFilters()} className="w-full px-3 py-2 rounded-lg bg-transparent border border-white/20 text-sm font-semibold text-cyan-100 hover:bg-white/5 transition">Reset</button>
          </div>
        </aside>

        <section>
          <div className="mb-4 bg-linear-to-b from-[#0e1628] to-[#0b1222] border border-white/8 rounded-xl p-4 flex items-center justify-between">
            <div className="text-sm text-cyan-300 font-semibold">{filteredCache.length} studios</div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-lg p-1">
                <button onClick={() => setView(['grid'])} className={`px-2 py-1 rounded transition ${parsedView==='grid' ? 'bg-white/20' : 'hover:bg-white/10'}`} title="Grid">▦</button>
                <button onClick={() => setView(['list'])} className={`px-2 py-1 rounded transition ${parsedView==='list' ? 'bg-white/20' : 'hover:bg-white/10'}`} title="List">≣</button>
              </div>
              <select value={parsedSort} onChange={(e) => setSort([e.target.value])} className="bg-[#0a1426] border border-white/8 rounded-lg px-3 py-1.5 text-sm font-semibold text-cyan-100 hover:border-cyan-400/50 transition">
                <option value="relevance">Relevance</option>
                <option value="name">Name (A–Z)</option>
                <option value="newest">Newest</option>
                <option value="rating">Rating</option>
              </select>
              <button onClick={() => setOnlyBookmarked(v => !v)} className="px-4 h-9 rounded-lg border border-white/8 text-sm font-semibold hover:bg-white/5 transition">Bookmarks ★</button>
            </div>
          </div>

          <div className="mb-4">{/* chips */}
            {Object.values(filters).flat().length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.values(filters).flat().map((c) => (
                  <span key={c} className="px-3 py-1.5 bg-[#172033] border border-[#223049] rounded-full text-xs font-semibold text-cyan-300">{c}</span>
                ))}
              </div>
            )}
          </div>

          {/* Loading skeleton or empty state when there are no approved profiles */}
          {loadingProfiles ? (
            <div className={parsedView === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5' : 'flex flex-col gap-4'}>
              {Array.from({ length: 6 }).map((_, i) => (
                <article key={i} className="bg-linear-to-b from-[#0f172a] to-[#0b1222] border border-white/8 rounded-xl overflow-hidden flex flex-col h-full transition-all animate-pulse">
                  <div className="p-4 border-b border-white/6">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#0b1220]" />
                      <div className="flex-1 min-w-0">
                        <div className="h-4 bg-[#0b1220] rounded w-1/2 mb-2" />
                        <div className="h-3 bg-[#0b1220] rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col gap-3">
                    <div className="h-3 bg-[#0b1220] rounded w-3/4" />
                    <div className="h-3 bg-[#0b1220] rounded w-1/2" />
                    <div className="grid grid-cols-3 gap-2 text-xs mt-auto">
                      <div className="h-8 bg-[#0b1220] rounded" />
                      <div className="h-8 bg-[#0b1220] rounded" />
                      <div className="h-8 bg-[#0b1220] rounded" />
                    </div>
                  </div>
                  <div className="p-4 border-t border-white/6 grid grid-cols-2 gap-2">
                    <div className="h-10 bg-[#0b1220] rounded" />
                    <div className="h-10 bg-[#0b1220] rounded" />
                    <div className="h-10 bg-[#0b1220] rounded" />
                    <div className="h-10 bg-[#0b1220] rounded" />
                  </div>
                </article>
              ))}
            </div>
          ) : studios.length === 0 ? (
            <div className="py-20 text-center">
              <div className="text-6xl mb-4">🔎</div>
              <h3 className="text-2xl font-bold mb-2">No studios found</h3>
              <p className="text-cyan-300 mb-4">There are no approved studio profiles yet. Create one in StudioHub to get listed here.</p>
              <div className="flex items-center justify-center gap-2">
                <button onClick={onCreateProfile} className="px-4 py-2 rounded-xl bg-linear-to-b from-cyan-500 to-cyan-400 text-[#001018] font-bold">Create a Profile</button>
                <button onClick={() => navigate('/studios_directory/resources')} className="px-4 py-2 rounded-xl border border-white/8 text-cyan-100">Browse Resources</button>
              </div>
            </div>
          ) : null}

            <div ref={cardsRef} className={parsedView === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5' : 'flex flex-col gap-4'}>
            {visible.map((s) => (
              <article key={s.id} className="bg-linear-to-b from-[#0f172a] to-[#0b1222] border border-white/8 rounded-xl overflow-hidden flex flex-col h-full hover:border-cyan-400/30 hover:shadow-lg hover:shadow-cyan-400/5 transition-all">
                {/* Card Header with Avatar and Title */}
                <div className="p-4 border-b border-white/6">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: `hsl(${(s as any).hue} 70% 45%)` }}>{String(s.name)[0]}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base text-white line-clamp-1">{s.name}</h3>
                      <div className="text-xs text-cyan-300 flex items-center gap-2">
                        <span>📍 {(s as any).hq || (s as any).location || 'Location TBD'}</span>
                        {((s as any).fullProfile && ((s as any).fullProfile.foundedYear || (s as any).founded)) && (
                          <span className="text-cyan-400/80">· Founded {(s as any).fullProfile?.foundedYear || (s as any).founded}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <p className="text-sm text-cyan-200">{(s as any).tagline || 'No description available'}</p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {((s as any).tags || []).slice(0, 3).map((t: string) => <span key={t} className="px-2 py-1 bg-[#172033] border border-[#223049] rounded-full text-xs text-cyan-300 font-semibold">{t}</span>)}
                  </div>

                  {/* Meta Boxes (3 columns) */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-[#0a1426] border border-white/6 p-2 rounded-lg text-center">
                      <div className="text-cyan-300 font-semibold">👥</div>
                      <div className="text-cyan-100 text-xs mt-1">{(s as any).size || (s as any).teamSize || '—'}</div>
                    </div>
                    <div className="bg-[#0a1426] border border-white/6 p-2 rounded-lg text-center">
                      <div className="text-cyan-300 font-semibold">📅</div>
                      <div className="text-cyan-100 text-xs mt-1">{(s as any).founded || (s as any).fullProfile?.foundedYear || '—'}</div>
                    </div>
                    <div className="bg-[#0a1426] border border-white/6 p-2 rounded-lg text-center">
                      <div className="text-cyan-300 font-semibold">💻</div>
                      <div className="text-cyan-100 text-xs mt-1">{((s as any).platforms || (s as any).platform) && Array.isArray((s as any).platforms || (s as any).platform) ? ((s as any).platforms || (s as any).platform).slice(0, 1).join(', ') : (s as any).platform || '—'}</div>
                    </div>
                  </div>
                </div>

                {/* Card Footer - 4 Buttons */}
                <div className="p-4 border-t border-white/6 grid grid-cols-2 gap-2">
                  <button onClick={() => { setSelectedProfile((s as any).fullProfile); setIsModalOpen(true); }} className="px-3 py-2.5 rounded-lg bg-linear-to-b from-cyan-500 to-cyan-400 text-[#001018] font-bold text-sm hover:shadow-lg hover:shadow-cyan-500/40 transition-all">View Profile →</button>
                  <button onClick={() => toggleBookmark(s.name)} className={`px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${bookmarks[s.name] ? 'bg-linear-to-b from-cyan-500 to-cyan-400 text-[#001018] shadow-lg shadow-cyan-500/30' : 'bg-transparent border border-white/20 text-cyan-100 hover:border-cyan-400/50'}`}>{bookmarks[s.name] ? '★' : '☆'}</button>
                  <button onClick={() => { toggleCompare(s.id); }} className={`px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${compare[s.id] ? 'bg-linear-to-b from-cyan-500 to-cyan-400 text-[#001018] shadow-lg shadow-cyan-500/30' : 'bg-transparent border border-white/20 text-cyan-100 hover:border-cyan-400/50'}`}>Compare</button>
                  {((s as any).fullProfile && (s as any).fullProfile.email) ? (
                    <a
                      href={`mailto:${(s as any).fullProfile.email}`}
                      className="px-3 text-center py-2.5 rounded-lg bg-transparent border border-white/20 text-cyan-100 text-sm font-bold hover:bg-white/5 transition-all"
                    >
                      ✉️ Contact    
                    </a>
                  ) : (
                    <button disabled className="px-3 py-2.5 rounded-lg bg-transparent border border-white/20 text-cyan-600/40 text-sm font-bold cursor-not-allowed transition-all">
                      ✉️ Contact
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="h-20" />
        </section>
      </div>
        </div>

      {/* compare bar */}
      {/* Profile Detail Modal */}
      <ProfileDetailModal
        profile={selectedProfile}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedProfile(null); }}
      />
      <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[1240px] bg-[#0f172a] border border-white/6 rounded-xl p-3 ${Object.values(compare).some(Boolean) ? 'flex' : 'hidden'} items-center gap-3 z-40`}>
        <div className="font-semibold">Compare</div>
        <div className="flex gap-2">{Object.keys(compare).filter(k => compare[k]).map(id => {
          const s = studios.find(x => String(x.id) === String(id));
          return <span key={id} className="px-2 py-1 bg-[#172033] border border-[#223049] rounded-full text-sm">{s?.name}</span>;
        })}</div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => setCompareOpen(true)} className="px-3 py-1 rounded border border-white/6">Open Compare</button>
          <button onClick={() => setCompare({})} className="px-3 py-1 rounded bg-[#0e1527] border border-white/6">Clear</button>
        </div>
      </div>

      {/* compare modal */}
      {compareOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0b1222] border border-white/6 rounded-xl max-w-4xl w-full p-4">
            <h3 className="text-lg font-semibold mb-3">Studio Comparison</h3>
            <div className="overflow-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="text-left"><th className="border p-2">Studio</th><th className="border p-2">HQ</th><th className="border p-2">Size</th><th className="border p-2">Founded</th><th className="border p-2">Platforms</th><th className="border p-2">Tags</th><th className="border p-2">Tools</th><th className="border p-2">Revenue</th></tr>
                </thead>
                <tbody>
                  {Object.keys(compare).filter(k => compare[k]).map(id => {
                    const s = studios.find(x => String(x.id) === String(id));
                    if (!s) return null;
                    return (
                      <tr key={id} className="align-top">
                        <td className="border p-2">{s.name}</td>
                        <td className="border p-2">{(s as any).hq || (s as any).location}</td>
                        <td className="border p-2">{(s as any).size || (s as any).teamSize}</td>
                        <td className="border p-2">{(s as any).founded || '—'}</td>
                        <td className="border p-2">{((s as any).platforms || (s as any).platform) .join ? ((s as any).platforms || (s as any).platform).join(', ') : (s as any).platform}</td>
                        <td className="border p-2">{((s as any).tags || []).join(', ')}</td>
                        <td className="border p-2">{((s as any).tools || []).join(', ')}</td>
                        <td className="border p-2">{((s as any).revenue || []).join ? ((s as any).revenue || []).join(', ') : (s as any).revenue}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setCompareOpen(false)} className="px-3 py-1 rounded bg-[#0e1527] border border-white/6">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 flex">
          <div className="bg-[#0b1222] w-[360px] h-full p-4 overflow-auto">
            <div className="font-semibold mb-3">Filter Studios</div>
            <div className="mb-3">
              <input value={query} onChange={(e)=> setQuery(e.target.value)} placeholder="Search…" className="w-full p-2 rounded bg-[#0a1426] border border-white/6" />
            </div>
            <div className="space-y-3">
              {(['sizes','platforms','tools','tags','revenue','locations'] as Array<keyof typeof OPTIONS>).map(key => (
                <div key={key}>
                  <div className="font-semibold text-cyan-200 mb-2">{key}</div>
                  <div className="grid gap-2">
                    {OPTIONS[key].map(opt => (
                      <label key={opt} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={(filters as any)[key].includes(opt)} onChange={(e)=>{
                          setFilters(prev=>{
                            const cur = new Set(prev[key]||[]);
                            e.target.checked ? cur.add(opt) : cur.delete(opt);
                            return { ...prev, [key]: Array.from(cur) };
                          });
                        }} />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={()=>{ resetFilters(); setDrawerOpen(false); }} className="px-3 py-2 rounded border border-white/6">Reset</button>
              <button onClick={()=>{ setDrawerOpen(false); }} className="px-3 py-2 rounded bg-cyan-400 text-[#001018]">Apply</button>
            </div>
          </div>
          <div className="flex-1" onClick={()=> setDrawerOpen(false)} />
        </div>
      )}
    </main>
    </>
  );
}
