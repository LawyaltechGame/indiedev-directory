import { useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Studio } from '../../types';
import { getStudioImageUrl } from '../../services/studioImages';

interface TiltCardProps {
  studio: Studio;
  delay?: number;
  onViewProfile?: () => void;
}

export const TiltCard = memo(function TiltCard({ studio, delay = 0, onViewProfile }: TiltCardProps) {
  const navigate = useNavigate();
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
      className="w-full h-[420px] md:h-[460px] transition-all duration-300 bg-gradient-to-br from-[rgba(20,28,42,0.8)] to-[rgba(20,28,42,0.6)] backdrop-blur-[10px] border border-white/10 rounded-3xl overflow-hidden shadow-[0_14px_36px_rgba(0,0,0,0.35)] relative transform-gpu animate-fade-up hover:-translate-y-2 hover:shadow-[0_28px_64px_rgba(34,211,238,0.28)] hover:border-cyan-500/50 hover:scale-[1.02] group flex flex-col"
      style={{ animationDelay: `${delay}s` }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {/* Studio Logo/Image Section - Fixed Height */}
      <div className="relative h-36 md:h-40 w-full bg-gradient-to-br from-[rgba(0,0,0,0.3)] to-[rgba(0,0,0,0.1)] overflow-hidden flex-shrink-0">
        {studio.profileImageId ? (
          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
            <img
              src={getStudioImageUrl(studio.profileImageId)}
              alt={`${studio.name} logo`}
              className="max-w-full max-h-full object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const parent = target.parentElement;
                if (parent) {
                  parent.className = 'relative w-full h-full flex items-center justify-center p-4 md:p-6';
                  parent.style.background = `linear-gradient(135deg, hsla(${studio.hue} 80% 55% / .45), rgba(34,211,238,.55))`;
                  parent.innerHTML = `<div class="text-4xl md:text-5xl font-black text-white/80">${studio.name.charAt(0)}</div>`;
                }
              }}
            />
          </div>
        ) : (
          <div
            className="h-full w-full flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, hsla(${studio.hue} 80% 55% / .45), rgba(34,211,238,.55))`,
        }}
          >
            <div className="text-4xl md:text-5xl font-black text-white/80 drop-shadow-lg">
              {studio.name.charAt(0)}
            </div>
          </div>
        )}
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.4)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content Section - Flex to fill remaining space */}
      <div className="p-4 md:p-5 flex flex-col flex-1 min-h-0">
        {/* Title - Fixed height */}
        <h3 className="text-xl md:text-2xl font-bold mb-2 tracking-tight text-transparent bg-gradient-to-r from-cyan-100 to-blue-200 bg-clip-text group-hover:from-white group-hover:to-cyan-100 transition-all duration-300 line-clamp-1 h-7 md:h-8">
          {studio.name}
        </h3>
        
        {/* Tagline - Fixed height */}
        <p className="text-cyan-200/80 mb-3 text-sm md:text-base line-clamp-2 h-10 md:h-12 leading-relaxed">
          {studio.tagline || 'No description available'}
        </p>
        
        {/* Tags - Fixed height container */}
        <div className="flex gap-2 flex-wrap mb-3 min-h-[32px] md:min-h-[36px]">
          {studio.genre && (
            <span className="inline-flex items-center h-7 md:h-8 px-3 md:px-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-100 text-xs md:text-sm font-semibold border border-cyan-500/30 backdrop-blur-sm">
              {studio.genre}
            </span>
          )}
          {studio.platform && (
            <span className="inline-flex items-center h-7 md:h-8 px-3 md:px-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-100 text-xs md:text-sm font-semibold border border-blue-500/30 backdrop-blur-sm">
              {studio.platform}
            </span>
          )}
        </div>

        {/* Additional Info - Fixed height container */}
        <div className="flex items-center gap-3 mb-4 text-xs md:text-sm text-cyan-300/70 min-h-[20px] md:min-h-[24px]">
          {studio.location && (
            <span className="flex items-center gap-1">
              <span>📍</span>
              <span className="line-clamp-1">{studio.location}</span>
            </span>
          )}
          {studio.teamSize && (
            <span className="flex items-center gap-1">
              <span>👥</span>
              <span>{studio.teamSize}</span>
            </span>
          )}
        </div>

        {/* View Profile Button - Fixed at bottom */}
        <button 
          className="mt-auto w-full h-12 md:h-14 px-4 border-2 border-cyan-500/50 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-100 rounded-xl font-extrabold transition-all duration-300 hover:from-cyan-500/20 hover:to-blue-500/20 hover:text-white hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:-translate-y-1 hover:scale-[1.02] hover:border-cyan-400 shadow-[0_8px_24px_rgba(56,189,248,0.15)] text-sm md:text-base backdrop-blur-sm group-hover:shadow-[0_12px_32px_rgba(56,189,248,0.25)] flex-shrink-0" 
          onClick={() => {
            if (onViewProfile) {
              onViewProfile();
            } else {
              const profileId = (studio as any).fullProfile?.$id || studio.id;
              navigate(`/studio/${profileId}`);
            }
          }}
        >
        <span className="flex items-center justify-center gap-2">
          View Profile
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </span>
      </button>
      </div>
    </article>
  );
});