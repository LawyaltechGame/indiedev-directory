import { useState, useEffect, useMemo } from 'react';
import { Select } from '../ui/Select';
import { TiltCard } from '../ui/TiltCard';
import type { Studio } from '../../types';
import { GENRES, PLATFORMS, TEAM_SIZES, LOCATIONS } from '../../constants';
import { getApprovedProfiles } from '../../services/profile';

interface DirectoryProps {
  genre: string;
  setGenre: (value: string) => void;
  platform: string;
  setPlatform: (value: string) => void;
  teamSize: string;
  setTeamSize: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  searchQuery?: string;
}

export function Directory({
  genre,
  setGenre,
  platform,
  setPlatform,
  teamSize,
  setTeamSize,
  location,
  setLocation,
  searchQuery = '',
}: DirectoryProps) {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID as string;
  const PROFILE_TABLE_ID = import.meta.env.VITE_APPWRITE_PROFILE_TABLE_ID as string;

  useEffect(() => {
    const fetchApprovedProfiles = async () => {
      if (!DB_ID || !PROFILE_TABLE_ID) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const profiles = await getApprovedProfiles(DB_ID, PROFILE_TABLE_ID);
        
        // Transform profiles to Studio format
        const transformedStudios: Studio[] = profiles.map((profile: any, index: number) => ({
          id: profile.$id || profile.id || index + 1,
          name: profile.name || 'Unknown Studio',
          tagline: profile.tagline || '',
          genre: profile.genre || '',
          platform: profile.platform || '',
          teamSize: profile.teamSize || '',
          location: profile.location || '',
          hue: (index * 37) % 360, // Generate hue for card colors
        }));

        setStudios(transformedStudios);
      } catch (error) {
        console.error('Error fetching approved profiles:', error);
        setStudios([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApprovedProfiles();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return studios.filter((s) => {
      const gOK = !genre || s.genre === genre;
      const pOK = !platform || s.platform === platform;
      const tOK = !teamSize || s.teamSize === teamSize;
      const lOK = !location || s.location === location;
      const textOK = !q || [s.name, s.tagline, s.genre, s.platform, s.location]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
      return gOK && pOK && tOK && lOK && textOK;
    });
  }, [studios, genre, platform, teamSize, location, searchQuery]);

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

        {isLoading ? (
          <div className="grid justify-center gap-12 grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
            {Array.from({ length: 6 }).map((_, i) => (
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
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-2xl font-bold mb-2 text-cyan-100">No profiles found</h3>
            <p className="text-cyan-200/70 mb-6">
              {studios.length === 0 
                ? "No studios have been approved yet. Check back soon!"
                : "No studios match your current filters. Try adjusting your search criteria."}
            </p>
            {studios.length > 0 && (
              <button
                className="h-10 px-4 border border-cyan-500 bg-[rgba(9,14,22,0.55)] text-cyan-100 rounded-xl font-extrabold transition-all duration-200 hover:bg-[rgba(0,229,255,0.12)] hover:text-white hover:shadow-[0_0_10px_rgba(0,229,255,0.35)]"
                onClick={clearFilters}
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid justify-center gap-12 grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
              {filtered.map((s, i) => (
                <TiltCard key={s.id} studio={s} delay={i * 0.04} />
              ))}
            </div>
            <p className="text-cyan-200/70 text-center text-sm mt-6">
              Showing {filtered.length} {filtered.length === 1 ? 'studio' : 'studios'} in the directory
            </p>
          </>
        )}
      </div>
    </section>
  );
}
