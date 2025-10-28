export function Footer() {
  return (
    <footer className="mt-0 border-t border-white/8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
        <div>
          <h4 className="font-bold mb-2">About</h4>
          <p className="text-cyan-200 text-sm">
            IndieDev Directory is a curated hub for discovering indie game
            studios globally.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-2">Contact</h4>
          <p className="text-cyan-200 text-sm">hello@indiedev.directory</p>
        </div>
        <div>
          <h4 className="font-bold mb-2">Newsletter</h4>
          <div className="flex border border-white/8 rounded-2xl overflow-hidden bg-[rgba(10,16,28,0.65)]">
            <input placeholder="Your email" className="flex-1 bg-transparent border-0 text-cyan-100 px-3" />
            <button className="h-12 px-4 bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] font-extrabold rounded-xl border-0 cursor-pointer transition-all duration-200 hover:from-cyan-400 hover:to-cyan-500 active:scale-[0.995] active:translate-y-px shadow-[0_8px_22px_rgba(34,211,238,0.35)]">
              Subscribe
            </button>
          </div>
        </div>
      </div>
      <div className="text-cyan-200 text-center text-sm py-3 pb-6">
        © {new Date().getFullYear()} IndieDev Directory. All rights reserved.
      </div>
    </footer>
  );
}
