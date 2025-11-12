import { useRef, memo } from 'react';
import type { Studio } from '../../types';

interface TiltCardProps {
  studio: Studio;
  delay?: number;
  onViewProfile?: () => void;
}

export const TiltCard = memo(function TiltCard({ studio, delay = 0, onViewProfile }: TiltCardProps) {
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
      className="w-80 min-h-[330px] transition-all duration-300 bg-[rgba(20,28,42,0.6)] backdrop-blur-[10px] border border-white/8 rounded-2xl p-4.5 shadow-[0_14px_36px_rgba(0,0,0,0.35)] relative transform-gpu animate-fade-up hover:-translate-y-2 hover:shadow-[0_28px_64px_rgba(34,211,238,0.28)] hover:border-cyan-500/50 hover:scale-[1.02] group"
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
      <button className="w-full h-12 px-4 border border-cyan-500 bg-[rgba(9,14,22,0.55)] text-cyan-100 rounded-xl font-extrabold transition-all duration-300 hover:bg-[rgba(0,229,255,0.12)] hover:text-white hover:shadow-[0_0_15px_rgba(0,229,255,0.45)] hover:-translate-y-1 hover:scale-[1.02] group-hover:border-cyan-400 shadow-[0_10px_28px_rgba(56,189,248,0.20)]" onClick={onViewProfile}>
        <span className="flex items-center justify-center gap-2">
          View Profile
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </span>
      </button>
    </article>
  );
});
