import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StudiosDirectory from './components/sections/StudiosDirectory';
import Publishers from './components/sections/Publishers';
import Tools from './components/sections/Tools';
import Resources from './components/sections/Resources';
import { BlogsPage } from './components/sections/BlogsPage';
import { NewsPage } from './components/sections/NewsPage';
import { BlogPostDetail } from './components/sections/BlogPostDetail';
import { NewsPostDetail } from './components/sections/NewsPostDetail';
import { ContentHub } from './components/sections/ContentHub';
import { ContentPostDetail } from './components/sections/ContentPostDetail';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useScrollProgress } from './hooks/useScrollProgress';
import { useCursorAura } from './hooks/useCursorAura';
import { useTeamMember } from './hooks/useTeamMember';
import { ToastContainer } from './components/ui/ToastContainer';
import { Header } from './components/sections/Header';
import { Hero } from './components/sections/Hero';
import { CTA } from './components/sections/CTA';
import { HowItWorks } from './components/sections/HowItWorks';
import { WhyJoin } from './components/sections/WhyJoin';
import { Directory } from './components/sections/Directory';
import { JoinCTA } from './components/sections/JoinCTA';
import { Footer } from './components/sections/Footer';
import { ProfileModal } from './components/sections/ProfileModal';
import { LoginModal } from './components/auth/LoginModal';
import { SignupModal } from './components/auth/SignupModal';
import { ReviewDashboard } from './components/dashboard/ReviewDashboard';
import type { FormData, ProfileStep } from './types';
import { createProfileDocument } from './services/profile';

