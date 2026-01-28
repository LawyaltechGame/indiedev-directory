import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AccountMenu } from '../ui/AccountMenu';

// Define the structure for the tool meta data
interface ToolMeta {
  icon: string;
  text: string;
}

// Define the structure for a single tool item, including the new 'link'
interface ToolItem {
  id: number;
  name: string;
  category: string;
  avatar: string;
  description: string;
  meta: ToolMeta[];
  link: string; // Added link property
}

interface ToolsProps {
  onCreateProfile?: () => void;
  onOpenSignup?: () => void;
  onEditProfile?: () => void;
}

// Updated TOOLS_DATA with official page links
const TOOLS_DATA: ToolItem[] = [
  {
    id: 1,
    name: 'Unity',
    category: 'Game Engine',
    avatar: 'U',
    description: 'Cross-platform 3D/2D engine with a strong asset ecosystem.',
    meta: [
      { icon: '💻', text: 'Platforms: All' },
      { icon: '⭐', text: 'Rating: 4.7' }
    ],
    link: 'https://unity.com/' // Unity official link
  },
  {
    id: 2,
    name: 'Unreal Engine',
    category: 'Game Engine',
    avatar: 'U',
    description: 'AAA-grade engine with visual scripting and cinematic power.',
    meta: [
      { icon: '💻', text: 'Platforms: All' },
      { icon: '⭐', text: 'Rating: 4.9' }
    ],
    link: 'https://www.unrealengine.com/' // Unreal Engine official link
  },
  {
    id: 3,
    name: 'Godot',
    category: 'Game Engine',
    avatar: 'G',
    description: 'Open-source, lightweight engine with scene-based architecture.',
    meta: [
      { icon: '💻', text: 'Platforms: All' },
      { icon: '⭐', text: 'Rating: 4.8' }
    ],
    link: 'https://godotengine.org/' // Godot official link
  },
  {
    id: 4,
    name: 'Blender',
    category: 'Art & Animation',
    avatar: 'B',
    description: 'Powerful 3D modeling, animation, and rendering suite — free and open source.',
    meta: [
      { icon: '💻', text: 'Platforms: All' },
      { icon: '⭐', text: 'Rating: 4.9' }
    ],
    link: 'https://www.blender.org/' // Blender official link
  },
  {
    id: 5,
    name: 'FMOD',
    category: 'Audio',
    avatar: 'F',
    description: 'Adaptive audio middleware for interactive music, mixing, and sound design.',
    meta: [
      { icon: '💻', text: 'Platforms: All' },
      { icon: '⭐', text: 'Rating: 4.6' }
    ],
    link: 'https://www.fmod.com/' // FMOD official link
  }
];

// Helper component to display a tool card.
// We'll use a standard <a> tag around the card for the link
const ToolCard = ({ tool }: { tool: ToolItem }) => (
  <a 
    href={tool.link} // Use the link property here
    target="_blank" // Open link in a new tab
    rel="noopener noreferrer" // Security best practice for target="_blank"
    className="bg-[#07101b] border border-white/6 rounded-xl overflow-hidden block transition-all hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10"
    aria-label={`View official page for ${tool.name}`}
  >
    <article>
      <div className="p-4 flex items-center gap-4">
        <div className="w-11 h-11 rounded-lg bg-[#0f172a] text-white font-bold flex items-center justify-center">{tool.avatar}</div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-white truncate">{tool.name}</h3>
          <div className="text-sm text-cyan-300 mt-1">{tool.category}</div>
        </div>
      </div>
      <div className="p-4 border-t border-white/6 text-cyan-100">
        <p className="mb-3">{tool.description}</p>
        <div className="flex flex-wrap gap-2">
          {tool.meta.map((item, idx) => (
            <span key={idx} className="px-3 py-1.5 bg-[#071826] border border-[#123044] rounded-md text-sm">{item.icon} {item.text}</span>
          ))}
        </div>
      </div>
    </article>
  </a>
);


export default function Tools({ onCreateProfile, onOpenSignup, onEditProfile }: ToolsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
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
            {user ? (
              <AccountMenu
                displayName={(user as any).name || (user as any).email}
                items={[
                  { id: 'add-company', label: 'Add company', onClick: () => onCreateProfile?.() },
                  { id: 'settings', label: 'Settings', onClick: () => navigate('/account/settings') },
                  { id: 'edit-profile', label: 'Edit profile', onClick: () => onEditProfile?.() },
                  { id: 'logout', label: 'Logout', tone: 'danger', onClick: () => logout() },
                ]}
              />
            ) : (
              <button onClick={onOpenSignup} className="px-4 h-10 rounded-xl bg-linear-to-b from-cyan-500 to-cyan-400 text-[#001018] font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all hidden md:block">Sign up to create a profile</button>
            )}
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
              {user ? (
                onCreateProfile && (
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
            <strong className="text-white">Tools</strong>
          </nav>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Popular Development Tools</h2>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {TOOLS_DATA.map((tool) => (
                // Replaced the original <article> tag with the new ToolCard component
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>

          <footer className="mt-8 text-sm text-cyan-300">© {new Date().getFullYear()} StudioHub</footer>
        </div>
      </main>
    </>
  );
}