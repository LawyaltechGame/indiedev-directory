interface StudioProfile {
  $id: string;
  name: string;
  tagline: string;
  genre: string;
  platform: string;
  teamSize: string;
  location: string;
  description?: string;
  website?: string;
  status: string;
  foundedYear?: string;
}

interface StudioProfileCardProps {
  profile: StudioProfile;
  onViewProfile?: (profile: StudioProfile) => void;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
  onCompare?: (id: string) => void;
  isCompared?: boolean;
}

export function StudioProfileCard({
  profile,
  onViewProfile,
  onBookmark,
  isBookmarked = false,
  onCompare,
  isCompared = false,
}: StudioProfileCardProps) {
  // Generate a consistent color based on the studio name
  const hue = profile.name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;

  return (
    <article className="bg-linear-to-b from-[#0f172a] to-[#0b1222] border border-white/8 rounded-xl overflow-hidden flex flex-col h-full hover:border-cyan-400/30 hover:shadow-lg hover:shadow-cyan-400/5 transition-all">
      {/* Card Header with Avatar and Title */}
      <div className="p-4 border-b border-white/6">
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ background: `hsl(${hue} 70% 45%)` }}
          >
            {profile.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-white line-clamp-1">
              {profile.name}
            </h3>
            <div className="text-xs text-cyan-300 flex items-center gap-2">
              <span>📍 {profile.location || 'Location TBD'}</span>
              {profile.foundedYear && (
                <span className="text-cyan-400/80">· Founded {profile.foundedYear}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        <p className="text-sm text-cyan-200">{profile.tagline || 'No description available'}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {profile.genre && (
            <span className="px-2 py-1 bg-[#172033] border border-[#223049] rounded-full text-xs text-cyan-300 font-semibold">
              {profile.genre}
            </span>
          )}
          {profile.platform && (
            <span className="px-2 py-1 bg-[#172033] border border-[#223049] rounded-full text-xs text-cyan-300 font-semibold">
              {profile.platform}
            </span>
          )}
        </div>

        {/* Meta Boxes (3 columns) */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-[#0a1426] border border-white/6 p-2 rounded-lg text-center">
            <div className="text-cyan-300 font-semibold">👥</div>
            <div className="text-cyan-100 text-xs mt-1">{profile.teamSize || '—'}</div>
          </div>
          <div className="bg-[#0a1426] border border-white/6 p-2 rounded-lg text-center">
            <div className="text-cyan-300 font-semibold">🎮</div>
            <div className="text-cyan-100 text-xs mt-1">{profile.genre?.slice(0, 3) || '—'}</div>
          </div>
          <div className="bg-[#0a1426] border border-white/6 p-2 rounded-lg text-center">
            <div className="text-cyan-300 font-semibold">💻</div>
            <div className="text-cyan-100 text-xs mt-1">{profile.platform?.slice(0, 3) || '—'}</div>
          </div>
        </div>
      </div>

      {/* Card Footer - 4 Buttons */}
      <div className="p-4 border-t border-white/6 grid grid-cols-2 gap-2">
        <button
          onClick={() => onViewProfile?.(profile)}
          className="px-3 py-2.5 rounded-lg bg-linear-to-b from-cyan-500 to-cyan-400 text-[#001018] font-bold text-sm hover:shadow-lg hover:shadow-cyan-500/40 transition-all"
        >
          View Profile →
        </button>
        <button
          onClick={() => onBookmark?.(profile.$id)}
          className={`px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${
            isBookmarked
              ? 'bg-linear-to-b from-cyan-500 to-cyan-400 text-[#001018] shadow-lg shadow-cyan-500/30'
              : 'bg-transparent border border-white/20 text-cyan-100 hover:border-cyan-400/50'
          }`}
        >
          {isBookmarked ? '★' : '☆'}
        </button>
        <button
          onClick={() => onCompare?.(profile.$id)}
          className={`px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${
            isCompared
              ? 'bg-linear-to-b from-cyan-500 to-cyan-400 text-[#001018] shadow-lg shadow-cyan-500/30'
              : 'bg-transparent border border-white/20 text-cyan-100 hover:border-cyan-400/50'
          }`}
        >
          Compare
        </button>
        <button className="px-3 py-2.5 rounded-lg bg-transparent border border-white/20 text-cyan-100 text-sm font-bold hover:bg-white/5 transition-all">
          ✉️ Contact
        </button>
      </div>
    </article>
  );
}
