import { useAuth } from '../../contexts/AuthContext';
import { useTeamMember } from '../../hooks/useTeamMember';

interface HeaderProps {
  navShrunk: boolean;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onOpenDashboard?: () => void;
}

export function Header({ navShrunk, onOpenLogin, onOpenSignup, onOpenDashboard }: HeaderProps) {
  const { user, logout, loading: authLoading } = useAuth();
  const { isTeamMember, loading: teamLoading } = useTeamMember();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (authLoading || teamLoading) {
    return (
      <header className={`fixed top-1 left-0 right-0 z-50 transition-all duration-300 ${
        navShrunk ? 'bg-[rgba(7,11,18,0.7)] backdrop-blur-[14px]' : 'bg-[rgba(7,11,18,0.55)] backdrop-blur-md'
      } border-b border-white/8`}>
        <div className="h-20 flex items-center justify-between gap-4 px-6 max-w-7xl mx-auto">
          <a className="flex items-center gap-3 font-extrabold text-white no-underline" href="#hero" aria-label="Home">
            <div className="w-9 h-9 rounded-[10px] bg-linear-to-br from-cyan-400 via-cyan-300 to-cyan-500 shadow-[0_8px_18px_rgba(56,189,248,0.25)]" />
            <span>IndieDev Directory</span>
          </a>
          <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
        </div>
      </header>
    );
  }

  return (
    <header className={`fixed top-1 left-0 right-0 z-50 transition-all duration-300 ${
      navShrunk ? 'bg-[rgba(7,11,18,0.7)] backdrop-blur-[14px]' : 'bg-[rgba(7,11,18,0.55)] backdrop-blur-md'
    } border-b border-white/8`}>
      <div className="h-20 flex items-center justify-between gap-4 px-6 max-w-7xl mx-auto">
        <a className="flex items-center gap-3 font-extrabold text-white no-underline" href="#hero" aria-label="Home">
          <div className="w-9 h-9 rounded-[10px] bg-linear-to-br from-cyan-400 via-cyan-300 to-cyan-500 shadow-[0_8px_18px_rgba(56,189,248,0.25)]" />
          <span>IndieDev Directory</span>
        </a>
        <div className="flex items-center gap-2.5 flex-1 justify-end">
          {onOpenDashboard && isTeamMember && (
            <button
              className="h-10 px-4 border border-cyan-500 bg-[rgba(9,14,22,0.55)] text-cyan-100 rounded-xl font-extrabold transition-all duration-200 hover:bg-[rgba(0,229,255,0.12)] hover:text-white hover:shadow-[0_0_10px_rgba(0,229,255,0.35)]"
              onClick={onOpenDashboard}
            >
              📊 Review Dashboard
            </button>
          )}
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-cyan-400 to-cyan-300 flex items-center justify-center text-[#001018] font-bold">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-semibold hidden md:block">{user.name}</span>
              </div>
              <button
                className="h-10 px-4 border border-white/8 bg-[rgba(9,14,22,0.55)] text-cyan-100 rounded-xl font-extrabold transition-all duration-200 hover:bg-[rgba(0,229,255,0.12)] hover:text-white hover:shadow-[0_0_10px_rgba(0,229,255,0.35)]"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="h-10 px-4 border border-white/8 bg-[rgba(9,14,22,0.55)] text-cyan-100 rounded-xl font-extrabold transition-all duration-200 hover:bg-[rgba(0,229,255,0.12)] hover:text-white hover:shadow-[0_0_10px_rgba(0,229,255,0.35)]"
                onClick={onOpenLogin}
              >
                Login
              </button>
              <button
                className="h-10 px-3.5 bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] font-extrabold rounded-xl border-0 cursor-pointer transition-all duration-200 hover:from-cyan-400 hover:to-cyan-500 active:scale-[0.995] active:translate-y-px shadow-[0_8px_22px_rgba(34,211,238,0.35)] hover:shadow-[0_12px_28px_rgba(34,211,238,0.45)]"
                onClick={onOpenSignup}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
