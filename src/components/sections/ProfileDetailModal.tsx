import { motion } from 'framer-motion';

interface ProfileDetailModalProps {
  profile: {
    id: string;
    name: string;
    tagline: string;
    genre: string;
    platform: string;
    teamSize: string;
    location: string;
    description?: string;
    website?: string;
    email?: string;
    foundedYear?: string;
    tools?: string[];
    revenue?: string;
    tags?: string[];
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileDetailModal({ profile, isOpen, onClose }: ProfileDetailModalProps) {
  if (!isOpen || !profile) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.36, ease: 'easeOut' as const },
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Subtle backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Main Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="relative bg-[rgba(18,24,30,0.98)] border border-white/6 rounded-2xl max-w-2xl w-full h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Close Button (subtle) */}
        <button
          onClick={onClose}
          aria-label="Close profile"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/6 hover:bg-white/8 flex items-center justify-center transition-colors duration-150 text-white border border-white/8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-6 py-6 md:px-8 md:py-8 scrollbar-thin">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {/* Header */}
            <motion.div variants={itemVariants} className="mb-6">
              <div className="inline-block mb-3 px-3 py-1 bg-white/4 rounded-full border border-white/6">
                <p className="text-xs font-semibold text-cyan-200 uppercase tracking-wider">Studio profile</p>
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold text-white mb-1">{profile.name}</h1>
              {profile.tagline && (
                <p className="text-sm text-cyan-200/80">{profile.tagline}</p>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: 'Genre', value: profile.genre, icon: '🎮' },
                { label: 'Platform', value: profile.platform, icon: '🖥️' },
                { label: 'Team Size', value: profile.teamSize, icon: '👥' },
                { label: 'Location', value: profile.location, icon: '📍' },
                { label: 'Founded', value: profile.foundedYear, icon: '📅' },
              ].map((stat, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-white/3 border border-white/6">
                  <div className="text-lg md:text-xl">{stat.icon}</div>
                  <div>
                    <div className="text-xs text-white/70 uppercase tracking-wider">{stat.label}</div>
                    <div className="text-sm text-white font-medium">{stat.value || 'N/A'}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Tools & Revenue */}
            {(profile.tools?.length || profile.revenue || profile.tags?.length) && (
              <motion.div variants={itemVariants} className="mb-6">
                <h2 className="text-sm font-semibold mb-3 text-white/90">Details</h2>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-white/3 border border-white/6">
                    <div className="text-xs text-white/70 uppercase tracking-wider mb-2">Tools</div>
                    <div className="flex flex-wrap gap-2">
                      {(profile.tools || []).map((t, i) => (
                        <span key={i} className="px-2 py-1 bg-[#172033] border border-[#223049] rounded-full text-xs text-cyan-300 font-semibold">{t}</span>
                      ))}
                      {(!profile.tools || profile.tools.length === 0) && <div className="text-sm text-white/70">No tools listed</div>}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/3 border border-white/6">
                    <div className="text-xs text-white/70 uppercase tracking-wider mb-2">Revenue Model</div>
                    <div className="text-sm text-white font-medium">{profile.revenue || 'N/A'}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/3 border border-white/6">
                    <div className="text-xs text-white/70 uppercase tracking-wider mb-2">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {(profile.tags || []).map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-[#172033] border border-[#223049] rounded-full text-xs text-cyan-300 font-semibold">{tag}</span>
                      ))}
                      {(!profile.tags || profile.tags.length === 0) && <div className="text-sm text-white/70">No tags listed</div>}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Contact */}
            <motion.div variants={itemVariants} className="mb-6">
              <h2 className="text-sm font-semibold mb-3 text-white/90">Contact</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {profile.email && (
                  <a href={`mailto:${profile.email}`} className="block p-3 rounded-lg bg-white/3 border border-white/6 text-white/90">
                    <div className="text-xs text-white/70">Email</div>
                    <div className="text-sm font-medium break-all">{profile.email}</div>
                  </a>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg bg-white/3 border border-white/6 text-white/90">
                    <div className="text-xs text-white/70">Website</div>
                    <div className="text-sm font-medium break-all">{profile.website}</div>
                  </a>
                )}
              </div>
            </motion.div>

            {/* Description */}
            {profile.description && (
              <motion.div variants={itemVariants} className="mb-6">
                <h2 className="text-sm font-semibold mb-3 text-white/90">About</h2>
                <div className="p-3 rounded-lg bg-white/4 border border-white/6 text-white/90">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{profile.description}</p>
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <motion.div variants={itemVariants} className="flex gap-3 mt-4">
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="flex-1">
                  <button className="w-full py-2 rounded-lg bg-cyan-600 text-white font-medium hover:bg-cyan-500 transition-colors">
                    Contact Studio
                  </button>
                </a>
              )}
              <button onClick={onClose} className="flex-1 py-2 rounded-lg bg-transparent border border-white/8 text-white font-medium hover:bg-white/4 transition-colors">
                Close
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Subtle scrollbar styles */}
        <style>{`
          .scrollbar-thin::-webkit-scrollbar { width: 6px; }
          .scrollbar-thin::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.12); border-radius: 3px; }
          .scrollbar-thin { scrollbar-color: rgba(255,255,255,0.12) transparent; scrollbar-width: thin; }
        `}</style>
      </motion.div>
    </div>
  );
}
