import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface ResourcesProps {
  onCreateProfile?: () => void;
}

const RESOURCES = [
  {
    id: 1,
    title: 'Game Design Principles',
    type: 'Article',
    avatar: '🎨',
    description: 'Learn key design foundations to improve player engagement, feedback loops, and flow.',
    cta: 'Read More →'
  },
  {
    id: 2,
    title: 'Funding for Game Developers',
    type: 'Guide',
    avatar: '💰',
    description: 'Explore grants, publisher programs, and crowdfunding strategies for your next project.',
    cta: 'View Guide →'
  },
  {
    id: 3,
    title: 'Community & Marketing',
    type: 'Article',
    avatar: '🌍',
    description: 'Practical tips for building an authentic player community and marketing your games effectively.',
    cta: 'Explore →'
  },
  {
    id: 4,
    title: 'Learning Hubs & Docs',
    type: 'Collection',
    avatar: '📚',
    description: 'A curated list of tutorials, tool documentation, and official learning resources for devs.',
    cta: 'Open Collection →'
  }
];

export default function Resources({ onCreateProfile }: ResourcesProps) {
  const navigate = useNavigate();
  const location = useLocation();
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
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-400 to-cyan-500 flex items-center justify-center text-[#001018] font-bold text-lg">S</div>
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
            {/* <button className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition hidden md:block" title="Search">🔍</button> */}
            <button onClick={onCreateProfile} className="px-4 h-10 rounded-xl bg-linear-to-b from-cyan-500 to-cyan-400 text-[#001018] font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all hidden md:block">Create a Profile</button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#0B1020] backdrop-blur-xl border-b border-white/8 py-4 px-6">
            <nav className="flex flex-col gap-4 font-bold">
              <a
                onClick={() => { navigate('/'); setIsMenuOpen(false); }}
                className="text-cyan-300 hover:text-white cursor-pointer transition py-2"
              >
                Home
              </a>
              <a
                onClick={() => { navigate('/studios_directory'); setIsMenuOpen(false); }}
                className={`cursor-pointer transition py-2 ${isStudiosActive ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}
              >
                Studios
              </a>
              <a
                onClick={() => { navigate('/studios_directory/publishers'); setIsMenuOpen(false); }}
                className={`cursor-pointer transition py-2 ${isPublishersActive ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}
              >
                Publishers
              </a>
              <a
                onClick={() => { navigate('/studios_directory/tools'); setIsMenuOpen(false); }}
                className={`cursor-pointer transition py-2 ${isToolsActive ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}
              >
                Tools
              </a>
              <a
                onClick={() => { navigate('/studios_directory/resources'); setIsMenuOpen(false); }}
                className={`cursor-pointer transition py-2 ${isResourcesActive ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}
              >
                Resources
              </a>
              {/* <button className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition" title="Search">🔍</button> */}
              {onCreateProfile && (
                <button 
                  onClick={() => { onCreateProfile(); setIsMenuOpen(false); }}
                  className="px-4 h-10 rounded-xl bg-linear-to-b from-cyan-500 to-cyan-400 text-[#001018] font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                >
                  Create a Profile
                </button>
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
                <article key={r.id} className="bg-[#07101b] border border-white/6 rounded-xl overflow-hidden">
                  <div className="p-4 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-lg bg-[#0f172a] text-white font-bold flex items-center justify-center text-xl">{r.avatar}</div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-white truncate">{r.title}</h3>
                      <div className="text-sm text-cyan-300 mt-1">{r.type}</div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-white/6 text-cyan-100">
                    <p className="mb-3">{r.description}</p>
                    <a className="inline-block px-3 py-2 rounded-md bg-[#071826] border border-[#123044] text-sm text-cyan-200">{r.cta}</a>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <footer className="mt-8 text-sm text-cyan-300">© {new Date().getFullYear()} StudioHub</footer>
        </div>
      </main>
    </>
  );
}