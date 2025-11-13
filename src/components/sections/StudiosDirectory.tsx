import { useNavigate, useLocation } from 'react-router-dom';


interface StudiosDirectoryProps {
  onCreateProfile?: () => void;
}

export default function StudiosDirectory({ onCreateProfile }: StudiosDirectoryProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isStudiosActive = location.pathname === '/studios_directory';
  const isPublishersActive = location.pathname.startsWith('/studios_directory/publishers');
  const isResourcesActive = location.pathname.startsWith('/studios_directory/resources');

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

          {/* Center Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            <a onClick={() => navigate('/')} className="text-cyan-300 hover:text-white cursor-pointer transition">Home</a>
            <a onClick={() => navigate('/studios_directory')} className={`cursor-pointer transition ${isStudiosActive ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}>Studios</a>
            <a onClick={() => navigate('/studios_directory/publishers')} className={`cursor-pointer transition ${isPublishersActive ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}>Publishers</a>
            <a onClick={() => navigate('/studios_directory/tools')} className={`cursor-pointer transition ${location.pathname.startsWith('/studios_directory/tools') ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}>Tools</a>
            <a onClick={() => navigate('/studios_directory/resources')} className={`cursor-pointer transition ${isResourcesActive ? 'text-white font-semibold' : 'text-cyan-300 hover:text-white'}`}>Resources</a>
          </nav>          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* <button className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition" title="Search">🔍</button> */}
            <button onClick={onCreateProfile} className="px-4 h-10 rounded-xl bg-linear-to-b from-cyan-500 to-cyan-400 text-[#001018] font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all">Create a Profile</button>
          </div>
        </div>
      </header>

      <main className="min-h-screen bg-bg" style={{
        background: `radial-gradient(1000px 600px at 10% -10%, #12203a 10%, transparent 60%),
                     radial-gradient(1200px 700px at 110% 0%, #0a162a 10%, transparent 60%),
                     #0b1020`
      }}>
        <div className="py-12 px-6">
          <div className="max-w-4xl mx-auto text-center py-20 px-6 bg-linear-to-b from-[#07101a]/30 to-[#061018]/20 border border-white/6 rounded-2xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Why list your studio on StudioHub?</h1>
            <p className="text-cyan-300 max-w-3xl mx-auto mb-8">StudioHub connects indie studios with players, collaborators, and partners. Create a clear profile to showcase your games, find talent, discover publishing opportunities, and get discovered by players and press.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-[#071622] border border-white/6 text-left">
                <div className="text-2xl">👀 Visibility</div>
                <div className="text-cyan-300 text-sm mt-1">Be found by publishers, press, and players searching for teams like yours.</div>
              </div>
              <div className="p-4 rounded-xl bg-[#071622] border border-white/6 text-left">
                <div className="text-2xl">🤝 Partnerships</div>
                <div className="text-cyan-300 text-sm mt-1">Showcase your needs and attract collaborators, contractors and partners.</div>
              </div>
              <div className="p-4 rounded-xl bg-[#071622] border border-white/6 text-left">
                <div className="text-2xl">🎯 Talent & Hiring</div>
                <div className="text-cyan-300 text-sm mt-1">List openings or your team size so candidates can find you faster.</div>
              </div>
              <div className="p-4 rounded-xl bg-[#071622] border border-white/6 text-left">
                <div className="text-2xl">💼 Publisher & Funding Leads</div>
                <div className="text-cyan-300 text-sm mt-1">Display your genre, platforms and traction to attract opportunities.</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button onClick={onCreateProfile} className="px-6 py-3 rounded-xl bg-linear-to-b from-cyan-500 to-cyan-400 text-[#001018] font-bold">Create a Profile</button>
              <a href="/studios_directory/resources" className="px-6 py-3 rounded-xl border border-white/8 text-cyan-100">Learn more</a>
            </div>
          </div>

          <div className="max-w-3xl mx-auto mt-12 text-cyan-300">
            <h3 className="text-white font-bold text-xl mb-3">What to include in your profile</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Short tagline and one-paragraph description of your studio and current projects.</li>
              <li>Platforms and tools you use (helps match partners and talent).</li>
              <li>Team size, founding year, and contact email so interested parties can reach you.</li>
              <li>Optional tags to help you surface in specific searches (genre, tech, business model).</li>
            </ul>
          </div>
          
          {/* Extra engagement content: stats, testimonials, trust badges, FAQ, extra CTA */}
          <div className="max-w-6xl mx-auto mt-14 px-4">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="p-4 rounded-lg bg-[#071622] border border-white/6 text-center">
                <div className="text-3xl font-extrabold text-white">1.2k+</div>
                <div className="text-cyan-300 text-sm">Studios listed</div>
              </div>
              <div className="p-4 rounded-lg bg-[#071622] border border-white/6 text-center">
                <div className="text-3xl font-extrabold text-white">85%</div>
                <div className="text-cyan-300 text-sm">Found partners within 6 months</div>
              </div>
              <div className="p-4 rounded-lg bg-[#071622] border border-white/6 text-center">
                <div className="text-3xl font-extrabold text-white">500k+</div>
                <div className="text-cyan-300 text-sm">Monthly impressions</div>
              </div>
              <div className="p-4 rounded-lg bg-[#071622] border border-white/6 text-center">
                <div className="text-3xl font-extrabold text-white">Free</div>
                <div className="text-cyan-300 text-sm">Basic listing stays free</div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="mb-10">
              <h3 className="text-white font-bold text-2xl mb-4 text-center">What studios say</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <blockquote className="bg-[#071622] border border-white/6 rounded-xl p-4 text-cyan-200">
                  <p className="text-white font-semibold mb-2">"Listing on StudioHub brought us our first publisher meeting—within 3 weeks."</p>
                  <footer className="text-sm text-cyan-300">— Aurora Games, Helsinki</footer>
                </blockquote>
                <blockquote className="bg-[#071622] border border-white/6 rounded-xl p-4 text-cyan-200">
                  <p className="text-white font-semibold mb-2">"We hired two contractors through StudioHub and shipped an update faster."</p>
                  <footer className="text-sm text-cyan-300">— Bright Forge, Austin</footer>
                </blockquote>
                <blockquote className="bg-[#071622] border border-white/6 rounded-xl p-4 text-cyan-200">
                  <p className="text-white font-semibold mb-2">"The tags and tools filters connected us with the exact talent we needed."</p>
                  <footer className="text-sm text-cyan-300">— Velvet Fox, Lisbon</footer>
                </blockquote>
              </div>
            </div>

            {/* Trust badges / partners */}
            <div className="mb-10 text-center">
              <h4 className="text-white font-bold mb-4">Trusted by</h4>
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <div className="px-4 py-2 rounded-lg bg-[#071622] border border-white/6 text-cyan-300">IndiePub</div>
                <div className="px-4 py-2 rounded-lg bg-[#071622] border border-white/6 text-cyan-300">GameFund</div>
                <div className="px-4 py-2 rounded-lg bg-[#071622] border border-white/6 text-cyan-300">PressKit</div>
                <div className="px-4 py-2 rounded-lg bg-[#071622] border border-white/6 text-cyan-300">TalentPool</div>
              </div>
            </div>

            {/* FAQ */}
            <div className="mb-12 max-w-4xl mx-auto">
              <h3 className="text-white font-bold text-2xl mb-4 text-center">Frequently asked</h3>
              <div className="space-y-3">
                <details className="bg-[#071622] border border-white/6 rounded-lg p-4 text-cyan-200">
                  <summary className="font-semibold text-white cursor-pointer">Is listing free?</summary>
                  <div className="mt-2 text-sm">Yes. Basic listings are free. We offer optional premium features for increased exposure.</div>
                </details>
                <details className="bg-[#071622] border border-white/6 rounded-lg p-4 text-cyan-200">
                  <summary className="font-semibold text-white cursor-pointer">How long before a profile goes live?</summary>
                  <div className="mt-2 text-sm">Profiles are reviewed by the team; approved profiles usually go live within 24–72 hours.</div>
                </details>
                <details className="bg-[#071622] border border-white/6 rounded-lg p-4 text-cyan-200">
                  <summary className="font-semibold text-white cursor-pointer">Can I update my listing later?</summary>
                  <div className="mt-2 text-sm">Yes — you can update your profile at any time from your dashboard. Re-submissions may be re-reviewed.</div>
                </details>
              </div>
            </div>

            {/* Final CTA */}
            <div className="bg-linear-to-b from-[#07101a]/10 to-[#061018]/10 border border-white/6 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-3">Ready to get discovered?</h3>
              <p className="text-cyan-300 mb-6">Create your StudioHub profile now, it only takes a few minutes and can unlock publishing, hiring, and partnership opportunities.</p>
              <div className="flex items-center justify-center gap-4">
                <button onClick={onCreateProfile} className="px-6 py-3 rounded-xl bg-linear-to-b from-cyan-500 to-cyan-400 text-[#001018] font-bold">Create my Profile</button>
                <a href="/studios_directory/resources" className="px-6 py-3 rounded-xl border border-white/8 text-cyan-100">Browse resources</a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
