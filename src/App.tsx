
import { useEffect, useMemo, useRef, useState } from 'react';

const GENRES = [
  'Action',
  'Adventure',
  'RPG',
  'Strategy',
  'Simulation',
  'Puzzle',
  'Horror',
  'Platformer',
  'Racing',
];
const PLATFORMS = ['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile', 'Web'];
const TEAM_SIZES = ['1–5', '6–10', '11–20', '21–50', '50+'];
const LOCATIONS = [
  'Global',
  'North America',
  'Europe',
  'Asia',
  'South America',
  'Oceania',
  'Africa',
];

const ALL_STUDIOS = Array.from({ length: 9 }).map((_, i) => ({
  id: i + 1,
  name: `Studio ${String.fromCharCode(65 + (i % 26))}`,
  tagline: [
    'Crafting memorable pixel worlds',
    'Atmospheric adventures with heart',
    'Systems-first strategy and sim',
  ][i % 3],
  genre: GENRES[i % GENRES.length],
  platform: PLATFORMS[i % PLATFORMS.length],
  teamSize: TEAM_SIZES[i % TEAM_SIZES.length],
  location: LOCATIONS[(i + 1) % LOCATIONS.length],
  hue: (i * 37) % 360,
}));


export default function App() {
  const [search] = useState('');
  const [genre, setGenre] = useState('');
  const [platform, setPlatform] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [location, setLocation] = useState('');
  const [navShrunk, setNavShrunk] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileStep, setProfileStep] = useState('create');
  const [query, setQuery] = useState('');

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Searching: ${query || '(empty)'}`);
  };
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    genre: '',
    platform: '',
    teamSize: '',
    location: '',
    description: '',
    website: '',
    email: '',
  });
  const [submittedProfile, setSubmittedProfile] = useState<any>(null);

  // cursor aura (guard for playground SSR)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined')
      return;
    const move = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mx', e.clientX + 'px');
      document.documentElement.style.setProperty('--my', e.clientY + 'px');
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, []);

  // shrink navbar on scroll
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onScroll = () => setNavShrunk(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ALL_STUDIOS.filter((s) => {
      const qOK =
        !q ||
        [s.name, s.tagline, s.genre, s.platform, s.location]
          .join(' ')
          .toLowerCase()
          .includes(q);
      const gOK = !genre || s.genre === genre;
      const pOK = !platform || s.platform === platform;
      const tOK = !teamSize || s.teamSize === teamSize;
      const lOK = !location || s.location === location;
      return qOK && gOK && pOK && tOK && lOK;
    });
  }, [search, genre, platform, teamSize, location]);

  const handleCreateProfile = () => {
    setShowProfileModal(true);
    setProfileStep('create');
    setFormData({
      name: '',
      tagline: '',
      genre: '',
      platform: '',
      teamSize: '',
      location: '',
      description: '',
      website: '',
      email: '',
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    if (profileStep === 'create') {
      if (
        formData.name &&
        formData.tagline &&
        formData.genre &&
        formData.platform &&
        formData.teamSize &&
        formData.location
      ) {
        setSubmittedProfile(formData);
        setProfileStep('review');
      } else {
        alert('Please fill in all required fields');
      }
    } else if (profileStep === 'review') {
      setProfileStep('list');
    }
  };

  const handleBackStep = () => {
    if (profileStep === 'review') setProfileStep('create');
    else if (profileStep === 'list') setProfileStep('review');
  };

  const handleCloseModal = () => {
    setShowProfileModal(false);
    setProfileStep('create');
  };

  return (
    <div className="min-h-screen bg-bg text-white font-sans">
      {/* NAVBAR */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        navShrunk ? 'bg-[rgba(7,11,18,0.7)] backdrop-blur-[14px]' : 'bg-[rgba(7,11,18,0.55)] backdrop-blur-md'
      } border-b border-white/8`}>
        <div className="h-20 flex items-center justify-between gap-4 px-6 max-w-7xl mx-auto">
          <a className="flex items-center gap-3 font-extrabold text-white no-underline" href="#hero" aria-label="Home">
            <div className="w-9 h-9 rounded-[10px] bg-linear-to-br from-cyan-400 via-cyan-300 to-cyan-500 shadow-[0_8px_18px_rgba(56,189,248,0.25)]" />
            <span>IndieDev Directory</span>
          </a>
          <div className="flex items-center gap-2.5 flex-1 justify-end">
            <button
              className="h-10 px-3.5 bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] font-extrabold rounded-xl border-0 cursor-pointer transition-all duration-200 hover:from-cyan-400 hover:to-cyan-500 active:scale-[0.995] active:translate-y-px shadow-[0_8px_22px_rgba(34,211,238,0.35)]"
              onClick={handleCreateProfile}
            >
              Create a Profile
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION WITH SEARCH + SMALL FLOATING ICONS */}
      <section id="hero" className="relative pt-24 pb-20 px-6 min-h-[650px] flex items-center overflow-hidden bg-linear-to-br from-cyan-500/8 to-black/40">
        <div className="absolute inset-0 bg-gradient-radial from-cyan-500/15 via-transparent to-transparent opacity-60 animate-pulse" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-15 items-center max-w-7xl mx-auto">
          {/* Left: text */}
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl leading-tight font-black mb-4 bg-linear-to-r from-cyan-100 via-cyan-300 to-cyan-100 bg-clip-text text-transparent">
              Showcase Your Game Studio to the World
            </h1>
            <p className="text-lg text-cyan-200 leading-relaxed mb-8 max-w-2xl">
              From solo developers to global studios — join the directory that
              connects creators, publishers, and collaborators.
            </p>
            <div className="flex gap-3.5 flex-wrap items-center">
              <button
                className="h-14 px-6 bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] font-extrabold rounded-xl border-0 cursor-pointer transition-all duration-200 hover:from-cyan-400 hover:to-cyan-500 active:scale-[0.995] active:translate-y-px shadow-[0_8px_22px_rgba(34,211,238,0.35)] text-base"
                onClick={handleCreateProfile}
              >
                Create a Profile
              </button>
              <a
                href="#directory"
                className="h-14 px-6 border border-cyan-500 bg-[rgba(9,14,22,0.55)] text-cyan-100 rounded-xl no-underline font-extrabold flex items-center justify-center transition-all duration-200 hover:bg-[rgba(0,229,255,0.12)] hover:text-white hover:shadow-[0_0_10px_rgba(0,229,255,0.35)] hover:-translate-y-0.5 shadow-[0_10px_28px_rgba(56,189,248,0.20)] text-base"
                role="button"
              >
                Browse Studios
              </a>
            </div>
          </div>

          {/* Right: Search bar with revolving icons */}
          <div className="relative h-96 flex items-center justify-center">
            <div className="relative">
              <form
                className="flex items-center bg-[rgba(13,21,36,0.65)] border border-white/8 rounded-2xl overflow-hidden w-full max-w-lg shadow-[0_2px_16px_rgba(0,0,0,0.25)] h-15"
                onSubmit={onSearch}
                role="search"
              >
                <span className="pl-3 text-cyan-200">🔎</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search studios, genres, tags"
                  aria-label="Search"
                  className="flex-1 px-3 bg-transparent text-white border-0 outline-none"
                />
                <button className="h-12 px-4 bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] font-extrabold rounded-xl border-0 cursor-pointer transition-all duration-200 hover:from-cyan-400 hover:to-cyan-500 active:scale-[0.995] active:translate-y-px shadow-[0_8px_22px_rgba(34,211,238,0.35)]" type="submit">
                  Search
                </button>
              </form>
              <div className="absolute -inset-20 flex items-center justify-center" aria-hidden>
                <div className="relative w-[520px] h-[520px] animate-spin" style={{ animationDuration: '25s' }}>
                  {['🎮', '👾', '🕹️', '🎯', '🚀', '✨'].map((icon, i) => {
                    const angle = i * 60;
                    return (
                      <div
                        key={i}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center bg-[rgba(0,229,255,0.1)] border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.28)] text-3xl"
                        style={{
                          transform: `rotate(${angle}deg) translate(215px) rotate(-${angle}deg)`,
                        }}
                      >
                        {icon}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA (mid-page) */}
      <section className="py-18 relative">
        <div className="max-w-7xl mx-auto px-6 relative overflow-hidden flex items-center justify-between gap-4 rounded-2xl bg-linear-to-br from-[rgba(0,229,255,0.18)] to-[rgba(15,24,40,0.9)] border border-cyan-500/35 shadow-[0_18px_40px_rgba(34,211,238,0.18)] p-6">
          <div>
            <h3 className="text-2xl font-bold mb-1.5">Ready to showcase your studio?</h3>
            <p className="text-cyan-200 text-sm">
              Create a profile and start getting discovered today.
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-center mt-4">
          <button
            className="h-14 px-6 bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] font-extrabold rounded-xl border-0 cursor-pointer transition-all duration-200 hover:from-cyan-400 hover:to-cyan-500 active:scale-[0.995] active:translate-y-px shadow-[0_8px_22px_rgba(34,211,238,0.35)] text-base"
            onClick={handleCreateProfile}
          >
            Create a Profile
          </button>
          <button className="h-14 px-6 border border-cyan-500 bg-[rgba(9,14,22,0.55)] text-cyan-100 rounded-xl font-extrabold transition-all duration-200 hover:bg-[rgba(0,229,255,0.12)] hover:text-white hover:shadow-[0_0_10px_rgba(0,229,255,0.35)] hover:-translate-y-0.5 shadow-[0_10px_28px_rgba(56,189,248,0.20)] text-base">
            Learn More
          </button>
        </div>
        <div className="absolute top-[-60%] left-[-20%] w-[70%] h-[220%] bg-linear-to-br from-white/16 to-transparent transform rotate-10 blur-[26px] pointer-events-none" aria-hidden />
      </section>

      {/* HOW IT WORKS */}
      <section className="py-18" id="how">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6 text-center tracking-tight bg-linear-to-r from-cyan-100 via-cyan-300 to-cyan-100 bg-clip-text text-transparent">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[rgba(20,28,42,0.6)] backdrop-blur-[10px] border border-white/8 rounded-2xl p-4.5 flex gap-3.5 shadow-[0_10px_28px_rgba(0,0,0,0.35)] animate-fade-up">
              <div className="w-10 h-10 rounded-xl bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] flex items-center justify-center font-black shadow-[0_8px_18px_rgba(56,189,248,0.28)]">
                1
              </div>
              <div>
                <h3 className="font-bold mb-1.5">Create a Profile</h3>
                <p className="text-cyan-200 text-sm">
                  Add your studio details, platforms, and projects.
                </p>
              </div>
            </div>

            <div className="bg-[rgba(20,28,42,0.6)] backdrop-blur-[10px] border border-white/8 rounded-2xl p-4.5 flex gap-3.5 shadow-[0_10px_28px_rgba(0,0,0,0.35)] animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-10 h-10 rounded-xl bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] flex items-center justify-center font-black shadow-[0_8px_18px_rgba(56,189,248,0.28)]">
                2
              </div>
              <div>
                <h3 className="font-bold mb-1.5">Get Discovered</h3>
                <p className="text-cyan-200 text-sm">
                  Be found by genre, platform, tags, and more.
                </p>
              </div>
            </div>

            <div className="bg-[rgba(20,28,42,0.6)] backdrop-blur-[10px] border border-white/8 rounded-2xl p-4.5 flex gap-3.5 shadow-[0_10px_28px_rgba(0,0,0,0.35)] animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-10 h-10 rounded-xl bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] flex items-center justify-center font-black shadow-[0_8px_18px_rgba(56,189,248,0.28)]">
                3
              </div>
              <div>
                <h3 className="font-bold mb-1.5">Connect & Grow</h3>
                <p className="text-cyan-200 text-sm">
                  Receive inquiries and build partnerships.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY JOIN */}
      <section id="why" className="py-18">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6 text-center tracking-tight bg-linear-to-r from-cyan-100 via-cyan-300 to-cyan-100 bg-clip-text text-transparent">
            Why Join?
          </h2>
          <div className="border-4 border-white/8 rounded-lg overflow-hidden bg-[rgba(10,16,28,0.3)] mt-5">
            <div className="grid grid-cols-[240px_1fr] items-center">
              <div className="p-4 text-left font-bold">Benefit</div>
              <div className="p-4 text-right">Description</div>
            </div>

            <div className="grid grid-cols-[240px_1fr] items-center border-b border-white/8 transition-colors duration-200 hover:bg-[rgba(0,229,255,0.05)]">
              <div className="p-4 text-left">Visibility</div>
              <div className="p-4 text-right text-cyan-200 text-sm">
                Reach publishers, investors, collaborators, and fans.
              </div>
            </div>

            <div className="grid grid-cols-[240px_1fr] items-center border-b border-white/8 transition-colors duration-200 hover:bg-[rgba(0,229,255,0.05)]">
              <div className="p-4 text-left">Collaboration</div>
              <div className="p-4 text-right text-cyan-200 text-sm">
                Find artists, devs, QA, and other creators.
              </div>
            </div>

            <div className="grid grid-cols-[240px_1fr] items-center border-b border-white/8 transition-colors duration-200 hover:bg-[rgba(0,229,255,0.05)]">
              <div className="p-4 text-left">Professional Presence</div>
              <div className="p-4 text-right text-cyan-200 text-sm">
                Share your portfolio and projects.
              </div>
            </div>

            <div className="grid grid-cols-[240px_1fr] items-center transition-colors duration-200 hover:bg-[rgba(0,229,255,0.05)]">
              <div className="p-4 text-left">Industry Insights</div>
              <div className="p-4 text-right text-cyan-200 text-sm">
                Access resources and opportunities.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIRECTORY */}
      <section id="directory" className="py-17 bg-[rgba(6,10,16,0.35)] border-t border-b border-white/8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-3 flex-wrap mb-4.5">
            <Select
              label="Genre"
              value={genre}
              onChange={setGenre}
              options={GENRES}
            />
            <Select
              label="Platform"
              value={platform}
              onChange={setPlatform}
              options={PLATFORMS}
            />
            <Select
              label="Team Size"
              value={teamSize}
              onChange={setTeamSize}
              options={TEAM_SIZES}
            />
            <Select
              label="Location"
              value={location}
              onChange={setLocation}
              options={LOCATIONS}
            />
            <button
              className="h-10 px-4 border border-cyan-500 bg-[rgba(9,14,22,0.55)] text-cyan-100 rounded-xl font-extrabold transition-all duration-200 hover:bg-[rgba(0,229,255,0.12)] hover:text-white hover:shadow-[0_0_10px_rgba(0,229,255,0.35)] hover:-translate-y-0.5 shadow-[0_10px_28px_rgba(56,189,248,0.20)]"
              onClick={() => {
                setGenre('');
                setPlatform('');
                setTeamSize('');
                setLocation('');
              }}
            >
              Clear
            </button>
          </div>

          <div className="grid justify-center gap-12 grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
            {filtered.slice(0, 6).map((s, i) => (
              <TiltCard key={s.id} studio={s} delay={i * 0.04} />
            ))}
          </div>
          <p className="text-cyan-200 text-center text-sm mt-6">
            Compact preview — full directory will include pagination & sticky
            filters.
          </p>
        </div>
      </section>

      {/* JOIN CTA FOOTER (spec: 300px height, gradient, centered) */}
      <section className="h-[300px] flex items-center justify-center text-center bg-linear-to-r from-purple-600 to-purple-400 border-t border-white/8">
        <div className="max-w-4xl mx-auto p-5">
          <h2 className="text-3xl font-extrabold mb-3">Ready to showcase your work?</h2>
          <p className="text-lg mb-6">
            Create your profile today and get discovered.
          </p>
          <button 
            className="bg-white text-[#0b0f18] px-8 py-3.5 font-extrabold border-0 rounded-xl cursor-pointer transition-all duration-200 hover:bg-[#0b0f18] hover:text-white shadow-[0_10px_26px_rgba(0,0,0,0.25)]"
            onClick={handleCreateProfile}
          >
            Create a Profile
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-0 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
          <div>
            <h4 className="font-bold mb-2">About</h4>
            <p className="text-cyan-200 text-sm">
              IndieDev Directory is a curated hub for discovering indie game
              studios globally.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-2">Contact</h4>
            <p className="text-cyan-200 text-sm">hello@indiedev.directory</p>
          </div>
          <div>
            <h4 className="font-bold mb-2">Newsletter</h4>
            <div className="flex border border-white/8 rounded-2xl overflow-hidden bg-[rgba(10,16,28,0.65)]">
              <input placeholder="Your email" className="flex-1 bg-transparent border-0 text-cyan-100 px-3" />
              <button className="h-12 px-4 bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] font-extrabold rounded-xl border-0 cursor-pointer transition-all duration-200 hover:from-cyan-400 hover:to-cyan-500 active:scale-[0.995] active:translate-y-px shadow-[0_8px_22px_rgba(34,211,238,0.35)]">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        <div className="text-cyan-200 text-center text-sm py-3 pb-6">
          © {new Date().getFullYear()} IndieDev Directory. All rights reserved.
        </div>
      </footer>

      <div className="fixed inset-0 pointer-events-none z-5 bg-gradient-radial from-cyan-500/18 via-transparent to-transparent mix-blend-screen transition-all duration-100" style={{ background: `radial-gradient(220px 160px at var(--mx) var(--my), rgba(0,229,255,.18), transparent 45%)` }} aria-hidden />

      {/* PROFILE MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-5" onClick={handleCloseModal}>
          <div className="bg-[rgba(20,28,42,0.6)] backdrop-blur-[10px] border border-white/8 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 relative shadow-[0_25px_50px_rgba(0,0,0,0.5)]" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-4 bg-white/10 border-0 text-white w-8 h-8 rounded-lg cursor-pointer text-xl transition-all duration-200 hover:bg-white/20" onClick={handleCloseModal}>
              ✕
            </button>

            {profileStep === 'create' && (
              <div className="animate-fade-up">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-1.5">📝 Create Your Profile</h2>
                  <p className="text-cyan-200 text-sm">Step 1 of 3: Fill in your studio details</p>
                </div>
                <form className="flex flex-col gap-4 my-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-white text-sm">Studio Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="Your studio name"
                      required
                      className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-white text-sm">Tagline *</label>
                    <input
                      type="text"
                      name="tagline"
                      value={formData.tagline}
                      onChange={handleFormChange}
                      placeholder="One-line description"
                      required
                      className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-white text-sm">Genre *</label>
                      <select
                        name="genre"
                        value={formData.genre}
                        onChange={handleFormChange}
                        required
                        className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                      >
                        <option value="">Select genre</option>
                        {GENRES.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-white text-sm">Platform *</label>
                      <select
                        name="platform"
                        value={formData.platform}
                        onChange={handleFormChange}
                        required
                        className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                      >
                        <option value="">Select platform</option>
                        {PLATFORMS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-white text-sm">Team Size *</label>
                      <select
                        name="teamSize"
                        value={formData.teamSize}
                        onChange={handleFormChange}
                        required
                        className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                      >
                        <option value="">Select size</option>
                        {TEAM_SIZES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-white text-sm">Location *</label>
                      <select
                        name="location"
                        value={formData.location}
                        onChange={handleFormChange}
                        required
                        className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                      >
                        <option value="">Select location</option>
                        {LOCATIONS.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-white text-sm">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      placeholder="Tell us about your studio..."
                      rows={4}
                      className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-white text-sm">Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleFormChange}
                      placeholder="https://yourstudio.com"
                      className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-white text-sm">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="contact@yourstudio.com"
                      required
                      className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                    />
                  </div>
                </form>
                <div className="flex gap-3 justify-end mt-6">
                  <button
                    className="h-12 px-4 border border-cyan-500 bg-[rgba(9,14,22,0.55)] text-cyan-100 rounded-xl font-extrabold transition-all duration-200 hover:bg-[rgba(0,229,255,0.12)] hover:text-white hover:shadow-[0_0_10px_rgba(0,229,255,0.35)] hover:-translate-y-0.5 shadow-[0_10px_28px_rgba(56,189,248,0.20)]"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button
                    className="h-12 px-4 bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] font-extrabold rounded-xl border-0 cursor-pointer transition-all duration-200 hover:from-cyan-400 hover:to-cyan-500 active:scale-[0.995] active:translate-y-px shadow-[0_8px_22px_rgba(34,211,238,0.35)]"
                    onClick={handleNextStep}
                  >
                    Review Profile
                  </button>
                </div>
              </div>
            )}

            {profileStep === 'review' && submittedProfile && (
              <div className="animate-fade-up">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-1.5">👀 Review Your Profile</h2>
                  <p className="text-cyan-200 text-sm">Step 2 of 3: Verify your information</p>
                </div>
                <div className="bg-[rgba(10,16,28,0.4)] border border-white/8 rounded-2xl p-5 my-5">
                  <div className="mb-4.5">
                    <h3 className="text-xl font-bold mb-2">{submittedProfile.name}</h3>
                    <p className="text-cyan-200">{submittedProfile.tagline}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="bg-[rgba(0,229,255,0.08)] border border-cyan-500/15 rounded-lg p-3">
                      <span className="text-cyan-400 text-xs font-semibold mb-1.5 block">Genre</span>
                      <span className="font-semibold text-white block">{submittedProfile.genre}</span>
                    </div>
                    <div className="bg-[rgba(0,229,255,0.08)] border border-cyan-500/15 rounded-lg p-3">
                      <span className="text-cyan-400 text-xs font-semibold mb-1.5 block">Platform</span>
                      <span className="font-semibold text-white block">{submittedProfile.platform}</span>
                    </div>
                    <div className="bg-[rgba(0,229,255,0.08)] border border-cyan-500/15 rounded-lg p-3">
                      <span className="text-cyan-400 text-xs font-semibold mb-1.5 block">Team Size</span>
                      <span className="font-semibold text-white block">{submittedProfile.teamSize}</span>
                    </div>
                    <div className="bg-[rgba(0,229,255,0.08)] border border-cyan-500/15 rounded-lg p-3">
                      <span className="text-cyan-400 text-xs font-semibold mb-1.5 block">Location</span>
                      <span className="font-semibold text-white block">{submittedProfile.location}</span>
                    </div>
                  </div>
                  {submittedProfile.description && (
                    <div className="mb-4.5">
                      <span className="text-cyan-200 text-xs font-semibold mb-1 block">Description</span>
                      <p className="text-white">{submittedProfile.description}</p>
                    </div>
                  )}
                  {submittedProfile.website && (
                    <div className="mb-4.5">
                      <span className="text-cyan-200 text-xs font-semibold mb-1 block">Website</span>
                      <p className="text-white">{submittedProfile.website}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-cyan-200 text-xs font-semibold mb-1 block">Email</span>
                    <p className="text-white">{submittedProfile.email}</p>
                  </div>
                </div>
                <div className="flex gap-3 justify-end mt-6">
                  <button
                    className="h-12 px-4 border border-cyan-500 bg-[rgba(9,14,22,0.55)] text-cyan-100 rounded-xl font-extrabold transition-all duration-200 hover:bg-[rgba(0,229,255,0.12)] hover:text-white hover:shadow-[0_0_10px_rgba(0,229,255,0.35)] hover:-translate-y-0.5 shadow-[0_10px_28px_rgba(56,189,248,0.20)]"
                    onClick={handleBackStep}
                  >
                    Back
                  </button>
                  <button
                    className="h-12 px-4 bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] font-extrabold rounded-xl border-0 cursor-pointer transition-all duration-200 hover:from-cyan-400 hover:to-cyan-500 active:scale-[0.995] active:translate-y-px shadow-[0_8px_22px_rgba(34,211,238,0.35)]"
                    onClick={handleNextStep}
                  >
                    Submit & List
                  </button>
                </div>
              </div>
            )}

            {profileStep === 'list' && submittedProfile && (
              <div className="animate-fade-up">
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold mb-1.5">🚀 Get Discovered</h2>
                  <p className="text-cyan-200 text-sm">Step 3 of 3: Your profile is live!</p>
                </div>
                <div className="text-center py-5">
                  <div className="w-15 h-15 mx-auto mb-4 bg-linear-to-b from-cyan-500 to-cyan-300 rounded-full flex items-center justify-center text-[#001018] text-3xl font-black">
                    ✓
                  </div>
                  <h3 className="text-xl font-bold mb-2">Profile Successfully Listed!</h3>
                  <p className="text-cyan-200 mb-4">
                    Congratulations! Your studio is now visible in our
                    directory.
                  </p>
                  <div className="bg-[rgba(0,229,255,0.08)] border border-cyan-500/15 rounded-xl p-4 my-4 text-left">
                    <div className="flex justify-between items-center py-2 border-b border-cyan-500/10">
                      <span className="text-cyan-200 text-sm">Studio Name</span>
                      <strong className="text-white">{submittedProfile.name}</strong>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-cyan-500/10">
                      <span className="text-cyan-200 text-sm">Genre</span>
                      <strong className="text-white">{submittedProfile.genre}</strong>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-cyan-200 text-sm">Platform</span>
                      <strong className="text-white">{submittedProfile.platform}</strong>
                    </div>
                  </div>
                  <p className="text-xs text-cyan-200">
                    Your profile will be visible to thousands of developers and
                    industry professionals. We'll send updates to{' '}
                    {submittedProfile.email}
                  </p>
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    className="h-12 px-4 bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] font-extrabold rounded-xl border-0 cursor-pointer transition-all duration-200 hover:from-cyan-400 hover:to-cyan-500 active:scale-[0.995] active:translate-y-px shadow-[0_8px_22px_rgba(34,211,238,0.35)]"
                    onClick={handleCloseModal}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="block">
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="h-10 bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-xl px-3 backdrop-blur-[6px]"
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}


function TiltCard({ studio, delay = 0 }: { studio: any; delay?: number }) {
  const cardRef = useRef<HTMLElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) * 2 - 1;
    const py = (y / rect.height) * 2 - 1;
    const tiltX = (-py * 8).toFixed(2);
    const tiltY = (px * 8).toFixed(2);
    el.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(0)`;
    el.style.setProperty('--mxp', (x / rect.width).toString());
  };

  const onLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
    el.style.removeProperty('--mxp');
  };

  return (
    <article
      ref={cardRef}
      className="w-80 min-h-[330px] transition-all duration-200 bg-[rgba(20,28,42,0.6)] backdrop-blur-[10px] border border-white/8 rounded-2xl p-4.5 shadow-[0_14px_36px_rgba(0,0,0,0.35)] relative transform-gpu animate-fade-up hover:-translate-y-1 hover:shadow-[0_22px_54px_rgba(34,211,238,0.22)] hover:border-cyan-500/45"
      style={{ animationDelay: `${delay}s` }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div
        className="h-30 rounded-2xl mb-3"
        style={{
          background: `linear-gradient(135deg, hsla(${studio.hue} 80% 55% / .45), rgba(34,211,238,.55))`,
        }}
      />
      <h3 className="text-xl font-bold mb-1 tracking-tight">{studio.name}</h3>
      <p className="text-cyan-200 mb-3.5">{studio.tagline}</p>
      <div className="flex gap-2 flex-wrap mb-3">
        <span className="inline-flex items-center h-7.5 px-3.5 rounded-2xl bg-white/6 text-cyan-100 text-xs border border-white/8">{studio.genre}</span>
        <span className="inline-flex items-center h-7.5 px-3.5 rounded-2xl bg-white/6 text-cyan-100 text-xs border border-white/8">{studio.platform}</span>
      </div>
      <button className="w-full h-12 px-4 border border-cyan-500 bg-[rgba(9,14,22,0.55)] text-cyan-100 rounded-xl font-extrabold transition-all duration-200 hover:bg-[rgba(0,229,255,0.12)] hover:text-white hover:shadow-[0_0_10px_rgba(0,229,255,0.35)] hover:-translate-y-0.5 shadow-[0_10px_28px_rgba(56,189,248,0.20)]">
        View Profile
      </button>
    </article>
  );
}
