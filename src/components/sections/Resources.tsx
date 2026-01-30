import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useHasProfile } from '../../hooks/useHasProfile';
import { AccountMenu } from '../ui/AccountMenu';

// Define the structure for a single resource item, including the new 'link'
interface ResourceItem {
  id: number;
  title: string;
  type: string;
  avatar: string;
  description: string;
  cta: string;
  link: string;
}

interface ResourcesProps {
  onCreateProfile?: () => void;
  onOpenSignup?: () => void;
  onEditProfile?: () => void;
}

/**
 * Updated RESOURCES: famous / widely referenced game dev talks & articles
 */
const RESOURCES: ResourceItem[] = [
  {
    id: 1,
    title: 'MDA Framework (Mechanics, Dynamics, Aesthetics)',
    type: 'Paper (Classic)',
    avatar: '🧩',
    description:
      'A foundational framework for analyzing and designing games by separating mechanics, dynamics, and aesthetics.',
    cta: 'Read Paper →',
    link: 'https://www.cs.northwestern.edu/~hunicke/MDA.pdf' // :contentReference[oaicite:0]{index=0}
  },
  {
    id: 2,
    title: 'The Door Problem',
    type: 'Design Article (Classic)',
    avatar: '🚪',
    description:
      'How “simple” elements like doors reveal big differences in level design philosophy, pacing, and player experience.',
    cta: 'Read Article →',
    link: 'https://www.gamedeveloper.com/design/-quot-the-door-problem-quot-of-game-design' // (same as your original, still great)
  },
  {
    id: 3,
    title: 'Juice It or Lose It',
    type: 'GDC Talk',
    avatar: '✨',
    description:
      'A legendary talk on “juice” (feedback, feel, polish) and how tiny effects can massively improve moment-to-moment play.',
    cta: 'Watch / View Session →',
    link: 'https://www.gdcvault.com/play/1016487/Juice-It-or-Lose' // :contentReference[oaicite:1]{index=1}
  },
  {
    id: 4,
    title: 'Level Design Workshop: Designing Celeste',
    type: 'GDC Talk (Level Design)',
    avatar: '🗺️',
    description:
      'A deep dive into designing hundreds of hardcore platforming rooms, building area maps, and teaching mechanics through level flow.',
    cta: 'Watch Talk →',
    link: 'https://www.youtube.com/watch?v=4RlpMhBKNr0g' // :contentReference[oaicite:2]{index=2}
  },
  {
    id: 5,
    title: "The Gamer's Brain: How Neuroscience & UX Impact Design",
    type: 'GDC Talk (UX / Psychology)',
    avatar: '🧠',
    description:
      'Practical UX + psychology lessons for game designers: attention, memory, perception, and how players actually process what you build.',
    cta: 'Watch Talk →',
    link: 'https://www.youtube.com/watch?v=XIpDLa585ao' // :contentReference[oaicite:3]{index=3}
  },
  {
    id: 6,
    title: 'Level Design Metrics (Scale & Measurements)',
    type: 'Reference Guide',
    avatar: '📏',
    description:
      'A clear, modern explanation of level design metrics: player scale, distances, jump arcs, readability, and consistency across spaces.',
    cta: 'Read Guide →',
    link: 'https://book.leveldesignbook.com/process/blockout/metrics' // :contentReference[oaicite:4]{index=4}
  }
];

// Helper component to display a resource card.
const ResourceCard = ({ resource }: { resource: ResourceItem }) => (
  <a
    href={resource.link}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-[#07101b] border border-white/6 rounded-xl overflow-hidden block transition-all hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10"
    aria-label={`View resource: ${resource.title}`}
  >
    <article>
      <div className="p-4 flex items-center gap-4">
        <div className="w-11 h-11 rounded-lg bg-[#0f172a] text-white font-bold flex items-center justify-center text-xl">
          {resource.avatar}
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-white truncate">{resource.title}</h3>
          <div className="text-sm text-cyan-300 mt-1">{resource.type}</div>
        </div>
      </div>
      <div className="p-4 border-t border-white/6 text-cyan-100">
        <p className="mb-3">{resource.description}</p>
        <span className="inline-block px-3 py-2 rounded-md bg-[#071826] border border-[#123044] text-sm text-cyan-200">
          {resource.cta}
        </span>
      </div>
    </article>
  </a>
);

export default function Resources({ onCreateProfile, onOpenSignup, onEditProfile }: ResourcesProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { hasProfile } = useHasProfile();
  const isStudiosActive = location.pathname === '/studios_directory';
  const isPublishersActive = location.pathname.startsWith('/studios_directory/publishers');
  const isToolsActive = location.pathname.startsWith('/studios_directory/tools');
  const isResourcesActive = location.pathname.startsWith('/studios_directory/resources');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* StudioHub header */}
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

      <main className="min-h-screen py-8 bg-transparent">
        <div className="max-w-[1240px] mx-auto px-6">
          <nav className="text-sm text-cyan-300 mb-6 mt-6">
            <a onClick={() => navigate('/')} className="cursor-pointer hover:text-cyan-100">Home</a>
            <span className="mx-2">›</span>
            <strong className="text-white">Resources</strong>
          </nav>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Game Development Resources</h2>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {RESOURCES.map((r) => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          </section>

          <footer className="mt-8 text-sm text-cyan-300">© {new Date().getFullYear()} StudioHub</footer>
        </div>
      </main>
    </>
  );
}
