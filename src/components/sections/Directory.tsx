import { useMemo } from 'react';
import { Select } from '../ui/Select';
import { TiltCard } from '../ui/TiltCard';
import type { Studio } from '../../types';
import { GENRES, PLATFORMS, TEAM_SIZES, LOCATIONS } from '../../constants';

interface DirectoryProps {
  studios: Studio[];
  genre: string;
  setGenre: (value: string) => void;
  platform: string;
  setPlatform: (value: string) => void;
  teamSize: string;
  setTeamSize: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  isLoading: boolean;
}

export function Directory({
  studios,
  genre,
  setGenre,
  platform,
  setPlatform,
  teamSize,
  setTeamSize,
  location,
  setLocation,
  isLoading,
}: DirectoryProps) {
  const filtered = useMemo(() => {
    return studios.filter((s) => {
      const gOK = !genre || s.genre === genre;
      const pOK = !platform || s.platform === platform;
      const tOK = !teamSize || s.teamSize === teamSize;
      const lOK = !location || s.location === location;
      return gOK && pOK && tOK && lOK;
    });
  }, [studios, genre, platform, teamSize, location]);

  const clearFilters = () => {
    setGenre('');
    setPlatform('');
    setTeamSize('');
    setLocation('');
  };

  return (
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
            onClick={clearFilters}
          >
            Clear
          </button>
        </div>

        <div className="grid justify-center gap-12 grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-80 min-h-[330px] bg-[rgba(20,28,42,0.6)] backdrop-blur-[10px] border border-white/8 rounded-2xl p-4.5 animate-pulse">
                <div className="h-30 rounded-2xl mb-3 skeleton" />
                <div className="h-6 bg-white/10 rounded mb-2 skeleton" />
                <div className="h-4 bg-white/5 rounded mb-3 skeleton" />
                <div className="flex gap-2 mb-3">
                  <div className="h-7 w-16 bg-white/5 rounded-2xl skeleton" />
                  <div className="h-7 w-20 bg-white/5 rounded-2xl skeleton" />
                </div>
                <div className="h-12 bg-white/5 rounded-xl skeleton" />
              </div>
            ))
          ) : (
            filtered.slice(0, 6).map((s, i) => (
              <TiltCard key={s.id} studio={s} delay={i * 0.04} />
            ))
          )}
        </div>
        <p className="text-cyan-200 text-center text-sm mt-6">
          Compact preview — full directory will include pagination & sticky
          filters.
        </p>
      </div>
    </section>
  );
}
