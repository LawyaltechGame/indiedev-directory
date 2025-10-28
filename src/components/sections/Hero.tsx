import { useState } from 'react';

interface HeroProps {
  onCreateProfile: () => void;
}

export function Hero({ onCreateProfile }: HeroProps) {
  const [query, setQuery] = useState('');

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Searching: ${query || '(empty)'}`);
  };

  return (
    <section id="hero" className="relative pt-24 pb-20 px-6 min-h-[650px] flex items-center overflow-hidden bg-linear-to-br from-cyan-500/8 to-black/40">
      <div className="absolute inset-0 bg-gradient-radial from-cyan-500/15 via-transparent to-transparent opacity-60 animate-pulse" />
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-15 items-center max-w-7xl mx-auto">
        {/* Left: text */}
        <div className="space-y-4">
          <h1 className="text-5xl lg:text-6xl leading-tight font-black mb-4 bg-linear-to-r from-cyan-100 via-cyan-300 to-cyan-100 bg-clip-text text-transparent animate-fade-up">
            Showcase Your Game Studio to the World
          </h1>
          <p className="text-lg text-cyan-200 leading-relaxed mb-8 max-w-2xl">
            From solo developers to global studios — join the directory that
            connects creators, publishers, and collaborators.
          </p>
          <div className="flex gap-3.5 flex-wrap items-center">
            <button
              className="h-14 px-6 bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] font-extrabold rounded-xl border-0 cursor-pointer transition-all duration-200 hover:from-cyan-400 hover:to-cyan-500 active:scale-[0.995] active:translate-y-px shadow-[0_8px_22px_rgba(34,211,238,0.35)] text-base"
              onClick={onCreateProfile}
            >
              Create a Profile
            </button>
            <a
              href="#directory"
              className="h-14 px-6 border border-cyan-500 bg-[rgba(9,14,22,0.55)] text-cyan-100 rounded-xl no-underline font-extrabold flex items-center justify-center transition-all duration-200 hover:bg-[rgba(0,229,255,0.12)] hover:text-white hover:shadow-[0_0_10px_rgba(0,229,255,0.35)] hover:-translate-y-0.5 shadow-[0_10px_28px_rgba(56,189,248,0.20)] text-base"
              role="button"
            >
              Browse Profiles
            </a>
          </div>
        </div>

        {/* Right: Search bar with revolving icons */}
        <div className="relative h-64 lg:h-96 flex items-center justify-center">
          <div className="relative">
            <form
              className="flex items-center bg-[rgba(13,21,36,0.65)] border border-white/8 rounded-2xl overflow-hidden w-full max-w-lg shadow-[0_2px_16px_rgba(0,0,0,0.25)] h-15 transition-all duration-300 focus-within:border-cyan-400 focus-within:shadow-[0_4px_24px_rgba(34,211,238,0.25)]"
              onSubmit={onSearch}
              role="search"
            >
              <span className="pl-3 text-cyan-200">🔎</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search studios, genres, tags"
                aria-label="Search"
                className="flex-1 px-3 bg-transparent text-white border-0 outline-none placeholder:text-cyan-300/60 focus:placeholder:text-cyan-300/40 transition-colors duration-200"
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
  );
}
