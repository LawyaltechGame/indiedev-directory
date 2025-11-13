import { useNavigate, useLocation } from 'react-router-dom';

interface ToolsProps {
  onCreateProfile?: () => void;
}

const TOOLS_DATA = [
  {
    id: 1,
    name: 'Unity',
    category: 'Game Engine',
    avatar: 'U',
    description: 'Cross-platform 3D/2D engine with a strong asset ecosystem.',
    meta: [
      { icon: '💻', text: 'Platforms: All' },
      { icon: '⭐', text: 'Rating: 4.7' }
    ]
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
    ]
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
    ]
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
    ]
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
    ]
  }
];

export default function Tools({ onCreateProfile }: ToolsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isStudiosActive = location.pathname === '/studios_directory';
  const isPublishersActive = location.pathname.startsWith('/studios_directory/publishers');
  const isToolsActive = location.pathname.startsWith('/studios_directory/tools');
  const isResourcesActive = location.pathname.startsWith('/studios_directory/resources');

  return (
    <>
      {/* StudioHub header */}
      <header className="sticky top-0 z-50 bg-linear-to-b bg-[#0B1020] backdrop-blur-xl border-b border-white/8">
        <div className="max-w-[1240px] mx-auto px-6 py-4 flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-400 to-cyan-500 flex items-center justify-center text-[#001018] font-bold text-lg">S</div>
            <span className="text-xl font-extrabold text-white hidden sm:block">StudioHub</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a onClick={() => navigate('/')} className="text-cyan-300 hover:text-white cursor-pointer transition">Home</a>
            <a onClick={() => navigate('/studios_directory')} className={`cursor-pointer transition ${isStudiosActive ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}>Studios</a>
            <a onClick={() => navigate('/studios_directory/publishers')} className={`cursor-pointer transition ${isPublishersActive ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}>Publishers</a>
            <a onClick={() => navigate('/studios_directory/tools')} className={`cursor-pointer transition ${isToolsActive ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}>Tools</a>
            <a onClick={() => navigate('/studios_directory/resources')} className={`cursor-pointer transition ${isResourcesActive ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}>Resources</a>
          </nav>

          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition" title="Search">🔍</button>
            <button onClick={onCreateProfile} className="px-4 h-10 rounded-xl bg-linear-to-b from-cyan-500 to-cyan-400 text-[#001018] font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all">Create a Profile</button>
          </div>
        </div>
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
                <article key={tool.id} className="bg-[#07101b] border border-white/6 rounded-xl overflow-hidden">
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
              ))}
            </div>
          </section>

          <footer className="mt-8 text-sm text-cyan-300">© {new Date().getFullYear()} StudioHub</footer>
        </div>
      </main>
    </>
  );
}
