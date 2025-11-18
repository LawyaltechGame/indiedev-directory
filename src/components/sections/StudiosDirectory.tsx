import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

interface StudiosDirectoryProps {
  onCreateProfile?: () => void;
}

export default function StudiosDirectory({ onCreateProfile }: StudiosDirectoryProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isStudiosActive = location.pathname === '/studios_directory';
  const isPublishersActive = location.pathname.startsWith('/studios_directory/publishers');
  const isResourcesActive = location.pathname.startsWith('/studios_directory/resources');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // This page now shows a marketing/overview for studios to register.

  return (
    <>
      {/* StudioHub Full Header */}
      <header className="sticky top-0 z-50 bg-linear-to-b bg-[#0B1020] backdrop-blur-xl border-b border-white/8">
        <div className="max-w-[1240px] mx-auto px-6 py-4 flex items-center justify-between h-20">
          {/* Brand */}
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

          {/* Center Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 font-bold">
            <a onClick={() => navigate('/')} className="text-cyan-300 hover:text-white cursor-pointer transition">Home</a>
            <a onClick={() => navigate('/studios_directory')} className={`cursor-pointer transition ${isStudiosActive ? 'text-white' : 'text-cyan-300 hover:text-white'}`}>Studios</a>
            <a onClick={() => navigate('/studios_directory/publishers')} className={`cursor-pointer transition ${isPublishersActive ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}>Publishers</a>
            <a onClick={() => navigate('/studios_directory/tools')} className={`cursor-pointer transition ${location.pathname.startsWith('/studios_directory/tools') ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}>Tools</a>
            <a onClick={() => navigate('/studios_directory/resources')} className={`cursor-pointer transition ${isResourcesActive ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}>Resources</a>
          </nav>
          
          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* <button className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition" title="Search">🔍</button> */}
            <button onClick={onCreateProfile} className="px-4 h-10 rounded-xl bg-linear-to-b from-cyan-500 to-cyan-400 text-[#001018] font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all hidden md:block">Create a Profile</button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 font-bold right-0 bg-[rgba(11,16,32,0.98)] backdrop-blur-[20px] border-b border-white/8 py-4 px-6 z-[60] shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
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

      <main className="min-h-screen bg-bg" style={{
        background: `radial-gradient(1000px 600px at 10% -10%, #12203a 10%, transparent 60%),
                     radial-gradient(1200px 700px at 110% 0%, #0a162a 10%, transparent 60%),
                     #0b1020`
      }}>
        <div className="py-8 md:py-12 px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center py-12 md:py-20 px-4 md:px-6 bg-linear-to-b from-[#07101a]/30 to-[#061018]/20 border border-white/6 rounded-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">Why list your studio on StudioHub?</h1>
            <p className="text-cyan-300 max-w-3xl mx-auto mb-8 text-sm md:text-base">StudioHub connects indie studios with players, collaborators, and partners. Create a clear profile to showcase your games, find talent, discover publishing opportunities, and get discovered by players and press.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-8">
              <div className="p-4 rounded-xl bg-[#071622] border border-white/6 text-left">
                <div className="text-xl md:text-2xl">👀 Visibility</div>
                <div className="text-cyan-300 text-sm mt-1">Be found by publishers, press, and players searching for teams like yours.</div>
              </div>
              <div className="p-4 rounded-xl bg-[#071622] border border-white/6 text-left">
                <div className="text-xl md:text-2xl">🤝 Partnerships</div>
                <div className="text-cyan-300 text-sm mt-1">Showcase your needs and attract collaborators, contractors and partners.</div>
              </div>
              <div className="p-4 rounded-xl bg-[#071622] border border-white/6 text-left">
                <div className="text-xl md:text-2xl">🎯 Talent & Hiring</div>
                <div className="text-cyan-300 text-sm mt-1">List openings or your team size so candidates can find you faster.</div>
              </div>
              <div className="p-4 rounded-xl bg-[#071622] border border-white/6 text-left">
                <div className="text-xl md:text-2xl">💼 Publisher & Funding Leads</div>
                <div className="text-cyan-300 text-sm mt-1">Display your genre, platforms and traction to attract opportunities.</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
              <button onClick={onCreateProfile} className="w-full sm:w-auto px-6 py-3 rounded-xl bg-linear-to-b from-cyan-500 to-cyan-400 text-[#001018] font-bold text-sm md:text-base">Create a Profile</button>
              <a href="/studios_directory/resources" className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/8 text-cyan-100 text-sm md:text-base">Learn more</a>
            </div>
          </div>

          <div className="max-w-3xl mx-auto mt-8 md:mt-12 text-cyan-300 px-4">
            <h3 className="text-white font-bold text-lg md:text-xl mb-3">What to include in your profile</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm md:text-base">
              <li>Short tagline and one-paragraph description of your studio and current projects.</li>
              <li>Platforms and tools you use (helps match partners and talent).</li>
              <li>Team size, founding year, and contact email so interested parties can reach you.</li>
              <li>Optional tags to help you surface in specific searches (genre, tech, business model).</li>
            </ul>
          </div>
          
          {/* Extra engagement content: stats, testimonials, trust badges, FAQ, extra CTA */}
          <div className="max-w-6xl mx-auto mt-10 md:mt-14 px-4">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-8">
              <div className="p-3 md:p-4 rounded-lg bg-[#071622] border border-white/6 text-center">
                <div className="text-2xl md:text-3xl font-extrabold text-white">1.2k+</div>
                <div className="text-cyan-300 text-xs md:text-sm">Studios listed</div>
              </div>
              <div className="p-3 md:p-4 rounded-lg bg-[#071622] border border-white/6 text-center">
                <div className="text-2xl md:text-3xl font-extrabold text-white">85%</div>
                <div className="text-cyan-300 text-xs md:text-sm">Found partners within 6 months</div>
              </div>
              <div className="p-3 md:p-4 rounded-lg bg-[#071622] border border-white/6 text-center">
                <div className="text-2xl md:text-3xl font-extrabold text-white">500k+</div>
                <div className="text-cyan-300 text-xs md:text-sm">Monthly impressions</div>
              </div>
              <div className="p-3 md:p-4 rounded-lg bg-[#071622] border border-white/6 text-center">
                <div className="text-2xl md:text-3xl font-extrabold text-white">Free</div>
                <div className="text-cyan-300 text-xs md:text-sm">Basic listing stays free</div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="mb-8 md:mb-10">
              <h3 className="text-white font-bold text-xl md:text-2xl mb-4 text-center">What studios say</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <blockquote className="bg-[#071622] border border-white/6 rounded-xl p-4 text-cyan-200">
                  <p className="text-white font-semibold mb-2 text-sm md:text-base">"Listing on StudioHub brought us our first publisher meeting—within 3 weeks."</p>
                  <footer className="text-xs md:text-sm text-cyan-300">— Aurora Games, Helsinki</footer>
                </blockquote>
                <blockquote className="bg-[#071622] border border-white/6 rounded-xl p-4 text-cyan-200">
                  <p className="text-white font-semibold mb-2 text-sm md:text-base">"We hired two contractors through StudioHub and shipped an update faster."</p>
                  <footer className="text-xs md:text-sm text-cyan-300">— Bright Forge, Austin</footer>
                </blockquote>
                <blockquote className="bg-[#071622] border border-white/6 rounded-xl p-4 text-cyan-200">
                  <p className="text-white font-semibold mb-2 text-sm md:text-base">"The tags and tools filters connected us with the exact talent we needed."</p>
                  <footer className="text-xs md:text-sm text-cyan-300">— Velvet Fox, Lisbon</footer>
                </blockquote>
              </div>
            </div>

            {/* Trust badges / partners */}
            <div className="mb-8 md:mb-10 text-center">
              <h4 className="text-white font-bold mb-4 text-base md:text-lg">Trusted by</h4>
              <div className="flex items-center justify-center gap-3 md:gap-6 flex-wrap">
                <div className="px-3 md:px-4 py-2 rounded-lg bg-[#071622] border border-white/6 text-cyan-300 text-sm md:text-base">IndiePub</div>
                <div className="px-3 md:px-4 py-2 rounded-lg bg-[#071622] border border-white/6 text-cyan-300 text-sm md:text-base">GameFund</div>
                <div className="px-3 md:px-4 py-2 rounded-lg bg-[#071622] border border-white/6 text-cyan-300 text-sm md:text-base">PressKit</div>
                <div className="px-3 md:px-4 py-2 rounded-lg bg-[#071622] border border-white/6 text-cyan-300 text-sm md:text-base">TalentPool</div>
              </div>
            </div>

            {/* FAQ */}
            <div className="mb-10 md:mb-12 max-w-4xl mx-auto">
              <h3 className="text-white font-bold text-xl md:text-2xl mb-4 text-center">Frequently asked</h3>
              <div className="space-y-3">
                <details className="bg-[#071622] border border-white/6 rounded-lg p-4 text-cyan-200">
                  <summary className="font-semibold text-white cursor-pointer text-sm md:text-base">Is listing free?</summary>
                  <div className="mt-2 text-sm">Yes. Basic listings are free. We offer optional premium features for increased exposure.</div>
                </details>
                <details className="bg-[#071622] border border-white/6 rounded-lg p-4 text-cyan-200">
                  <summary className="font-semibold text-white cursor-pointer text-sm md:text-base">How long before a profile goes live?</summary>
                  <div className="mt-2 text-sm">Profiles are reviewed by the team; approved profiles usually go live within 24–72 hours.</div>
                </details>
                <details className="bg-[#071622] border border-white/6 rounded-lg p-4 text-cyan-200">
                  <summary className="font-semibold text-white cursor-pointer text-sm md:text-base">Can I update my listing later?</summary>
                  <div className="mt-2 text-sm">Yes — you can update your profile at any time from your dashboard. Re-submissions may be re-reviewed.</div>
                </details>
              </div>
            </div>

            {/* Final CTA */}
            <div className="bg-linear-to-b from-[#07101a]/10 to-[#061018]/10 border border-white/6 rounded-2xl p-6 md:p-8 text-center">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3">Ready to get discovered?</h3>
              <p className="text-cyan-300 mb-6 text-sm md:text-base">Create your StudioHub profile now, it only takes a few minutes and can unlock publishing, hiring, and partnership opportunities.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
                <button onClick={onCreateProfile} className="w-full sm:w-auto px-6 py-3 rounded-xl bg-linear-to-b from-cyan-500 to-cyan-400 text-[#001018] font-bold text-sm md:text-base">Create my Profile</button>
                <a href="/studios_directory/resources" className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/8 text-cyan-100 text-sm md:text-base">Browse resources</a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}