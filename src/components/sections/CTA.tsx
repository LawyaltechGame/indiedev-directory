interface CTAProps {
  onCreateProfile: () => void;
}

export function CTA({ onCreateProfile }: CTAProps) {
  return (
    <section className="py-18 relative">
      <div className="max-w-7xl mx-auto px-6 relative overflow-hidden flex items-center justify-between gap-4 rounded-2xl bg-linear-to-br from-[rgba(0,229,255,0.18)] to-[rgba(15,24,40,0.9)] border border-cyan-500/35 shadow-[0_18px_40px_rgba(34,211,238,0.18)] p-6">
        <div>
          <h3 className="text-2xl font-bold mb-1.5">Ready to showcase your studio?</h3>
          <p className="text-cyan-200 text-sm">
            Create a profile and start getting discovered today.
          </p>
        </div>
      </div>
      <div className="flex gap-3 justify-center mt-4">
        <button
          className="h-14 px-6 bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] font-extrabold rounded-xl border-0 cursor-pointer transition-all duration-200 hover:from-cyan-400 hover:to-cyan-500 active:scale-[0.995] active:translate-y-px shadow-[0_8px_22px_rgba(34,211,238,0.35)] text-base"
          onClick={onCreateProfile}
        >
          Create a Profile
        </button>
        <button className="h-14 px-6 border border-cyan-500 bg-[rgba(9,14,22,0.55)] text-cyan-100 rounded-xl font-extrabold transition-all duration-200 hover:bg-[rgba(0,229,255,0.12)] hover:text-white hover:shadow-[0_0_10px_rgba(0,229,255,0.35)] hover:-translate-y-0.5 shadow-[0_10px_28px_rgba(56,189,248,0.20)] text-base">
          Learn More
        </button>
      </div>
      <div className="absolute top-[-60%] left-[-20%] w-[70%] h-[220%] bg-linear-to-br from-white/16 to-transparent transform rotate-10 blur-[26px] pointer-events-none" aria-hidden />
    </section>
  );
}