function AppContent() {
  const { scrollProgress, navShrunk, showScrollTop } = useScrollProgress();
  const { user } = useAuth();
  const { isTeamMember } = useTeamMember();
  useCursorAura();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showAuthRequiredModal, setShowAuthRequiredModal] = useState(false);
  const [showApprovalNotice, setShowApprovalNotice] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [profileStep, setProfileStep] = useState<ProfileStep>('create');
  const [, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    tagline: '',
    genre: '',
    platform: '',
    teamSize: '',
    location: '',
    description: '',
    website: '',
    email: '',
    tools: [],
    revenue: '',
    foundedYear: '',
  });
  const [submittedProfile, setSubmittedProfile] = useState<FormData | null>(null);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [emailError, setEmailError] = useState<string | null>(null);

  // Helper to send notification to reviewer via FormSubmit.co
  const sendReviewerEmail = useCallback(async (profile: FormData) => {
    const recipient = 'cryptotrader035@gmail.com';
    const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`;

    setEmailStatus('sending');
    setEmailError(null);

    try {
      const messageLines = [
        `New studio profile submitted:\n`,
        `Name: ${profile.name}`,
        `Tagline: ${profile.tagline}`,
        `Genre: ${profile.genre}`,
        `Platform: ${profile.platform}`,
        `Team Size: ${profile.teamSize}`,
        `Location: ${profile.location}`,
        `Website: ${profile.website || 'N/A'}`,
        `Email: ${profile.email}`,
        `Description: ${profile.description || 'N/A'}`,
      ];

      const form = new FormData();
      // form.append('name', 'IndieDev Directory — New Profile');
      // form.append('email', profile.email || 'no-reply@example.com');
      form.append('subject', `New profile submitted: ${profile.name}`);
      form.append('message', messageLines.join('\n'));

      const res = await fetch(endpoint, {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        const text = await res.text();
        setEmailStatus('failed');
        setEmailError(`Server returned ${res.status}: ${text}`);
        console.warn('Failed to send reviewer email via FormSubmit:', text);
        return;
      }

      // success
      setEmailStatus('sent');
    } catch (err: any) {
      setEmailStatus('failed');
      setEmailError(err?.message || String(err));
      console.warn('Error sending reviewer email:', err);
    }
  }, []);

  const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID as string;
  const PROFILE_TABLE_ID = import.meta.env.VITE_APPWRITE_PROFILE_TABLE_ID as string;

  // Filter states
  const [genre, setGenre] = useState('');
  const [platform, setPlatform] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [location, setLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    const el = document.getElementById('directory');
    if (el) {
      const offset = 80;
      const y = el.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);

  const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const name = target.name;

    // Handle multi-select for tools
    // Handle multi-select (native select) for tools
    if (name === 'tools' && target instanceof HTMLSelectElement && target.multiple) {
      const values = Array.from(target.selectedOptions).map((o) => o.value);
      setFormData((prev) => ({ ...prev, tools: values }));
      return;
    }

    // Handle checkbox toggles for tools and tags (we render checkboxes in the modal)
    if (target instanceof HTMLInputElement && target.type === 'checkbox' && (name === 'tools' || name === 'tags')) {
      const val = target.value;
      setFormData((prev) => {
        const cur = new Set(((name === 'tools') ? prev.tools : prev.tags) || []);
        if (target.checked) cur.add(val); else cur.delete(val);
        return { ...prev, [name]: Array.from(cur) } as any;
      });
      return;
    }

    const value = target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleNextStep = useCallback(async () => {
    if (profileStep === 'create') {
      // validate required fields
      if (
        formData.name &&
        formData.tagline &&
        formData.genre &&
        formData.platform &&
        formData.teamSize &&
        formData.location
      ) {
        if (!user) {
          setShowAuthRequiredModal(true);
          return;
        }
        if (!DB_ID || !PROFILE_TABLE_ID) {
          alert('Missing database configuration. Please set VITE_APPWRITE_DATABASE_ID and VITE_APPWRITE_PROFILE_TABLE_ID.');
          return;
        }
        try {
          setIsSubmitting(true);
          // Debug log the auth user data
          console.log('Creating profile with auth data:', {
            userId: (user as any).$id || (user as any).id,
            userEmail: (user as any).email,
            user: user
          });

          await createProfileDocument({
            databaseId: DB_ID,
            tableId: PROFILE_TABLE_ID,
            userId: (user as any).$id || (user as any).id,
            data: {
              ...formData,
              authEmail: (user as any).email // Add authenticated user's email
            },
          });

          // Profile created successfully
          setSubmittedProfile(formData);
          setShowProfileModal(false);
          setShowApprovalNotice(true);
        } catch (e: any) {
          alert(e?.message || 'Failed to submit profile.');
        } finally {
          setIsSubmitting(false);
        }
      } else {
        alert('Please fill in all required fields');
      }
    } else if (profileStep === 'review') {
      // legacy path (kept for safety) – treat as submitted
      setShowProfileModal(false);
      setShowApprovalNotice(true);
    }
  }, [profileStep, formData, user, DB_ID, PROFILE_TABLE_ID]);

  const handleBackStep = useCallback(() => {
    if (profileStep === 'review') setProfileStep('create');
    else if (profileStep === 'list') setProfileStep('review');
  }, [profileStep]);

  const handleCloseModal = useCallback(() => {
    setShowProfileModal(false);
    setProfileStep('create');
  }, []);

  const handleOpenLogin = useCallback(() => {
    setShowLoginModal(true);
    setShowSignupModal(false);
  }, []);

  const handleOpenSignup = useCallback(() => {
    setShowSignupModal(true);
    setShowLoginModal(false);
  }, []);

  const handleOpenDashboard = useCallback(() => {
    if (!user || !isTeamMember) {
      alert('Access denied. The Review Dashboard is only available to team members.');
      return;
    }
    setShowDashboard(true);
  }, [user, isTeamMember]);

  const handleCreateProfile = useCallback(() => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setShowProfileModal(true);
  }, [user]);

  // If dashboard is shown, render only the dashboard
  if (showDashboard) {
    return <ReviewDashboard onClose={() => setShowDashboard(false)} />;
  }

  return (
    <div className="min-h-screen bg-bg text-white font-sans">
      {/* SCROLL PROGRESS BAR */}
      <div className="fixed top-0 left-0 right-0 z-60 h-1 bg-cyan-500/20">
        <div 
          className="h-full bg-linear-to-r from-cyan-400 to-cyan-300 transition-all duration-150 ease-out shadow-[0_0_10px_rgba(34,211,238,0.5)]"
          style={{ width: `${scrollProgress}%` }}
        />
          </div>

      {/* HEADER (hide global header on StudioHub routes, show on blogs/news) */}
      {(() => {
        try {
          const loc = window.location.pathname || '';
          if (loc.startsWith('/studios_directory')) return null;
        } catch (e) {}
        return (
          <Header 
            navShrunk={navShrunk} 
            onOpenLogin={handleOpenLogin}
            onOpenSignup={handleOpenSignup}
            onOpenDashboard={handleOpenDashboard}
            onSearch={handleSearch}
          />
        );
      })()}

      <Routes>
        <Route
          path="/studios_directory"
          element={<StudiosDirectory onCreateProfile={handleCreateProfile} />}
        />
        <Route
          path="/studios_directory/publishers"
          element={<Publishers onCreateProfile={handleCreateProfile} />}
        />
        <Route
          path="/studios_directory/tools"
          element={<Tools onCreateProfile={handleCreateProfile} />}
        />
        <Route
          path="/studios_directory/resources"
          element={<Resources onCreateProfile={handleCreateProfile} />}
        />
        <Route
          path="/content"
          element={<ContentHub />}
        />
        <Route
          path="/content/:slug"
          element={<ContentPostDetail />}
        />
        <Route
          path="/blogs"
          element={<BlogsPage />}
        />
        <Route
          path="/blogs/:slug"
          element={<BlogPostDetail />}
        />
        <Route
          path="/news"
          element={<NewsPage />}
        />
        <Route
          path="/news/:slug"
          element={<NewsPostDetail />}
        />
        <Route
          path="/"
          element={
            <>
              {/* HERO SECTION */}
              <Hero onSearch={handleSearch} />

              {/* CTA SECTION */}
              <CTA />

              {/* HOW IT WORKS */}
              <HowItWorks />

              {/* WHY JOIN */}
              <WhyJoin />

              {/* DIRECTORY */}
              <Directory
                genre={genre}
                setGenre={setGenre}
                platform={platform}
                setPlatform={setPlatform}
                teamSize={teamSize}
                setTeamSize={setTeamSize}
                location={location}
                setLocation={setLocation}
                searchQuery={searchQuery}
              />

              {/* JOIN CTA FOOTER */}
              <JoinCTA />

              {/* FOOTER */}
              <Footer />
            </>
          }
        />
      </Routes>

      {/* CURSOR AURA */}
      <div className="fixed inset-0 pointer-events-none z-5 bg-gradient-radial from-cyan-500/18 via-transparent to-transparent mix-blend-screen transition-all duration-100" style={{ background: `radial-gradient(220px 160px at var(--mx) var(--my), rgba(0,229,255,.18), transparent 45%)` }} aria-hidden />

      {/* SCROLL TO TOP BUTTON */}
      {showScrollTop && (
                  <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] rounded-full border-0 cursor-pointer transition-all duration-300 hover:from-cyan-400 hover:to-cyan-500 active:scale-[0.95] shadow-[0_8px_22px_rgba(34,211,238,0.35)] hover:shadow-[0_12px_28px_rgba(34,211,238,0.45)] hover:-translate-y-1"
          aria-label="Scroll to top"
        >
          ↑
                  </button>
      )}

      {/* PROFILE MODAL */}
      <ProfileModal
        showProfileModal={showProfileModal}
        profileStep={profileStep}
        formData={formData}
        submittedProfile={submittedProfile}
        onClose={handleCloseModal}
        onFormChange={handleFormChange}
        onNextStep={handleNextStep}
        onBackStep={handleBackStep}
      />

      {/* AUTH MODALS */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSwitchToSignup={() => {
            setShowLoginModal(false);
            setShowSignupModal(true);
          }}
        />
      )}

      {showSignupModal && (
        <SignupModal
          onClose={() => setShowSignupModal(false)}
          onSwitchToLogin={() => {
            setShowSignupModal(false);
            setShowLoginModal(true);
          }}
        />
      )}

      {/* AUTH REQUIRED MODAL */}
      {showAuthRequiredModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-5" onClick={() => setShowAuthRequiredModal(false)}>
          <div className="bg-[rgba(20,28,42,0.95)] backdrop-blur-[20px] border border-white/8 rounded-2xl max-w-md w-full p-8 relative shadow-[0_25px_50px_rgba(0,0,0,0.5)]" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute top-4 right-4 bg-white/10 border-0 text-white w-8 h-8 rounded-lg cursor-pointer text-xl transition-all duration-200 hover:bg-white/20"
              onClick={() => setShowAuthRequiredModal(false)}
            >
              ✕
            </button>

            <div className="mb-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-linear-to-br from-cyan-400 to-cyan-300 rounded-full flex items-center justify-center text-[#001018] text-2xl font-black">
                🔒
              </div>
              <h2 className="text-2xl font-bold mb-2 bg-linear-to-r from-cyan-100 to-cyan-300 bg-clip-text text-transparent">
                Authentication Required
              </h2>
              <p className="text-cyan-200 text-sm">
                You need to be logged in to create a studio profile. Please sign in or create an account first.
              </p>
            </div>

            <div className="flex gap-3">
                  <button
                className="flex-1 h-12 border border-white/8 bg-[rgba(9,14,22,0.55)] text-cyan-100 rounded-xl font-extrabold transition-all duration-200 hover:bg-[rgba(0,229,255,0.12)] hover:text-white hover:shadow-[0_0_10px_rgba(0,229,255,0.35)]"
                onClick={() => {
                  setShowAuthRequiredModal(false);
                  setShowLoginModal(true);
                }}
              >
                Sign In
                  </button>
                  <button
                className="flex-1 h-12 bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] font-extrabold rounded-xl border-0 cursor-pointer transition-all duration-200 hover:from-cyan-400 hover:to-cyan-500 shadow-[0_8px_22px_rgba(34,211,238,0.35)]"
                onClick={() => {
                  setShowAuthRequiredModal(false);
                  setShowSignupModal(true);
                }}
              >
                Sign Up
                  </button>
                </div>
          </div>
        </div>
      )}

      {/* APPROVAL NOTICE MODAL */}
      {showApprovalNotice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-5" onClick={() => { setShowApprovalNotice(false); setEmailStatus('idle'); setEmailError(null); }}>
          <div className="bg-[rgba(20,28,42,0.95)] backdrop-blur-[20px] border border-white/8 rounded-2xl max-w-md w-full p-8 relative shadow-[0_25px_50px_rgba(0,0,0,0.5)]" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute top-4 right-4 bg-white/10 border-0 text-white w-8 h-8 rounded-lg cursor-pointer text-xl transition-all duration-200 hover:bg-white/20"
              onClick={() => setShowApprovalNotice(false)}
            >
              ✕
            </button>

            <div className="mb-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-linear-to-br from-cyan-400 to-cyan-300 rounded-full flex items-center justify-center text-[#001018] text-2xl font-black">
                ✓
              </div>
              <h2 className="text-2xl font-bold mb-2 bg-linear-to-r from-cyan-100 to-cyan-300 bg-clip-text text-transparent">
                Profile Submitted
              </h2>
              <p className="text-cyan-200 text-sm">
                Thanks! We’ll let you know when your profile is approved
                {submittedProfile?.email ? ` at ${submittedProfile.email}` : ''}.
              </p>
            </div>
            {/* Email send status and controls */}
            <div className="mb-4">
              <div className="text-sm text-cyan-200 mb-2">Reviewer notification</div>
              <div className="flex items-center gap-3">
                {emailStatus === 'idle' && <div className="text-xs text-yellow-300">Not sent yet</div>}
                {emailStatus === 'sending' && <div className="text-xs text-cyan-300">Sending...</div>}
                {emailStatus === 'sent' && <div className="text-xs text-green-300">Sent to reviewer ✓</div>}
                {emailStatus === 'failed' && <div className="text-xs text-red-300">Failed to send</div>}
                <div className="ml-auto">
                  <button
                    className="h-9 px-3 bg-[rgba(9,14,22,0.55)] text-cyan-100 rounded-lg border border-white/8 text-sm"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!submittedProfile) return;
                      await sendReviewerEmail(submittedProfile);
                    }}
                    disabled={emailStatus === 'sending' || !submittedProfile}
                  >
                    Resend
                  </button>
                </div>
              </div>

              {emailError && (
                <div className="mt-2 text-xs text-red-300 break-all">{emailError}</div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                className="h-12 px-4 bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] font-extrabold rounded-xl border-0 cursor-pointer transition-all duration-200 hover:from-cyan-400 hover:to-cyan-500 shadow-[0_8px_22px_rgba(34,211,238,0.35)]"
                onClick={() => { setShowApprovalNotice(false); setEmailStatus('idle'); setEmailError(null); }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
        <ToastContainer />
      </BrowserRouter>
    </AuthProvider>
  );
}