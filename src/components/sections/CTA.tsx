interface CTAProps {}

export function CTA({}: CTAProps) {
  return (
    <section className="py-18 relative">
      <div className="max-w-7xl mx-auto px-6 relative overflow-hidden flex items-center justify-between gap-4 rounded-2xl bg-linear-to-br from-[rgba(0,229,255,0.18)] to-[rgba(15,24,40,0.9)] border border-cyan-500/35 shadow-[0_18px_40px_rgba(34,211,238,0.18)] p-6">
        <div>
          <h3 className="text-2xl font-bold mb-1.5">Ready to showcase your studio?</h3>
          <p className="text-cyan-200 text-sm">
            Create a profile and start getting discovered today in StudioHub.
          </p>
        </div>
      </div>
      <div className="absolute top-[-60%] left-[-20%] w-[70%] h-[220%] bg-linear-to-br from-white/16 to-transparent transform rotate-10 blur-[26px] pointer-events-none" aria-hidden />
    </section>
  );
}
