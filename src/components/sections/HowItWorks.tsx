export function HowItWorks() {
  return (
    <section className="py-12 md:py-18" id="how">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center tracking-tight bg-linear-to-r from-cyan-100 via-cyan-300 to-cyan-100 bg-clip-text text-transparent">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-[rgba(20,28,42,0.6)] backdrop-blur-[10px] border border-white/8 rounded-2xl p-4 md:p-4.5 flex gap-3 md:gap-3.5 shadow-[0_10px_28px_rgba(0,0,0,0.35)] animate-fade-up">
            <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] flex items-center justify-center font-black shadow-[0_8px_18px_rgba(56,189,248,0.28)]">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-1.5 text-base md:text-lg">Create a Profile</h3>
              <p className="text-cyan-200 text-sm">
                Add your studio details, platforms, and projects.
              </p>
            </div>
          </div>

          <div className="bg-[rgba(20,28,42,0.6)] backdrop-blur-[10px] border border-white/8 rounded-2xl p-4 md:p-4.5 flex gap-3 md:gap-3.5 shadow-[0_10px_28px_rgba(0,0,0,0.35)] animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] flex items-center justify-center font-black shadow-[0_8px_18px_rgba(56,189,248,0.28)]">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-1.5 text-base md:text-lg">Get Discovered</h3>
              <p className="text-cyan-200 text-sm">
                Be found by genre, platform, tags, and more.
              </p>
            </div>
          </div>

          <div className="bg-[rgba(20,28,42,0.6)] backdrop-blur-[10px] border border-white/8 rounded-2xl p-4 md:p-4.5 flex gap-3 md:gap-3.5 shadow-[0_10px_28px_rgba(0,0,0,0.35)] animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] flex items-center justify-center font-black shadow-[0_8px_18px_rgba(56,189,248,0.28)]">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-1.5 text-base md:text-lg">Connect & Grow</h3>
              <p className="text-cyan-200 text-sm">
                Receive inquiries and build partnerships.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
