export function WhyJoin() {
  return (
    <section id="why" className="py-18">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-6 text-center tracking-tight bg-linear-to-r from-cyan-100 via-cyan-300 to-cyan-100 bg-clip-text text-transparent">
          Why Join?
        </h2>
        <div className="border-4 border-white/8 rounded-lg overflow-hidden bg-[rgba(10,16,28,0.3)] mt-5">
          <div className="grid grid-cols-[240px_1fr] items-center">
            <div className="p-4 text-left font-bold">Benefit</div>
            <div className="p-4 text-right">Description</div>
          </div>

          <div className="grid grid-cols-[240px_1fr] items-center border-b border-white/8 transition-colors duration-200 hover:bg-[rgba(0,229,255,0.05)]">
            <div className="p-4 text-left">Visibility</div>
            <div className="p-4 text-right text-cyan-200 text-sm">
              Reach publishers, investors, collaborators, and fans.
            </div>
          </div>

          <div className="grid grid-cols-[240px_1fr] items-center border-b border-white/8 transition-colors duration-200 hover:bg-[rgba(0,229,255,0.05)]">
            <div className="p-4 text-left">Collaboration</div>
            <div className="p-4 text-right text-cyan-200 text-sm">
              Find artists, devs, QA, and other creators.
            </div>
          </div>

          <div className="grid grid-cols-[240px_1fr] items-center border-b border-white/8 transition-colors duration-200 hover:bg-[rgba(0,229,255,0.05)]">
            <div className="p-4 text-left">Professional Presence</div>
            <div className="p-4 text-right text-cyan-200 text-sm">
              Share your portfolio and projects.
            </div>
          </div>

          <div className="grid grid-cols-[240px_1fr] items-center transition-colors duration-200 hover:bg-[rgba(0,229,255,0.05)]">
            <div className="p-4 text-left">Industry Insights</div>
            <div className="p-4 text-right text-cyan-200 text-sm">
              Access resources and opportunities.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
