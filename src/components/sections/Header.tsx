import { useAuth } from '../../contexts/AuthContext';
import { useTeamMember } from '../../hooks/useTeamMember';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface HeaderProps {
  navShrunk: boolean;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onOpenDashboard?: () => void;
  onSearch?: (query: string) => void;
}

export function Header({ navShrunk, onOpenLogin, onOpenSignup, onOpenDashboard, onSearch }: HeaderProps) {
  const { user, logout, loading: authLoading } = useAuth();
  const { isTeamMember, loading: teamLoading } = useTeamMember();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    
    // Check if we're on the home page
    const isHomePage = window.location.pathname === '/';
    
    if (!isHomePage) {
      // Navigate to home page first, then scroll to section
      navigate('/');
      // Wait for navigation and DOM update
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    } else {
      // Already on home page, just scroll
      const element = document.getElementById(targetId);
      if (element) {
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
    
    // Close mobile menu after clicking
    setIsMenuOpen(false);
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (onSearch) {
      onSearch(q);
      setIsMenuOpen(false);
    }
  };

  if (authLoading || teamLoading) {
    return (
      <header className={`fixed top-1 left-0 right-0 z-50 transition-all duration-300 ${
        navShrunk ? 'bg-[rgba(7,11,18,0.7)] backdrop-blur-[14px]' : 'bg-[rgba(7,11,18,0.55)] backdrop-blur-md'
      } border-b border-white/8`}>
        <div className="h-20 flex items-center gap-2 lg:gap-4 px-4 lg:px-6 max-w-7xl mx-auto w-full">
          <a className="flex items-center gap-2 lg:gap-3 font-extrabold text-white no-underline flex-shrink-0" href="#hero" aria-label="Home">
            <img src="/logo.png" alt="Game Centralen" className="w-20 h-16 lg:w-24 lg:h-20 rounded-[10px] object-contain" />
            <span className="hidden sm:block text-lg lg:text-xl tracking-wide whitespace-nowrap" style={{ fontFamily: "'Orbitron', 'Rajdhani', sans-serif" }}>Game Centralen</span>
          </a>
          <div className="flex-1"></div>
          <div className="h-4 w-24 bg-white/10 rounded animate-pulse flex-shrink-0" />
        </div>
      </header>
    );
  }

  return (
    <header className={`fixed top-1 left-0 right-0 z-50 transition-all duration-300 ${
      navShrunk ? 'bg-[rgba(7,11,18,0.7)] backdrop-blur-[14px]' : 'bg-[rgba(7,11,18,0.55)] backdrop-blur-md'
    } border-b border-white/8`}>
      <div className="h-20 flex items-center gap-2 lg:gap-4 px-4 lg:px-6 max-w-7xl mx-auto w-full">
        {/* Logo - Extreme Left */}
        <a className="flex items-center gap-2 lg:gap-3 font-bold text-white no-underline flex-shrink-0" href="#hero" aria-label="Home" onClick={(e) => handleNavClick(e, 'hero')}>
          <img src="/logo.png" alt="Game Centralen" className="w-20 h-16 lg:w-24 lg:h-20 rounded-[10px] object-contain" />
          <span className="hidden sm:block text-lg lg:text-xl tracking-wide whitespace-nowrap" style={{ fontFamily: "'Orbitron', 'Rajdhani', sans-serif" }}>Game Centralen</span>
        </a>
        
        {/* Mobile menu button */}
        <button 
          className="lg:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg bg-[rgba(9,14,22,0.55)] border border-white/8 flex-shrink-0 ml-auto"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-white mt-1.5 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-white mt-1.5 transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
        </button>
        
        {/* Desktop Navigation - Center */}
        <nav className="hidden lg:flex items-center gap-3 xl:gap-5 flex-1 justify-center">
          <a
            href="#hero"
            onClick={(e) => handleNavClick(e, 'hero')}
            className="text-white text-sm xl:text-base font-bold no-underline transition-all duration-200 hover:text-cyan-300 whitespace-nowrap"
          >
            Home
          </a>
          <a
            href="#how"
            onClick={(e) => handleNavClick(e, 'how')}
            className="text-white text-sm xl:text-base font-bold no-underline transition-all duration-200 hover:text-cyan-300 whitespace-nowrap"
          >
            How it works
          </a>
          <a
            href="#why"
            onClick={(e) => handleNavClick(e, 'why')}
            className="text-white text-sm xl:text-base font-bold no-underline transition-all duration-200 hover:text-cyan-300 whitespace-nowrap"
          >
            Why Join?
          </a>
          <a
            href="#directory"
            onClick={(e) => handleNavClick(e, 'directory')}
            className="text-white text-sm xl:text-base font-bold no-underline transition-all duration-200 hover:text-cyan-300 whitespace-nowrap"
          >
            Directory
          </a>
          <a
            href="/content"
            onClick={(e) => { e.preventDefault(); navigate('/content'); setIsMenuOpen(false); }}
            className="text-white text-sm xl:text-base font-bold no-underline transition-all duration-200 hover:text-cyan-300 whitespace-nowrap"
          >
            Content
          </a>
          <a
            href="/free-games"
            onClick={(e) => { e.preventDefault(); navigate('/free-games'); setIsMenuOpen(false); }}
            className="text-white text-sm xl:text-base font-bold no-underline transition-all duration-200 hover:text-cyan-300 whitespace-nowrap"
          >
            Free Games
          </a>
          <a
            href="/studios_directory"
            onClick={(e) => { e.preventDefault(); navigate('/studios_directory'); setIsMenuOpen(false); }}
            className="text-white text-sm xl:text-base font-bold no-underline transition-all duration-200 hover:text-cyan-300 whitespace-nowrap"
          >
            StudioHub
          </a>
        </nav>
        
        <div className="hidden lg:flex items-center gap-2 xl:gap-3 flex-shrink-0">
          {onOpenDashboard && isTeamMember && (
            <button
              className="h-10 px-3 xl:px-4 border border-cyan-500 bg-[rgba(9,14,22,0.55)] text-cyan-100 rounded-xl text-sm font-bold transition-all duration-200 hover:bg-[rgba(0,229,255,0.12)] hover:text-white hover:shadow-[0_0_10px_rgba(0,229,255,0.35)] whitespace-nowrap"
              onClick={onOpenDashboard}
            >
              📊 Dashboard
            </button>
          )}
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-cyan-400 to-cyan-300 flex items-center justify-center text-[#001018] font-bold flex-shrink-0">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-semibold hidden xl:block max-w-[100px] truncate">{user.name}</span>
              </div>
              <button
                className="h-10 px-3 xl:px-4 border border-white/8 bg-[rgba(9,14,22,0.55)] text-cyan-100 rounded-xl text-sm font-bold transition-all duration-200 hover:bg-[rgba(0,229,255,0.12)] hover:text-white hover:shadow-[0_0_10px_rgba(0,229,255,0.35)] whitespace-nowrap"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="h-10 px-3 xl:px-4 border border-white/8 bg-[rgba(9,14,22,0.55)] text-cyan-100 rounded-xl text-sm font-bold transition-all duration-200 hover:bg-[rgba(0,229,255,0.12)] hover:text-white hover:shadow-[0_0_10px_rgba(0,229,255,0.35)] whitespace-nowrap"
                onClick={onOpenLogin}
              >
                Login
              </button>
              <button
                className="h-10 px-3 xl:px-3.5 bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] text-sm font-bold rounded-xl border-0 cursor-pointer transition-all duration-200 hover:from-cyan-400 hover:to-cyan-500 active:scale-[0.995] active:translate-y-px shadow-[0_8px_22px_rgba(34,211,238,0.35)] hover:shadow-[0_12px_28px_rgba(34,211,238,0.45)] whitespace-nowrap"
                onClick={onOpenSignup}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-[rgba(7,11,18,0.98)] backdrop-blur-[20px] border-b border-white/8 py-4 px-6 z-[60] shadow-[0_10px_40px_rgba(0,0,0,0.5)] max-h-[calc(100vh-5rem)] overflow-y-auto">
          <nav className="flex flex-col gap-4">
            <a
              href="#hero"
              onClick={(e) => handleNavClick(e, 'hero')}
              className="text-white font-extrabold no-underline transition-all duration-200 hover:text-cyan-300 py-2"
            >
              Home
            </a>
            <a
              href="#how"
              onClick={(e) => handleNavClick(e, 'how')}
              className="text-white font-extrabold no-underline transition-all duration-200 hover:text-cyan-300 py-2"
            >
              How it works
            </a>
            <a
              href="#why"
              onClick={(e) => handleNavClick(e, 'why')}
              className="text-white font-extrabold no-underline transition-all duration-200 hover:text-cyan-300 py-2"
            >
              Why Join?
            </a>
            <a
              href="#directory"
              onClick={(e) => handleNavClick(e, 'directory')}
              className="text-white font-extrabold no-underline transition-all duration-200 hover:text-cyan-300 py-2"
            >
              Directory
            </a>
            <a
              href="/content"
              onClick={(e) => { e.preventDefault(); navigate('/content'); setIsMenuOpen(false); }}
              className="text-white font-extrabold no-underline transition-all duration-200 hover:text-cyan-300 py-2"
            >
              Content
            </a>
            <a
              href="/free-games"
              onClick={(e) => { e.preventDefault(); navigate('/free-games'); setIsMenuOpen(false); }}
              className="text-white font-extrabold no-underline transition-all duration-200 hover:text-cyan-300 py-2"
            >
              Free Games
            </a>
            <a
              href="/studios_directory"
              onClick={(e) => { e.preventDefault(); navigate('/studios_directory'); setIsMenuOpen(false); }}
              className="text-white font-extrabold no-underline transition-all duration-200 hover:text-cyan-300 py-2"
            >
              StudioHub
            </a>
            {onOpenDashboard && isTeamMember && (
              <button
                className="text-left text-white font-extrabold py-2 transition-all duration-200 hover:text-cyan-300"
                onClick={() => { onOpenDashboard(); setIsMenuOpen(false); }}
              >
                📊 Review Dashboard
              </button>
            )}
            {!user ? (
              <>
                <button
                  className="text-left text-white font-extrabold py-2 transition-all duration-200 hover:text-cyan-300"
                  onClick={() => { onOpenLogin(); setIsMenuOpen(false); }}
                >
                  Login
                </button>
                <button
                  className="text-left text-white font-extrabold py-2 transition-all duration-200 hover:text-cyan-300"
                  onClick={() => { onOpenSignup(); setIsMenuOpen(false); }}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <button
                className="text-left text-white font-extrabold py-2 transition-all duration-200 hover:text-cyan-300"
                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
              >
                Logout
              </button>
            )}

            {/* Mobile Search Bar - Only visible on mobile */}
            {onSearch && (
              <div className="pt-4 mt-4 border-t border-white/10">
                <form onSubmit={handleMobileSearch} className="w-full">
                  <div className="flex flex-col gap-2 bg-[rgba(13,21,36,0.65)] border border-white/8 rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.25)] transition-all duration-300 focus-within:border-cyan-400 focus-within:shadow-[0_4px_24px_rgba(34,211,238,0.25)]">
                    <div className="flex items-center w-full p-2">
                      <span className="pl-3 text-cyan-200 text-lg">🔎</span>
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search studios, genres, tags"
                        aria-label="Search"
                        className="flex-1 px-3 py-3 bg-transparent text-white border-0 outline-none ring-0 focus:ring-0 shadow-none focus:shadow-none appearance-none placeholder:text-cyan-300/60 focus:placeholder:text-cyan-300/40 transition-colors duration-200 text-sm"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full h-11 px-4 bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] font-extrabold rounded-xl border-0 cursor-pointer transition-all duration-200 hover:from-cyan-400 hover:to-cyan-500 active:scale-[0.995] shadow-[0_8px_22px_rgba(34,211,238,0.35)] m-2 mt-0"
                    >
                      Search
                    </button>
                  </div>
                </form>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}