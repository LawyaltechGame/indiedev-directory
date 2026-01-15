import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select } from '../ui/Select';
import { TiltCard } from '../ui/TiltCard';
import { ProfileDetailModal } from './ProfileDetailModal';
import type { Studio } from '../../types';
import { GENRES, PLATFORMS, TEAM_SIZES, LOCATIONS, TOOLS, TAGS } from '../../constants';
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
  tools: string;
  settools: (value: string) => void;
  tags: string;
  settags: (value: string) => void;
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
  tools,
  settools,
  tags,
  settags,
  searchQuery = '',
}: DirectoryProps) {
  const navigate = useNavigate();
  const [studios, setStudios] = useState<Studio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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
        
        // Deduplicate studios by name (keep the most recent one with a logo, or most recent if no logo)
        const studiosByName = new Map<string, any>();
        
        profiles.forEach((profile: any) => {
          const name = profile.name || 'Unknown Studio';
          const existing = studiosByName.get(name);
          
          // Extract profileImageId for comparison (handle both parsed and unparsed)
          const getProfileImageId = (p: any) => {
            if (p.profileImageId && p.profileImageId !== '' && p.profileImageId !== 'NULL') {
              return p.profileImageId;
            }
            if (p.profileData && typeof p.profileData === 'object' && p.profileData.profileImageId) {
              return p.profileData.profileImageId;
            }
            // Try parsing if profileData is a string
            if (p.profileData && typeof p.profileData === 'string') {
              try {
                const parsed = JSON.parse(p.profileData);
                return parsed.profileImageId || null;
              } catch {
                return null;
              }
            }
            return null;
          };
          
          if (!existing) {
            studiosByName.set(name, profile);
          } else {
            const existingHasLogo = getProfileImageId(existing);
            const currentHasLogo = getProfileImageId(profile);
            
            // Debug duplicates
            if (name === 'BoringSuburbanDad') {
              console.log(`🔍 Duplicate found for ${name}:`, {
                existing: {
                  id: existing.$id,
                  profileImageId: existingHasLogo,
                  createdAt: existing.$createdAt,
                },
                current: {
                  id: profile.$id,
                  profileImageId: currentHasLogo,
                  createdAt: profile.$createdAt,
                },
              });
            }
            
            if (currentHasLogo && !existingHasLogo) {
              studiosByName.set(name, profile);
              console.warn(`Duplicate studio found: "${name}". Keeping the one with a logo.`);
            } else if (!currentHasLogo && existingHasLogo) {
              // Keep existing (has logo)
              if (name === 'BoringSuburbanDad') {
                console.log(`✅ Keeping existing ${name} with logo: ${existingHasLogo}`);
              }
            } else if (currentHasLogo && existingHasLogo) {
              // Both have logos - prefer the one that matches the expected ID or the more recent one
              // For specific studios, prefer the correct image ID
              const getCorrectImageId = (studioName: string): string | null => {
                if (studioName === 'BoringSuburbanDad') return '6968aae1001bacf83a50';
                if (studioName === 'Avalanche Studios') return '6968ab5b0025fcdc0d8c';
                return null;
              };
              
              const correctImageId = getCorrectImageId(name);
              
              if (correctImageId) {
                if (existingHasLogo === correctImageId) {
                  console.log(`✅ Keeping existing ${name} with correct logo ID: ${existingHasLogo}`);
                  // Keep existing
                } else if (currentHasLogo === correctImageId) {
                  console.log(`✅ Switching to current ${name} with correct logo ID: ${currentHasLogo}`);
                  studiosByName.set(name, profile);
                } else {
                  // Neither matches expected - keep more recent
                  const existingDate = existing.$createdAt || existing.$id || '';
                  const currentDate = profile.$createdAt || profile.$id || '';
                  if (currentDate > existingDate) {
                    studiosByName.set(name, profile);
                    console.warn(`Duplicate studio found: "${name}". Keeping the more recent one.`);
                  }
                }
              } else {
                // For other studios, keep more recent
                const existingDate = existing.$createdAt || existing.$id || '';
                const currentDate = profile.$createdAt || profile.$id || '';
                if (currentDate > existingDate) {
                  studiosByName.set(name, profile);
                  console.warn(`Duplicate studio found: "${name}". Keeping the more recent one.`);
                }
              }
            } else {
              // Neither has logo - keep the more recent one
              const existingDate = existing.$createdAt || existing.$id || '';
              const currentDate = profile.$createdAt || profile.$id || '';
              if (currentDate > existingDate) {
                studiosByName.set(name, profile);
                console.warn(`Duplicate studio found: "${name}". Keeping the more recent one.`);
              }
            }
          }
        });
        
        const uniqueProfiles = Array.from(studiosByName.values());
        
        // Transform profiles to Studio format
        const transformedStudios: Studio[] = uniqueProfiles.map((profile: any, index: number) => {
          // Extract profileImageId - check multiple sources
          let profileImageId: string | null = null;
          
          // 1. Check root level (after parseProfileJSONFields flattens it)
          if (profile.profileImageId && profile.profileImageId !== '' && profile.profileImageId !== 'NULL') {
            profileImageId = profile.profileImageId;
          }
          // 2. Check nested in profileData object
          else if (profile.profileData && typeof profile.profileData === 'object' && profile.profileData.profileImageId) {
            profileImageId = profile.profileData.profileImageId;
          }
          // 3. Try parsing profileData if it's a string
          else if (profile.profileData && typeof profile.profileData === 'string') {
            try {
              const parsed = JSON.parse(profile.profileData);
              if (parsed.profileImageId && parsed.profileImageId !== '' && parsed.profileImageId !== 'NULL') {
                profileImageId = parsed.profileImageId;
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
          
          // Treat empty string as null
          if (profileImageId === '' || profileImageId === 'NULL') {
            profileImageId = null;
          }
          
          // Debug logging for BoringSuburbanDad
          if (profile.name === 'BoringSuburbanDad') {
            console.log(`🔍 Extracting profileImageId for ${profile.name}:`, {
              finalProfileImageId: profileImageId,
              rootLevel: profile.profileImageId,
              nestedObject: profile.profileData?.profileImageId,
              profileDataType: typeof profile.profileData,
              documentId: profile.$id,
            });
          }
          
          return {
            id: profile.$id || profile.id || index + 1,
            name: profile.name || 'Unknown Studio',
            tagline: profile.tagline || '',
            genre: profile.genre || '',
            platform: profile.platform || '',
            teamSize: profile.teamSize || '',
            location: profile.location || '',
            tools: profile.tools || '',
            hue: (index * 37) % 360, // Generate hue for card colors (fallback)
            profileImageId: profileImageId, // Extract profileImageId from parsed profile
            fullProfile: profile, // Store full profile data for the modal
          };
        });

        setStudios(transformedStudios as any);
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
    settools('');
  };

  return (
    <section id="directory" className="py-17 bg-[rgba(6,10,16,0.35)] border-t border-b border-white/8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Mobile filter toggle */}
        <div className="md:hidden mb-4">
          <button
            className="w-full h-12 px-4 border border-cyan-500 bg-[rgba(9,14,22,0.55)] text-cyan-100 rounded-xl font-extrabold transition-all duration-200 hover:bg-[rgba(0,229,255,0.12)] hover:text-white hover:shadow-[0_0_10px_rgba(0,229,255,0.35)] flex items-center justify-between"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <span>Filters</span>
            <span className={`transform transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>
        </div>
        
        {/* Filter controls */}
        <div className={`${isFiltersOpen ? 'block' : 'hidden'} md:block mb-4.5`}>
          <div className="flex flex-wrap gap-3 mb-3">
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
            <Select
              label="Tools"
              value={tools}
              onChange={settools}
              options={TOOLS}
            />
            <Select
              label="Tags"
              value={tags}
              onChange={settags}
              options={TAGS}
            />
            <button
              className="h-10 px-4 border border-cyan-500 bg-[rgba(9,14,22,0.55)] text-cyan-100 rounded-xl font-extrabold transition-all duration-200 hover:bg-[rgba(0,229,255,0.12)] hover:text-white hover:shadow-[0_0_10px_rgba(0,229,255,0.35)] hover:-translate-y-0.5 shadow-[0_10px_28px_rgba(56,189,248,0.20)]"
              onClick={clearFilters}
            >
              Clear
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid justify-center gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-full min-h-[300px] md:min-h-[330px] bg-[rgba(20,28,42,0.6)] backdrop-blur-[10px] border border-white/8 rounded-2xl p-4 md:p-4.5 animate-pulse">
                <div className="h-24 md:h-30 rounded-2xl mb-3 skeleton" />
                <div className="h-5 md:h-6 bg-white/10 rounded mb-2 skeleton" />
                <div className="h-4 bg-white/5 rounded mb-3 skeleton" />
                <div className="flex gap-2 mb-3">
                  <div className="h-6 md:h-7 w-16 bg-white/5 rounded-2xl skeleton" />
                  <div className="h-6 md:h-7 w-20 bg-white/5 rounded-2xl skeleton" />
                </div>
                <div className="h-10 md:h-12 bg-white/5 rounded-xl skeleton" />
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
            <div className="grid justify-center gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
              {filtered.map((s, i) => (
                <TiltCard 
                  key={s.id} 
                  studio={s} 
                  delay={i * 0.04}
                  onViewProfile={() => {
                    const profileId = (s as any).fullProfile?.$id || s.id;
                    navigate(`/studio/${profileId}`);
                  }}
                />
              ))}
            </div>
            <p className="text-cyan-200/70 text-center text-xs md:text-sm mt-6">
              Showing {filtered.length} {filtered.length === 1 ? 'studio' : 'studios'} in the directory
            </p>
          </>
        )}
      </div>

      {/* Profile Detail Modal */}
      <ProfileDetailModal
        profile={selectedProfile}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProfile(null);
        }}
      />
    </section>
  );
}