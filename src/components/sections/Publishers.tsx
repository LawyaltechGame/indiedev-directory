import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface PublishersProps {
  onCreateProfile?: () => void;
}

export default function Publishers({ onCreateProfile }: PublishersProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isStudiosActive = location.pathname === '/studios_directory';
  const isPublishersActive = location.pathname.startsWith('/studios_directory/publishers');
  const isResourcesActive = location.pathname.startsWith('/studios_directory/resources');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* StudioHub header (same as in StudiosDirectory) */}
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
            <a onClick={() => navigate('/studios_directory/tools')} className={`cursor-pointer transition ${location.pathname.startsWith('/studios_directory/tools') ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}>Tools</a>
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
                className={`cursor-pointer transition py-2 ${location.pathname.startsWith('/studios_directory/tools') ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}
              >
                Tools
              </a>
              <a
                onClick={() => { navigate('/studios_directory/resources'); setIsMenuOpen(false); }}
                className={`cursor-pointer transition py-2 ${isResourcesActive ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}
              >
                Resources
              </a>
              <button className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition" title="Search">🔍</button>
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
            <strong className="text-white">Publishers</strong>
          </nav>

        <section id="publishers">
          <h2 className="text-2xl font-semibold text-white mb-4">Featured Publishers</h2>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <article className="bg-[#07101b] border border-white/6 rounded-xl overflow-hidden">
              <div className="p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-[#0f172a] text-white font-bold flex items-center justify-center">L</div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">Lighthouse Interactive</h3>
                  <div className="text-sm text-cyan-300 mt-1">📍 Seattle, USA</div>
                </div>
              </div>
              <div className="p-4 border-t border-white/6 text-cyan-100">
                <p className="mb-3">Mid-size publisher supporting creative indie teams worldwide.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-[#071826] border border-[#123044] rounded-md text-sm">📅 Founded 2015</span>
                  <span className="px-3 py-1.5 bg-[#071826] border border-[#123044] rounded-md text-sm">🎮 Focus: Indie, Narrative</span>
                </div>
              </div>
            </article>

            <article className="bg-[#07101b] border border-white/6 rounded-xl overflow-hidden">
              <div className="p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-[#0f172a] text-white font-bold flex items-center justify-center">N</div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">Nebula Publishing</h3>
                  <div className="text-sm text-cyan-300 mt-1">📍 London, UK</div>
                </div>
              </div>
              <div className="p-4 border-t border-white/6 text-cyan-100">
                <p className="mb-3">Specializing in AA and narrative-driven games for console and PC.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-[#071826] border border-[#123044] rounded-md text-sm">📅 Founded 2011</span>
                  <span className="px-3 py-1.5 bg-[#071826] border border-[#123044] rounded-md text-sm">🎮 Focus: AA, Storytelling</span>
                </div>
              </div>
            </article>

            <article className="bg-[#07101b] border border-white/6 rounded-xl overflow-hidden">
              <div className="p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-[#0f172a] text-white font-bold flex items-center justify-center">S</div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">Starling Media</h3>
                  <div className="text-sm text-cyan-300 mt-1">📍 Tokyo, JP</div>
                </div>
              </div>
              <div className="p-4 border-t border-white/6 text-cyan-100">
                <p className="mb-3">Global distribution partner helping Asian devs reach new markets.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-[#071826] border border-[#123044] rounded-md text-sm">📅 Founded 2008</span>
                  <span className="px-3 py-1.5 bg-[#071826] border border-[#123044] rounded-md text-sm">🌐 Focus: Asia-Pacific, Global</span>
                </div>
              </div>
            </article>
          </div>
        </section>

        <footer className="mt-8 text-sm text-cyan-300">© {new Date().getFullYear()} StudioHub</footer>
      </div>
    </main>
    </>
  );
}