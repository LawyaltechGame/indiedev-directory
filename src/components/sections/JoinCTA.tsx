interface JoinCTAProps {
  onCreateProfile: () => void;
}

export function JoinCTA({ onCreateProfile }: JoinCTAProps) {
  return (
    <section className="h-[300px] flex items-center justify-center text-center bg-linear-to-r from-purple-600 to-purple-400 border-t border-white/8">
      <div className="max-w-4xl mx-auto p-5">
        <h2 className="text-3xl font-extrabold mb-3">Ready to showcase your work?</h2>
        <p className="text-lg mb-6">
          Create your profile today and get discovered.
        </p>
        <button 
          className="bg-white text-[#0b0f18] px-8 py-3.5 font-extrabold border-0 rounded-xl cursor-pointer transition-all duration-200 hover:bg-[#0b0f18] hover:text-white shadow-[0_10px_26px_rgba(0,0,0,0.25)]"
          onClick={onCreateProfile}
        >
          Create a Profile
        </button>
      </div>
    </section>
  );
}
