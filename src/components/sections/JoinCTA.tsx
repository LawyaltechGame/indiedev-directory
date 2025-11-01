interface JoinCTAProps {
  onCreateProfile: () => void;
  hasPendingProfile?: boolean;
  isTeamMember?: boolean;
}

export function JoinCTA({ onCreateProfile, hasPendingProfile = false, isTeamMember = false }: JoinCTAProps) {
  return (
    <section className="h-[300px] flex items-center justify-center text-center bg-linear-to-r from-purple-600 to-purple-400 border-t border-white/8">
      <div className="max-w-4xl mx-auto p-5">
        {isTeamMember ? (
          <>
            <h2 className="text-3xl font-extrabold mb-3">Team Member Dashboard</h2>
            <p className="text-lg mb-6">
              Review and manage profiles from the Review Dashboard.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-extrabold mb-3">Ready to showcase your work?</h2>
            <p className="text-lg mb-6">
              {hasPendingProfile 
                ? 'Your profile is currently under review. We\'ll notify you once it\'s been reviewed.'
                : 'Create your profile today and get discovered.'}
            </p>
            <button 
              className={`px-8 py-3.5 font-extrabold border-0 rounded-xl transition-all duration-200 shadow-[0_10px_26px_rgba(0,0,0,0.25)] ${
                hasPendingProfile
                  ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 cursor-not-allowed'
                  : 'bg-white text-[#0b0f18] cursor-pointer hover:bg-[#0b0f18] hover:text-white'
              }`}
              onClick={onCreateProfile}
              disabled={hasPendingProfile}
            >
              {hasPendingProfile ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="animate-pulse">⏳</span>
                  Review Pending
                </span>
              ) : (
                'Create a Profile'
              )}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
