import type { FormData, ProfileStep } from '../../types';
import { 
  GENRES, PLATFORMS, TEAM_SIZES, LOCATIONS, TOOLS, REVENUE_MODELS, TAGS,
  STUDIO_TYPES, TARGET_AUDIENCES, PRIMARY_EXPERTISE, GAME_ENGINES,
  SUPPORTED_PLATFORMS, DEPLOYMENT_TYPES, PROJECT_STATUSES, ACQUISITION_STATUSES,
  FUNDING_TYPES, LOOKING_FOR_OPTIONS, DISTRIBUTION_CHANNELS, RECOGNITION_TYPES,
  LANGUAGES, REGIONS_SERVED
} from '../../constants';

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
                    <option value="">Select genre...</option>
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
                    <option value="">Select platform...</option>
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
                    <option value="">Select team size...</option>
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
                    <option value="">Select location...</option>
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

              {/* Basic Studio Details Section */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <h3 className="text-lg font-bold text-cyan-200 mb-4">Basic Studio Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-white text-sm">Studio Type</label>
                    <select
                      name="studioType"
                      value={formData.studioType || ''}
                      onChange={onFormChange}
                      className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                    >
                      <option value="">Select studio type...</option>
                      {STUDIO_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-white text-sm">Year Founded</label>
                    <input
                      type="number"
                      name="foundedYear"
                      value={formData.foundedYear || ''}
                      onChange={onFormChange}
                      placeholder="e.g. 2018"
                      min={1900}
                      max={new Date().getFullYear()}
                      className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-white text-sm">Headquarters Country</label>
                    <input
                      type="text"
                      name="headquartersCountry"
                      value={formData.headquartersCountry || ''}
                      onChange={onFormChange}
                      placeholder="e.g. Finland"
                      className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-white text-sm">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city || ''}
                      onChange={onFormChange}
                      placeholder="e.g. Helsinki"
                      className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 mt-3">
                  <label className="font-semibold text-white text-sm">Languages Supported</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2 bg-[rgba(10,16,28,0.55)] rounded-lg border border-white/8">
                    {LANGUAGES.map((lang) => (
                      <label key={lang} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          name="languagesSupported"
                          value={lang}
                          checked={(formData.languagesSupported || []).includes(lang)}
                          onChange={onFormChange}
                          className="accent-cyan-400"
                        />
                        <span className="text-cyan-100">{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 mt-3">
                  <label className="font-semibold text-white text-sm">Regions Served</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2 bg-[rgba(10,16,28,0.55)] rounded-lg border border-white/8">
                    {REGIONS_SERVED.map((region) => (
                      <label key={region} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          name="regionsServed"
                          value={region}
                          checked={(formData.regionsServed || []).includes(region)}
                          onChange={onFormChange}
                          className="accent-cyan-400"
                        />
                        <span className="text-cyan-100">{region}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ownership & Identity Section */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <h3 className="text-lg font-bold text-cyan-200 mb-4">Ownership & Identity</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-white text-sm">Founder(s)</label>
                    <div id="founders-list" className="space-y-2">
                      {(formData.founders || []).map((founder, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={founder}
                            onChange={(e) => {
                              const newFounders = [...(formData.founders || [])];
                              newFounders[index] = e.target.value;
                              onFormChange({
                                target: { name: 'founders', value: newFounders }
                              } as any);
                            }}
                            placeholder="Founder name"
                            className="flex-1 bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newFounders = (formData.founders || []).filter((_, i) => i !== index);
                              onFormChange({
                                target: { name: 'founders', value: newFounders }
                              } as any);
                            }}
                            className="px-3 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newFounders = [...(formData.founders || []), ''];
                        onFormChange({
                          target: { name: 'founders', value: newFounders }
                        } as any);
                      }}
                      className="mt-2 px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 text-sm"
                    >
                      + Add Founder
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-white text-sm">Parent Company / Ownership</label>
                      <input
                        type="text"
                        name="parentCompany"
                        value={formData.parentCompany || ''}
                        onChange={onFormChange}
                        placeholder="e.g. Sony Interactive Entertainment"
                        className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-white text-sm">Acquisition Status</label>
                      <select
                        name="acquisitionStatus"
                        value={formData.acquisitionStatus || ''}
                        onChange={onFormChange}
                        className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                      >
                        <option value="">Select acquisition status...</option>
                        {ACQUISITION_STATUSES.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {formData.acquisitionStatus === 'Acquired' && (
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-white text-sm">Acquired By</label>
                      <input
                        type="text"
                        name="acquiredBy"
                        value={formData.acquiredBy || ''}
                        onChange={onFormChange}
                        placeholder="e.g. Sony Interactive Entertainment"
                        className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Team & Capabilities Section */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <h3 className="text-lg font-bold text-cyan-200 mb-4">Team & Capabilities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-white text-sm">Target Audience</label>
                    <select
                      name="targetAudience"
                      value={formData.targetAudience || ''}
                      onChange={onFormChange}
                      className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                    >
                      <option value="">Select target audience...</option>
                      {TARGET_AUDIENCES.map((audience) => (
                        <option key={audience} value={audience}>{audience}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-white text-sm">Deployment Type</label>
                    <select
                      name="deploymentType"
                      value={formData.deploymentType || ''}
                      onChange={onFormChange}
                      className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                    >
                      <option value="">Select deployment type...</option>
                      {DEPLOYMENT_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 mt-3">
                  <label className="font-semibold text-white text-sm">Primary Expertise / Game Focus</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2 bg-[rgba(10,16,28,0.55)] rounded-lg border border-white/8">
                    {PRIMARY_EXPERTISE.map((expertise) => (
                      <label key={expertise} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          name="primaryExpertise"
                          value={expertise}
                          checked={(formData.primaryExpertise || []).includes(expertise)}
                          onChange={onFormChange}
                          className="accent-cyan-400"
                        />
                        <span className="text-cyan-100">{expertise}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 mt-3">
                  <label className="font-semibold text-white text-sm">Game Engine(s) Used</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2 bg-[rgba(10,16,28,0.55)] rounded-lg border border-white/8">
                    {GAME_ENGINES.map((engine) => (
                      <label key={engine} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          name="gameEngines"
                          value={engine}
                          checked={(formData.gameEngines || []).includes(engine)}
                          onChange={onFormChange}
                          className="accent-cyan-400"
                        />
                        <span className="text-cyan-100">{engine}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Platforms & Technology Section */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <h3 className="text-lg font-bold text-cyan-200 mb-4">Platforms & Technology</h3>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-white text-sm">Supported Platforms</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2 bg-[rgba(10,16,28,0.55)] rounded-lg border border-white/8">
                    {SUPPORTED_PLATFORMS.map((platform) => (
                      <label key={platform} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          name="supportedPlatforms"
                          value={platform}
                          checked={(formData.supportedPlatforms || []).includes(platform)}
                          onChange={onFormChange}
                          className="accent-cyan-400"
                        />
                        <span className="text-cyan-100">{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-white text-sm">Tags</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2 bg-[rgba(10,16,28,0.55)] rounded-lg border border-white/8">
                    {TAGS.map((tag) => (
                      <label key={tag} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          name="tags"
                          value={tag}
                          checked={(formData.tags || []).includes(tag)}
                          onChange={onFormChange}
                          className="accent-cyan-400"
                        />
                        <span className="text-cyan-100">{tag}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-cyan-300 mt-1">Select tags that best describe your studio/game.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-white text-sm">Tools</label>
                    <div className="grid grid-cols-2 gap-2 p-2 bg-[rgba(10,16,28,0.55)] rounded-lg border border-white/8">
                      {TOOLS.map((t) => (
                        <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            name="tools"
                            value={t}
                            checked={(formData.tools || []).includes(t)}
                            onChange={onFormChange}
                            className="accent-cyan-400"
                          />
                          <span className="text-cyan-100">{t}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-cyan-300 mt-1">Select one or more tools used by your studio.</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-white text-sm">Revenue Model</label>
                    <select
                      name="revenue"
                      value={formData.revenue || ''}
                      onChange={onFormChange}
                      className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400"
                    >
                      <option value="">Select revenue model...</option>
                      {REVENUE_MODELS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              {/* Projects / Portfolio Section */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <h3 className="text-lg font-bold text-cyan-200 mb-4">Projects / Portfolio</h3>
                <div className="space-y-4">
                  {(formData.projects || []).map((project, index) => (
                    <div key={index} className="bg-[rgba(10,16,28,0.4)] border border-white/8 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-cyan-300">Project {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => {
                            const newProjects = (formData.projects || []).filter((_, i) => i !== index);
                            onFormChange({
                              target: { name: 'projects', value: newProjects }
                            } as any);
                          }}
                          className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-semibold text-white text-xs">Game Title *</label>
                          <input
                            type="text"
                            value={project.gameTitle || ''}
                            onChange={(e) => {
                              const newProjects = [...(formData.projects || [])];
                              newProjects[index] = { ...project, gameTitle: e.target.value };
                              onFormChange({
                                target: { name: 'projects', value: newProjects }
                              } as any);
                            }}
                            placeholder="Game title"
                            className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2 text-sm"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-semibold text-white text-xs">Project Status *</label>
                          <select
                            value={project.projectStatus || ''}
                            onChange={(e) => {
                              const newProjects = [...(formData.projects || [])];
                              newProjects[index] = { ...project, projectStatus: e.target.value as any };
                              onFormChange({
                                target: { name: 'projects', value: newProjects }
                              } as any);
                            }}
                            className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2 text-sm"
                          >
                            <option value="">Select project status...</option>
                            {PROJECT_STATUSES.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2 flex flex-col gap-1.5">
                          <label className="font-semibold text-white text-xs">Platform(s)</label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2 bg-[rgba(10,16,28,0.55)] rounded-lg border border-white/8">
                            {SUPPORTED_PLATFORMS.map((platform) => (
                              <label key={platform} className="flex items-center gap-2 text-xs cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={(project.platforms || []).includes(platform)}
                                  onChange={(e) => {
                                    const newProjects = [...(formData.projects || [])];
                                    const currentPlatforms = project.platforms || [];
                                    const updatedPlatforms = e.target.checked
                                      ? [...currentPlatforms, platform]
                                      : currentPlatforms.filter((p: string) => p !== platform);
                                    newProjects[index] = { 
                                      ...project, 
                                      platforms: updatedPlatforms
                                    };
                                    onFormChange({
                                      target: { name: 'projects', value: newProjects }
                                    } as any);
                                  }}
                                  className="accent-cyan-400"
                                />
                                <span className="text-cyan-100 text-xs">{platform}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-semibold text-white text-xs">Project Page URL</label>
                          <input
                            type="url"
                            value={project.projectPageUrl || ''}
                            onChange={(e) => {
                              const newProjects = [...(formData.projects || [])];
                              newProjects[index] = { ...project, projectPageUrl: e.target.value };
                              onFormChange({
                                target: { name: 'projects', value: newProjects }
                              } as any);
                            }}
                            placeholder="https://..."
                            className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2 text-sm"
                          />
                        </div>
                        <div className="md:col-span-2 flex flex-col gap-1.5">
                          <label className="font-semibold text-white text-xs">Short Project Description</label>
                          <textarea
                            value={project.shortDescription || ''}
                            onChange={(e) => {
                              const newProjects = [...(formData.projects || [])];
                              newProjects[index] = { ...project, shortDescription: e.target.value };
                              onFormChange({
                                target: { name: 'projects', value: newProjects }
                              } as any);
                            }}
                            placeholder="Brief description of the project"
                            rows={2}
                            className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newProjects = [...(formData.projects || []), {
                        gameTitle: '',
                        projectStatus: 'In Development' as const,
                        platforms: [],
                        projectPageUrl: '',
                        shortDescription: ''
                      }];
                      onFormChange({
                        target: { name: 'projects', value: newProjects }
                      } as any);
                    }}
                    className="w-full px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 text-sm"
                  >
                    + Add Project
                  </button>
                </div>
              </div>

              {/* Business & Collaboration Section */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <h3 className="text-lg font-bold text-cyan-200 mb-4">Business & Collaboration</h3>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-white text-sm">Looking For</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2 bg-[rgba(10,16,28,0.55)] rounded-lg border border-white/8">
                      {LOOKING_FOR_OPTIONS.map((option) => (
                        <label key={option} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            name="lookingFor"
                            value={option}
                            checked={(formData.lookingFor || []).includes(option as any)}
                            onChange={onFormChange}
                            className="accent-cyan-400"
                          />
                          <span className="text-cyan-100">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-white text-sm">Open to Publishing Deals</label>
                      <select
                        name="openToPublishingDeals"
                        value={formData.openToPublishingDeals === undefined ? '' : formData.openToPublishingDeals ? 'yes' : 'no'}
                        onChange={(e) => {
                          const selectedValue = e.target.value;
                          const value = selectedValue === '' ? undefined : selectedValue === 'yes';
                          onFormChange({
                            target: { name: 'openToPublishingDeals', value }
                          } as any);
                        }}
                        className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                      >
                        <option value="">Select...</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-white text-sm">Publisher / Partners</label>
                      <input
                        type="text"
                        name="publisherPartners"
                        value={formData.publisherPartners || ''}
                        onChange={onFormChange}
                        placeholder="e.g. Sony, Microsoft"
                        className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-white text-sm">Funding Type</label>
                      <select
                        name="fundingType"
                        value={formData.fundingType || ''}
                        onChange={onFormChange}
                        className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                      >
                        <option value="">Select funding type...</option>
                        {FUNDING_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-white text-sm">Latest Funding Round</label>
                      <input
                        type="text"
                        name="latestFundingRound"
                        value={formData.latestFundingRound || ''}
                        onChange={onFormChange}
                        placeholder="e.g. Series A, $5M"
                        className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-white text-sm">Total Funding</label>
                      <input
                        type="text"
                        name="totalFunding"
                        value={formData.totalFunding || ''}
                        onChange={onFormChange}
                        placeholder="e.g. $10M"
                        className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Distribution & Stores Section */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <h3 className="text-lg font-bold text-cyan-200 mb-4">Distribution & Stores</h3>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-white text-sm">Distribution Channels</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2 bg-[rgba(10,16,28,0.55)] rounded-lg border border-white/8">
                      {DISTRIBUTION_CHANNELS.map((channel) => (
                        <label key={channel} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            name="distributionChannels"
                            value={channel}
                            checked={(formData.distributionChannels || []).includes(channel)}
                            onChange={onFormChange}
                            className="accent-cyan-400"
                          />
                          <span className="text-cyan-100">{channel}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-white text-sm">Store Links</label>
                    <div className="space-y-2">
                      {(formData.storeLinks || []).map((link, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="url"
                            value={link}
                            onChange={(e) => {
                              const newLinks = [...(formData.storeLinks || [])];
                              newLinks[index] = e.target.value;
                              onFormChange({
                                target: { name: 'storeLinks', value: newLinks }
                              } as any);
                            }}
                            placeholder="https://store.example.com/game"
                            className="flex-1 bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newLinks = (formData.storeLinks || []).filter((_, i) => i !== index);
                              onFormChange({
                                target: { name: 'storeLinks', value: newLinks }
                              } as any);
                            }}
                            className="px-3 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newLinks = [...(formData.storeLinks || []), ''];
                        onFormChange({
                          target: { name: 'storeLinks', value: newLinks }
                        } as any);
                      }}
                      className="mt-2 px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 text-sm"
                    >
                      + Add Store Link
                    </button>
                  </div>
                </div>
              </div>

              {/* Contact & Community Section */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <h3 className="text-lg font-bold text-cyan-200 mb-4">Contact & Community</h3>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-white text-sm">Public Contact Email</label>
                    <input
                      type="email"
                      name="publicContactEmail"
                      value={formData.publicContactEmail || ''}
                      onChange={onFormChange}
                      placeholder="public@yourstudio.com"
                      className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-white text-sm">Twitter/X</label>
                      <input
                        type="url"
                        value={formData.socialLinks?.twitter || ''}
                        onChange={(e) => {
                          onFormChange({
                            target: { 
                              name: 'socialLinks', 
                              value: { ...formData.socialLinks, twitter: e.target.value }
                            }
                          } as any);
                        }}
                        placeholder="https://twitter.com/yourstudio"
                        className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-white text-sm">YouTube</label>
                      <input
                        type="url"
                        value={formData.socialLinks?.youtube || ''}
                        onChange={(e) => {
                          onFormChange({
                            target: { 
                              name: 'socialLinks', 
                              value: { ...formData.socialLinks, youtube: e.target.value }
                            }
                          } as any);
                        }}
                        placeholder="https://youtube.com/@yourstudio"
                        className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-white text-sm">Instagram</label>
                      <input
                        type="url"
                        value={formData.socialLinks?.instagram || ''}
                        onChange={(e) => {
                          onFormChange({
                            target: { 
                              name: 'socialLinks', 
                              value: { ...formData.socialLinks, instagram: e.target.value }
                            }
                          } as any);
                        }}
                        placeholder="https://instagram.com/yourstudio"
                        className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-white text-sm">Facebook</label>
                      <input
                        type="url"
                        value={formData.socialLinks?.facebook || ''}
                        onChange={(e) => {
                          onFormChange({
                            target: { 
                              name: 'socialLinks', 
                              value: { ...formData.socialLinks, facebook: e.target.value }
                            }
                          } as any);
                        }}
                        placeholder="https://facebook.com/yourstudio"
                        className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-white text-sm">Discord</label>
                      <input
                        type="url"
                        value={formData.socialLinks?.discord || ''}
                        onChange={(e) => {
                          onFormChange({
                            target: { 
                              name: 'socialLinks', 
                              value: { ...formData.socialLinks, discord: e.target.value }
                            }
                          } as any);
                        }}
                        placeholder="https://discord.gg/yourstudio"
                        className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-white text-sm">LinkedIn</label>
                      <input
                        type="url"
                        value={formData.socialLinks?.linkedin || ''}
                        onChange={(e) => {
                          onFormChange({
                            target: { 
                              name: 'socialLinks', 
                              value: { ...formData.socialLinks, linkedin: e.target.value }
                            }
                          } as any);
                        }}
                        placeholder="https://linkedin.com/company/yourstudio"
                        className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recognition & Press Section */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <h3 className="text-lg font-bold text-cyan-200 mb-4">Recognition & Press</h3>
                <div className="space-y-4">
                  {(formData.recognitions || []).map((recognition, index) => (
                    <div key={index} className="bg-[rgba(10,16,28,0.4)] border border-white/8 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-cyan-300">Recognition {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => {
                            const newRecognitions = (formData.recognitions || []).filter((_, i) => i !== index);
                            onFormChange({
                              target: { name: 'recognitions', value: newRecognitions }
                            } as any);
                          }}
                          className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-semibold text-white text-xs">Recognition Type</label>
                          <select
                            value={recognition.recognitionType || ''}
                            onChange={(e) => {
                              const newRecognitions = [...(formData.recognitions || [])];
                              newRecognitions[index] = { ...recognition, recognitionType: e.target.value as any };
                              onFormChange({
                                target: { name: 'recognitions', value: newRecognitions }
                              } as any);
                            }}
                            className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2 text-sm"
                          >
                            <option value="">Select type</option>
                            {RECOGNITION_TYPES.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-semibold text-white text-xs">Title / Award Name</label>
                          <input
                            type="text"
                            value={recognition.title || ''}
                            onChange={(e) => {
                              const newRecognitions = [...(formData.recognitions || [])];
                              newRecognitions[index] = { ...recognition, title: e.target.value };
                              onFormChange({
                                target: { name: 'recognitions', value: newRecognitions }
                              } as any);
                            }}
                            placeholder="e.g. BAFTA Game Award"
                            className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2 text-sm"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-semibold text-white text-xs">Year</label>
                          <input
                            type="text"
                            value={recognition.year || ''}
                            onChange={(e) => {
                              const newRecognitions = [...(formData.recognitions || [])];
                              newRecognitions[index] = { ...recognition, year: e.target.value };
                              onFormChange({
                                target: { name: 'recognitions', value: newRecognitions }
                              } as any);
                            }}
                            placeholder="e.g. 2023"
                            className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2 text-sm"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-semibold text-white text-xs">Source</label>
                          <input
                            type="text"
                            value={recognition.source || ''}
                            onChange={(e) => {
                              const newRecognitions = [...(formData.recognitions || [])];
                              newRecognitions[index] = { ...recognition, source: e.target.value };
                              onFormChange({
                                target: { name: 'recognitions', value: newRecognitions }
                              } as any);
                            }}
                            placeholder="e.g. IGN, BAFTA"
                            className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2 text-sm"
                          />
                        </div>
                        <div className="md:col-span-2 flex flex-col gap-1.5">
                          <label className="font-semibold text-white text-xs">Description or Quote</label>
                          <textarea
                            value={recognition.description || ''}
                            onChange={(e) => {
                              const newRecognitions = [...(formData.recognitions || [])];
                              newRecognitions[index] = { ...recognition, description: e.target.value };
                              onFormChange({
                                target: { name: 'recognitions', value: newRecognitions }
                              } as any);
                            }}
                            placeholder="Brief description or quote"
                            rows={2}
                            className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newRecognitions = [...(formData.recognitions || []), {
                        recognitionType: 'Award' as const,
                        title: '',
                        year: '',
                        description: '',
                        source: ''
                      }];
                      onFormChange({
                        target: { name: 'recognitions', value: newRecognitions }
                      } as any);
                    }}
                    className="w-full px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 text-sm"
                  >
                    + Add Recognition
                  </button>
                </div>
              </div>

              {/* Media Section */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <h3 className="text-lg font-bold text-cyan-200 mb-4">Media</h3>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-white text-sm">Trailer Video URL</label>
                    <input
                      type="url"
                      name="trailerVideoUrl"
                      value={formData.trailerVideoUrl || ''}
                      onChange={onFormChange}
                      placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                      className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-white text-sm">Gameplay / Dev Video URL</label>
                    <input
                      type="url"
                      name="gameplayVideoUrl"
                      value={formData.gameplayVideoUrl || ''}
                      onChange={onFormChange}
                      placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                      className="bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-lg p-2.5 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                    />
                  </div>
                </div>
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
                <div className="bg-[rgba(0,229,255,0.08)] border border-cyan-500/15 rounded-lg p-3">
                  <span className="text-cyan-400 text-xs font-semibold mb-1.5 block">Tools</span>
                  <span className="font-semibold text-white block">{(submittedProfile.tools || []).join(', ')}</span>
                </div>
                <div className="bg-[rgba(0,229,255,0.08)] border border-cyan-500/15 rounded-lg p-3">
                  <span className="text-cyan-400 text-xs font-semibold mb-1.5 block">Revenue</span>
                  <span className="font-semibold text-white block">{submittedProfile.revenue || '—'}</span>
                </div>
                <div className="bg-[rgba(0,229,255,0.08)] border border-cyan-500/15 rounded-lg p-3">
                  <span className="text-cyan-400 text-xs font-semibold mb-1.5 block">Founded</span>
                  <span className="font-semibold text-white block">{submittedProfile.foundedYear || '—'}</span>
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
