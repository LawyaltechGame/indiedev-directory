interface JoinCTAProps {}

export function JoinCTA({}: JoinCTAProps) {
  return (
    <section className="min-h-[250px] md:min-h-[300px] flex items-center justify-center text-center bg-linear-to-r from-purple-600 to-purple-400 border-t border-white/8 py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Join the Community</h2>
        <p className="text-base md:text-lg mb-6 px-2">
          Discover amazing indie game studios and connect with creators from around the world. Create your profile in StudioHub!
        </p>
        <a
          href="#directory"
          onClick={(e) => {
            e.preventDefault();
            const element = document.getElementById('directory');
            if (element) {
              const offset = 80;
              const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
              const offsetPosition = elementPosition - offset;
              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
              });
            }
          }}
          className="inline-block px-6 md:px-8 py-3 md:py-3.5 font-extrabold border-0 rounded-xl transition-all duration-200 shadow-[0_10px_26px_rgba(0,0,0,0.25)] bg-white text-[#0b0f18] cursor-pointer hover:bg-[#0b0f18] hover:text-white no-underline text-sm md:text-base"
        >
          Browse Directory
        </a>
      </div>
    </section>
  );
}
