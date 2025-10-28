import type { FormData, ProfileStep } from '../../types';
import { GENRES, PLATFORMS, TEAM_SIZES, LOCATIONS } from '../../constants';

interface ProfileModalProps {
  showProfileModal: boolean;
  profileStep: ProfileStep;
  formData: FormData;
  submittedProfile: FormData | null;
  onClose: () => void;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onNextStep: () => void;
  onBackStep: () => void;
}

export function ProfileModal({
  showProfileModal,
  profileStep,
  formData,
  submittedProfile,
  onClose,
  onFormChange,
  onNextStep,
  onBackStep,
}: ProfileModalProps) {
  if (!showProfileModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-5" onClick={onClose}>
      <div className="bg-[rgba(20,28,42,0.6)] backdrop-blur-[10px] border border-white/8 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 relative shadow-[0_25px_50px_rgba(0,0,0,0.5)]" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-4 right-4 bg-white/10 border-0 text-white w-8 h-8 rounded-lg cursor-pointer text-xl transition-all duration-200 hover:bg-white/20" onClick={onClose}>
          ✕
        </button>

        {profileStep === 'create' && (
          <div className="animate-fade-up">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1.5">📝 Create Your Profile</h2>
              <p className="text-cyan-200 text-sm">Step 1 of 3: Fill in your studio details</p>
            </div>
            <form className="flex flex-col gap-4 my-5">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-white text-sm">Studio Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onFormChange}
                  placeholder="Your studio name"
                  required
                  className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-white text-sm">Tagline *</label>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={onFormChange}
                  placeholder="One-line description"
                  required
                  className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-white text-sm">Genre *</label>
                  <select
                    name="genre"
                    value={formData.genre}
                    onChange={onFormChange}
                    required
                    className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                  >
                    <option value="">Select genre</option>
                    {GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-white text-sm">Platform *</label>
                  <select
                    name="platform"
                    value={formData.platform}
                    onChange={onFormChange}
                    required
                    className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                  >
                    <option value="">Select platform</option>
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-white text-sm">Team Size *</label>
                  <select
                    name="teamSize"
                    value={formData.teamSize}
                    onChange={onFormChange}
                    required
                    className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                  >
                    <option value="">Select size</option>
                    {TEAM_SIZES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-white text-sm">Location *</label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={onFormChange}
                    required
                    className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                  >
                    <option value="">Select location</option>
                    {LOCATIONS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-white text-sm">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={onFormChange}
                  placeholder="Tell us about your studio..."
                  rows={4}
                  className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-white text-sm">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={onFormChange}
                  placeholder="https://yourstudio.com"
                  className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-white text-sm">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={onFormChange}
                  placeholder="contact@yourstudio.com"
                  required
                  className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                />
              </div>
            </form>
            <div className="flex gap-3 justify-end mt-6">
              <button
                className="h-12 px-4 border border-cyan-500 bg-[rgba(9,14,22,0.55)] text-cyan-100 rounded-xl font-extrabold transition-all duration-200 hover:bg-[rgba(0,229,255,0.12)] hover:text-white hover:shadow-[0_0_10px_rgba(0,229,255,0.35)] hover:-translate-y-0.5 shadow-[0_10px_28px_rgba(56,189,248,0.20)]"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="h-12 px-4 bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] font-extrabold rounded-xl border-0 cursor-pointer transition-all duration-200 hover:from-cyan-400 hover:to-cyan-500 active:scale-[0.995] active:translate-y-px shadow-[0_8px_22px_rgba(34,211,238,0.35)]"
                onClick={onNextStep}
              >
                Review Profile
              </button>
            </div>
          </div>
        )}

        {profileStep === 'review' && submittedProfile && (
          <div className="animate-fade-up">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1.5">👀 Review Your Profile</h2>
              <p className="text-cyan-200 text-sm">Step 2 of 3: Verify your information</p>
            </div>
            <div className="bg-[rgba(10,16,28,0.4)] border border-white/8 rounded-2xl p-5 my-5">
              <div className="mb-4.5">
                <h3 className="text-xl font-bold mb-2">{submittedProfile.name}</h3>
                <p className="text-cyan-200">{submittedProfile.tagline}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="bg-[rgba(0,229,255,0.08)] border border-cyan-500/15 rounded-lg p-3">
                  <span className="text-cyan-400 text-xs font-semibold mb-1.5 block">Genre</span>
                  <span className="font-semibold text-white block">{submittedProfile.genre}</span>
                </div>
                <div className="bg-[rgba(0,229,255,0.08)] border border-cyan-500/15 rounded-lg p-3">
                  <span className="text-cyan-400 text-xs font-semibold mb-1.5 block">Platform</span>
                  <span className="font-semibold text-white block">{submittedProfile.platform}</span>
                </div>
                <div className="bg-[rgba(0,229,255,0.08)] border border-cyan-500/15 rounded-lg p-3">
                  <span className="text-cyan-400 text-xs font-semibold mb-1.5 block">Team Size</span>
                  <span className="font-semibold text-white block">{submittedProfile.teamSize}</span>
                </div>
                <div className="bg-[rgba(0,229,255,0.08)] border border-cyan-500/15 rounded-lg p-3">
                  <span className="text-cyan-400 text-xs font-semibold mb-1.5 block">Location</span>
                  <span className="font-semibold text-white block">{submittedProfile.location}</span>
                </div>
              </div>
              {submittedProfile.description && (
                <div className="mb-4.5">
                  <span className="text-cyan-200 text-xs font-semibold mb-1 block">Description</span>
                  <p className="text-white">{submittedProfile.description}</p>
                </div>
              )}
              {submittedProfile.website && (
                <div className="mb-4.5">
                  <span className="text-cyan-200 text-xs font-semibold mb-1 block">Website</span>
                  <p className="text-white">{submittedProfile.website}</p>
                </div>
              )}
              <div>
                <span className="text-cyan-200 text-xs font-semibold mb-1 block">Email</span>
                <p className="text-white">{submittedProfile.email}</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                className="h-12 px-4 border border-cyan-500 bg-[rgba(9,14,22,0.55)] text-cyan-100 rounded-xl font-extrabold transition-all duration-200 hover:bg-[rgba(0,229,255,0.12)] hover:text-white hover:shadow-[0_0_10px_rgba(0,229,255,0.35)] hover:-translate-y-0.5 shadow-[0_10px_28px_rgba(56,189,248,0.20)]"
                onClick={onBackStep}
              >
                Back
              </button>
              <button
                className="h-12 px-4 bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] font-extrabold rounded-xl border-0 cursor-pointer transition-all duration-200 hover:from-cyan-400 hover:to-cyan-500 active:scale-[0.995] active:translate-y-px shadow-[0_8px_22px_rgba(34,211,238,0.35)]"
                onClick={onNextStep}
              >
                Submit & List
              </button>
            </div>
          </div>
        )}

        {profileStep === 'list' && submittedProfile && (
          <div className="animate-fade-up">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold mb-1.5">🚀 Get Discovered</h2>
              <p className="text-cyan-200 text-sm">Step 3 of 3: Your profile is live!</p>
            </div>
            <div className="text-center py-5">
              <div className="w-15 h-15 mx-auto mb-4 bg-linear-to-b from-cyan-500 to-cyan-300 rounded-full flex items-center justify-center text-[#001018] text-3xl font-black">
                ✓
              </div>
              <h3 className="text-xl font-bold mb-2">Profile Successfully Listed!</h3>
              <p className="text-cyan-200 mb-4">
                Congratulations! Your studio is now visible in our
                directory.
              </p>
              <div className="bg-[rgba(0,229,255,0.08)] border border-cyan-500/15 rounded-xl p-4 my-4 text-left">
                <div className="flex justify-between items-center py-2 border-b border-cyan-500/10">
                  <span className="text-cyan-200 text-sm">Studio Name</span>
                  <strong className="text-white">{submittedProfile.name}</strong>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-cyan-500/10">
                  <span className="text-cyan-200 text-sm">Genre</span>
                  <strong className="text-white">{submittedProfile.genre}</strong>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-cyan-200 text-sm">Platform</span>
                  <strong className="text-white">{submittedProfile.platform}</strong>
                </div>
              </div>
              <p className="text-xs text-cyan-200">
                Your profile will be visible to thousands of developers and
                industry professionals. We'll send updates to{' '}
                {submittedProfile.email}
              </p>
            </div>
            <div className="flex justify-end mt-6">
              <button
                className="h-12 px-4 bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] font-extrabold rounded-xl border-0 cursor-pointer transition-all duration-200 hover:from-cyan-400 hover:to-cyan-500 active:scale-[0.995] active:translate-y-px shadow-[0_8px_22px_rgba(34,211,238,0.35)]"
                onClick={onClose}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
