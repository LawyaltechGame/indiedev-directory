import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { databases, Query } from '../../config/appwrite';
import { parseProfileJSONFields } from '../../services/profile';
import { getStudioImageUrl } from '../../services/studioImages';
import { generateSlug } from '../../utils/slug';
import { SEOHead } from '../seo/SEOHead';

interface StudioDetailData {
  name: string;
  tagline: string;
  description?: string;
  website?: string;
  email?: string;
  profileImageId?: string;
  knownFor?: string;
  projects?: Array<{
    gameTitle: string;
    status: string;
    platforms: string[];
    projectPageUrl?: string;
  }>;
  headquartersCountry?: string;
  city?: string;
  foundedYear?: string;
  founders?: string[];
  languagesSupported?: string[];
  teamSize?: string;
  studioType?: string;
  gameEngines?: string[];
  supportedPlatforms?: string[];
  regionsServed?: string[];
  targetAudience?: string;
  deploymentType?: string;
  lookingFor?: string[];
  openToPublishingDeals?: boolean;
  publisherPartners?: string;
  fundingType?: string;
  latestFundingRound?: string;
  totalFunding?: string;
  distributionChannels?: string[];
  storeLinks?: string[];
  socialLinks?: {
    twitter?: string;
    youtube?: string;
    instagram?: string;
    facebook?: string;
    discord?: string;
    linkedin?: string;
  };
  recognitions?: Array<{
    type: string;
    title: string;
    year?: string;
    description?: string;
    source?: string;
  }>;
  trailerVideoUrl?: string;
  gameplayVideoUrl?: string;
}

export function StudioDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [studio, setStudio] = useState<StudioDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStudio = async () => {
      if (!id) {
        setError('Studio ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID as string;
        const PROFILE_TABLE_ID = import.meta.env.VITE_APPWRITE_PROFILE_TABLE_ID as string;

        if (!DB_ID || !PROFILE_TABLE_ID) {
          throw new Error('Database configuration missing');
        }

        // Fetch studio profile
        let response;
        try {
          response = await databases.getDocument(DB_ID, PROFILE_TABLE_ID, id);
        } catch (docError: any) {
          // If document not found by ID, try to find by name (for Avalanche Studios)
          if (docError?.code === 404) {
            const allProfiles = await databases.listDocuments(DB_ID, PROFILE_TABLE_ID, [
              Query.equal('status', 'approved'),
            ]);
            const foundProfile = allProfiles.documents.find((doc: any) => {
              try {
                const parsed = parseProfileJSONFields(doc);
                // Try to match by name if ID doesn't match
                return parsed.name === 'Avalanche Studios' || doc.$id === id;
              } catch {
                return false;
              }
            });
            if (foundProfile) {
              response = foundProfile;
            } else {
              throw docError;
            }
          } else {
            throw docError;
          }
        }
        
        const parsedProfile = parseProfileJSONFields(response);
        
        // Map database profile to StudioDetailData format
        const studioData: StudioDetailData = {
          name: parsedProfile.name || 'Unknown Studio',
          tagline: parsedProfile.tagline || '',
          description: parsedProfile.description || '',
          website: parsedProfile.website || '',
          email: parsedProfile.email || parsedProfile.publicContactEmail || '',
          profileImageId: parsedProfile.profileImageId,
          knownFor: parsedProfile.knownFor || '',
          projects: parsedProfile.projects || [],
          headquartersCountry: parsedProfile.headquartersCountry || '',
          city: parsedProfile.city || '',
          foundedYear: parsedProfile.foundedYear || '',
          founders: parsedProfile.founders || [],
          languagesSupported: parsedProfile.languagesSupported || [],
          teamSize: parsedProfile.teamSize || '',
          studioType: parsedProfile.studioType || '',
          gameEngines: parsedProfile.gameEngines || [],
          supportedPlatforms: parsedProfile.supportedPlatforms || [],
          regionsServed: parsedProfile.regionsServed || [],
          targetAudience: parsedProfile.targetAudience || '',
          deploymentType: parsedProfile.deploymentType || '',
          lookingFor: parsedProfile.lookingFor || [],
          openToPublishingDeals: parsedProfile.openToPublishingDeals,
          publisherPartners: parsedProfile.publisherPartners || '',
          fundingType: parsedProfile.fundingType || '',
          latestFundingRound: parsedProfile.latestFundingRound || '',
          totalFunding: parsedProfile.totalFunding || '',
          distributionChannels: parsedProfile.distributionChannels || [],
          storeLinks: parsedProfile.storeLinks || [],
          socialLinks: parsedProfile.socialLinks || {},
          recognitions: parsedProfile.recognitions || [],
          trailerVideoUrl: parsedProfile.trailerVideoUrl || '',
          gameplayVideoUrl: parsedProfile.gameplayVideoUrl || '',
        };
        
        setStudio(studioData);
        setLoading(false);
      } catch (err: any) {
        console.error('Error loading studio:', err);
        setError(err.message || 'Failed to load studio profile');
        setLoading(false);
      }
    };

    loadStudio();
  }, [id]);

  const formatUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-white pt-28 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-white/10 rounded w-1/3 mb-8" />
            <div className="h-96 bg-white/10 rounded-2xl mb-8" />
            <div className="space-y-4">
              <div className="h-4 bg-white/10 rounded w-full" />
              <div className="h-4 bg-white/10 rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !studio) {
    return (
      <div className="min-h-screen bg-bg text-white pt-28 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/studios_directory')}
            className="mb-6 flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition-colors duration-200"
          >
            <span>←</span> Back to Directory
          </button>
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
            <p className="text-red-300 text-lg">{error || 'Studio not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const youtubeId = studio.trailerVideoUrl ? extractYouTubeId(studio.trailerVideoUrl) : null;

  return (
    <>
      <SEOHead
        title={`${studio.name} - ${studio.tagline} | Game Centralen`}
        description={studio.description || studio.tagline || `Learn more about ${studio.name}, an indie game studio.`}
        canonicalUrl={`https://gamecentralen.com/studio/${id}`}
        ogImage={studio.profileImageId ? getStudioImageUrl(studio.profileImageId) : undefined}
      />
      <div className="min-h-screen bg-bg text-white pt-28 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/studios_directory')}
          className="mb-8 group flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition-all duration-300 hover:gap-3"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
          <span>Back to Directory</span>
        </button>

        {/* Hero Section - Enhanced */}
        <div className="relative bg-gradient-to-br from-[rgba(20,28,42,0.8)] via-[rgba(20,28,42,0.6)] to-[rgba(20,28,42,0.8)] border border-white/10 rounded-3xl overflow-hidden mb-12 shadow-2xl shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-500 group">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Studio Info */}
          <div className="relative p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Studio Logo - Enhanced */}
              {studio.profileImageId ? (
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0 border-2 border-cyan-500/30 p-3 shadow-lg shadow-cyan-500/20 group/logo hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300" />
                  <img
                    src={getStudioImageUrl(studio.profileImageId)}
                    alt={`${studio.name} logo`}
                    className="relative w-full h-full object-contain z-10"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const parent = target.parentElement;
                      if (parent) {
                        parent.className = 'w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center text-[#001018] text-4xl md:text-5xl font-black flex-shrink-0 shadow-lg';
                        parent.innerHTML = `<span>${studio.name.charAt(0)}</span>`;
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-400 to-teal-400 flex items-center justify-center text-[#001018] text-4xl md:text-5xl font-black flex-shrink-0 shadow-lg shadow-cyan-500/30 hover:scale-105 transition-transform duration-300">
                  {studio.name.charAt(0)}
                </div>
              )}

              {/* Studio Details - Enhanced */}
              <div className="flex-1">
                <h1 className="text-5xl md:text-6xl font-black mb-3 bg-gradient-to-r from-cyan-100 via-cyan-300 to-blue-300 bg-clip-text text-transparent animate-fade-in">
                  {studio.name}
                </h1>
                <p className="text-xl md:text-2xl text-cyan-200/90 mb-6 font-medium">{studio.tagline}</p>
                
                {studio.website && (
                  <a
                    href={formatUrl(studio.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl text-cyan-300 hover:text-white hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 group/link"
                  >
                    <svg className="w-5 h-5 transition-transform duration-300 group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span className="font-semibold">{studio.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Short Description - Enhanced */}
            {studio.description && (
              <div className="group bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl p-8 md:p-10 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 hover:border-cyan-500/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full" />
                  <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-100 to-blue-200 bg-clip-text">About</h2>
                </div>
                <p className="text-cyan-200/90 leading-relaxed text-lg">{studio.description}</p>
              </div>
            )}

            {/* Known For - Enhanced */}
            {studio.knownFor && (
              <div className="group bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl p-8 md:p-10 shadow-xl hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-500 hover:border-teal-500/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-teal-400 rounded-full" />
                  <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-100 to-teal-200 bg-clip-text">Known For</h2>
                </div>
                <p className="text-cyan-200/90 leading-relaxed text-lg">{studio.knownFor}</p>
              </div>
            )}

            {/* Projects Portfolio - Enhanced with Cards */}
            {studio.projects && studio.projects.length > 0 && (
              <div className="group bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl p-8 md:p-10 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full" />
                  <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-100 to-blue-200 bg-clip-text">Projects Portfolio</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {studio.projects.map((project, index) => (
                    <div
                      key={index}
                      className="group/project bg-gradient-to-br from-[rgba(0,0,0,0.3)] to-[rgba(0,0,0,0.1)] border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-4">
                        {(['Just Cause 3', 'Mad Max', 'Dinner with an Owl ("Dessert Edition")', 'Owl Observatory - Dinner with an Owl Prequel', 'Shadow Survival'].includes(project.gameTitle)) ? (
                          <button
                            onClick={() => {
                              // Handle special cases for game slugs to match database names
                              // Check for Owl Observatory FIRST since its title contains "Dinner with an Owl"
                              let gameSlug: string;
                              if (project.gameTitle.includes('Owl Observatory')) {
                                gameSlug = 'owl-observatory';
                              } else if (project.gameTitle.includes('Dinner with an Owl')) {
                                gameSlug = 'dinner-with-an-owl-dessert-edition';
                              } else {
                                // Use generateSlug for other games
                                gameSlug = generateSlug(project.gameTitle);
                              }
                              navigate(`/game/${encodeURIComponent(gameSlug)}`);
                            }}
                            className="text-xl font-bold text-cyan-100 group-hover/project:text-white hover:text-cyan-200 transition-colors cursor-pointer text-left"
                          >
                            {project.gameTitle}
                          </button>
                        ) : (
                          <h3 className="text-xl font-bold text-cyan-100 group-hover/project:text-white transition-colors">
                            {project.gameTitle}
                          </h3>
                        )}
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                          project.status === 'Released' 
                            ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-300 border border-green-500/30' 
                            : project.status === 'In Development'
                            ? 'bg-gradient-to-r from-yellow-500/30 to-amber-500/30 text-yellow-300 border border-yellow-500/30'
                            : 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-blue-300 border border-blue-500/30'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.platforms.map((platform, pIndex) => (
                          <span
                            key={pIndex}
                            className="px-3 py-1 bg-cyan-500/10 text-cyan-300 rounded-lg text-xs font-semibold border border-cyan-500/20"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                      {project.projectPageUrl && (
                        <a
                          href={formatUrl(project.projectPageUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 font-semibold transition-all duration-300 group/link"
                        >
                          <span>View Project</span>
                          <svg className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Media Gallery - Enhanced */}
            {youtubeId && (
              <div className="group bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl p-8 md:p-10 shadow-xl hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-red-400 to-orange-400 rounded-full" />
                  <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-red-100 to-orange-200 bg-clip-text">Media Gallery</h2>
                </div>
                <div className="aspect-video rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl group-hover:border-red-500/30 transition-all duration-500">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title="Studio Trailer"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Key Facts - Enhanced */}
            <div className="group bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 hover:border-cyan-500/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full" />
                <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-cyan-100 to-blue-200 bg-clip-text">Key Facts</h2>
              </div>
              <div className="space-y-4">
                {studio.headquartersCountry && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group/item">
                    <span className="text-cyan-400">📍</span>
                    <div className="flex-1">
                      <span className="text-cyan-300/70 text-xs block mb-1">Headquarters</span>
                      <span className="text-cyan-100 font-semibold">{studio.headquartersCountry}</span>
                    </div>
                  </div>
                )}
                {studio.city && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group/item">
                    <span className="text-blue-400">🏙️</span>
                    <div className="flex-1">
                      <span className="text-cyan-300/70 text-xs block mb-1">City</span>
                      <span className="text-cyan-100 font-semibold">{studio.city}</span>
                    </div>
                  </div>
                )}
                {studio.foundedYear && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group/item">
                    <span className="text-yellow-400">📅</span>
                    <div className="flex-1">
                      <span className="text-cyan-300/70 text-xs block mb-1">Year Founded</span>
                      <span className="text-cyan-100 font-semibold">{studio.foundedYear}</span>
                    </div>
                  </div>
                )}
                {studio.founders && studio.founders.length > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group/item">
                    <span className="text-green-400">👥</span>
                    <div className="flex-1">
                      <span className="text-cyan-300/70 text-xs block mb-1">Founders</span>
                      <span className="text-cyan-100 font-semibold">{studio.founders.join(', ')}</span>
                    </div>
                  </div>
                )}
                {studio.languagesSupported && studio.languagesSupported.length > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group/item">
                    <span className="text-blue-400">🌐</span>
                    <div className="flex-1">
                      <span className="text-cyan-300/70 text-xs block mb-1">Languages</span>
                      <span className="text-cyan-100 font-semibold">{studio.languagesSupported.join(', ')}</span>
                    </div>
                  </div>
                )}
                {studio.teamSize && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group/item">
                    <span className="text-teal-400">👨‍💼</span>
                    <div className="flex-1">
                      <span className="text-cyan-300/70 text-xs block mb-1">Team Size</span>
                      <span className="text-cyan-100 font-semibold">{studio.teamSize}</span>
                    </div>
                  </div>
                )}
                {studio.studioType && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group/item">
                    <span className="text-cyan-400">🎮</span>
                    <div className="flex-1">
                      <span className="text-cyan-300/70 text-xs block mb-1">Type</span>
                      <span className="text-cyan-100 font-semibold">{studio.studioType}</span>
                    </div>
                  </div>
                )}
                {studio.gameEngines && studio.gameEngines.length > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group/item">
                    <span className="text-orange-400">⚙️</span>
                    <div className="flex-1">
                      <span className="text-cyan-300/70 text-xs block mb-1">Engine Used</span>
                      <span className="text-cyan-100 font-semibold">{studio.gameEngines.join(', ')}</span>
                    </div>
                  </div>
                )}
                {studio.supportedPlatforms && studio.supportedPlatforms.length > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group/item">
                    <span className="text-indigo-400 mt-1">💻</span>
                    <div className="flex-1">
                      <span className="text-cyan-300/70 text-xs block mb-2">Platforms</span>
                      <div className="flex flex-wrap gap-2">
                        {studio.supportedPlatforms.map((platform, idx) => (
                          <span key={idx} className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-lg text-xs font-semibold border border-cyan-500/30">
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {studio.regionsServed && studio.regionsServed.length > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group/item">
                    <span className="text-emerald-400 mt-1">🌍</span>
                    <div className="flex-1">
                      <span className="text-cyan-300/70 text-xs block mb-2">Regions Served</span>
                      <div className="flex flex-wrap gap-2">
                        {studio.regionsServed.map((region, idx) => (
                          <span key={idx} className="px-2 py-1 bg-teal-500/20 text-teal-300 rounded-lg text-xs font-semibold border border-teal-500/30">
                            {region}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {studio.targetAudience && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group/item">
                    <span className="text-red-400">🎯</span>
                    <div className="flex-1">
                      <span className="text-cyan-300/70 text-xs block mb-1">Target Audience</span>
                      <span className="text-cyan-100 font-semibold">{studio.targetAudience}</span>
                    </div>
                  </div>
                )}
                {studio.deploymentType && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group/item">
                    <span className="text-teal-400">📦</span>
                    <div className="flex-1">
                      <span className="text-cyan-300/70 text-xs block mb-1">Deployment</span>
                      <span className="text-cyan-100 font-semibold">{studio.deploymentType}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Business & Collaboration - Enhanced */}
            <div className="group bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-500 hover:border-teal-500/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-teal-400 rounded-full" />
                <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-100 to-teal-200 bg-clip-text">Business & Collaboration</h2>
              </div>
              <div className="space-y-4">
                {studio.lookingFor && studio.lookingFor.length > 0 && (
                  <div className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <span className="text-cyan-300/70 text-xs block mb-1">Looking For</span>
                    <span className="text-cyan-100 font-semibold">{studio.lookingFor.join(', ')}</span>
                  </div>
                )}
                {studio.publisherPartners && (
                  <div className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <span className="text-cyan-300/70 text-xs block mb-1">Partnerships</span>
                    <span className="text-cyan-100 font-semibold">{studio.publisherPartners}</span>
                  </div>
                )}
                <div className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-cyan-300/70 text-xs block mb-1">Open to Publishing Deals</span>
                  <span className={`inline-flex px-3 py-1 rounded-lg text-sm font-semibold ${
                    studio.openToPublishingDeals === true 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                      : studio.openToPublishingDeals === false 
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  }`}>
                    {studio.openToPublishingDeals === true ? 'Yes' : studio.openToPublishingDeals === false ? 'No' : 'Case by case'}
                  </span>
                </div>
                {studio.fundingType && (
                  <div className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <span className="text-cyan-300/70 text-xs block mb-1">Funding Type</span>
                    <span className="text-cyan-100 font-semibold">{studio.fundingType}</span>
                  </div>
                )}
                {studio.latestFundingRound && (
                  <div className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <span className="text-cyan-300/70 text-xs block mb-1">Latest Funding Round</span>
                    <span className="text-cyan-100 font-semibold">{studio.latestFundingRound}</span>
                  </div>
                )}
                {studio.totalFunding && (
                  <div className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <span className="text-cyan-300/70 text-xs block mb-1">Total Funding</span>
                    <span className="text-cyan-100 font-semibold">{studio.totalFunding}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Distribution & Community Links - Enhanced */}
            <div className="group bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 hover:border-cyan-500/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full" />
                <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-cyan-100 to-blue-200 bg-clip-text">Distribution & Community</h2>
              </div>
              <div className="space-y-5">
                {studio.distributionChannels && studio.distributionChannels.length > 0 && (
                  <div>
                    <span className="text-cyan-300/70 text-sm font-semibold block mb-3">Distribution Channels</span>
                    <div className="flex flex-wrap gap-2">
                      {studio.distributionChannels.map((channel, index) => (
                        <span key={index} className="px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 rounded-xl text-xs font-semibold border border-cyan-500/30 hover:border-cyan-400/50 hover:bg-gradient-to-r hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300">
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {studio.storeLinks && studio.storeLinks.length > 0 && (
                  <div>
                    <span className="text-cyan-300/70 text-sm font-semibold block mb-3">Store Links</span>
                    <div className="space-y-2">
                      {studio.storeLinks.map((link, index) => (
                        <a
                          key={index}
                          href={formatUrl(link)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/link flex items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 hover:text-white text-sm transition-all duration-300 border border-white/10 hover:border-cyan-500/30 break-words overflow-hidden"
                        >
                          <svg className="w-4 h-4 flex-shrink-0 transition-transform duration-300 group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          <span className="font-medium break-all min-w-0">{link.replace(/^https?:\/\//, '')}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {studio.socialLinks && (
                  <div>
                    <span className="text-cyan-300/70 text-sm font-semibold block mb-4">Social Links</span>
                    <div className="flex flex-wrap gap-4">
                      {studio.socialLinks.twitter && (
                        <a
                          href={formatUrl(studio.socialLinks.twitter)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/social w-12 h-12 rounded-xl bg-gradient-to-br from-black/40 to-black/20 border border-white/10 flex items-center justify-center text-cyan-300 hover:text-white hover:border-cyan-400/50 hover:bg-gradient-to-br hover:from-cyan-500/20 hover:to-blue-500/20 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/20"
                          title="Twitter/X"
                        >
                          <svg className="w-6 h-6 transition-transform duration-300 group-hover/social:scale-110" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </a>
                      )}
                      {studio.socialLinks.youtube && (
                        <a
                          href={formatUrl(studio.socialLinks.youtube)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/social w-12 h-12 rounded-xl bg-gradient-to-br from-black/40 to-black/20 border border-white/10 flex items-center justify-center text-red-400 hover:text-white hover:border-red-400/50 hover:bg-gradient-to-br hover:from-red-500/20 hover:to-orange-500/20 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/20"
                          title="YouTube"
                        >
                          <svg className="w-6 h-6 transition-transform duration-300 group-hover/social:scale-110" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        </a>
                      )}
                      {studio.socialLinks.instagram && (
                        <a
                          href={formatUrl(studio.socialLinks.instagram)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/social w-12 h-12 rounded-xl bg-gradient-to-br from-black/40 to-black/20 border border-white/10 flex items-center justify-center text-pink-400 hover:text-white hover:border-pink-400/50 hover:bg-gradient-to-br hover:from-pink-500/20 hover:to-purple-500/20 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-pink-500/20"
                          title="Instagram"
                        >
                          <svg className="w-6 h-6 transition-transform duration-300 group-hover/social:scale-110" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </a>
                      )}
                      {studio.socialLinks.facebook && (
                        <a
                          href={formatUrl(studio.socialLinks.facebook)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/social w-12 h-12 rounded-xl bg-gradient-to-br from-black/40 to-black/20 border border-white/10 flex items-center justify-center text-blue-400 hover:text-white hover:border-blue-400/50 hover:bg-gradient-to-br hover:from-blue-500/20 hover:to-cyan-500/20 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20"
                          title="Facebook"
                        >
                          <svg className="w-6 h-6 transition-transform duration-300 group-hover/social:scale-110" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </a>
                      )}
                      {studio.socialLinks.discord && (
                        <a
                          href={formatUrl(studio.socialLinks.discord)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/social w-12 h-12 rounded-xl bg-gradient-to-br from-black/40 to-black/20 border border-white/10 flex items-center justify-center text-indigo-400 hover:text-white hover:border-indigo-400/50 hover:bg-gradient-to-br hover:from-indigo-500/20 hover:to-blue-500/20 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/20"
                          title="Discord"
                        >
                          <svg className="w-6 h-6 transition-transform duration-300 group-hover/social:scale-110" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                          </svg>
                        </a>
                      )}
                      {studio.socialLinks.linkedin && (
                        <a
                          href={formatUrl(studio.socialLinks.linkedin)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/social w-12 h-12 rounded-xl bg-gradient-to-br from-black/40 to-black/20 border border-white/10 flex items-center justify-center text-blue-500 hover:text-white hover:border-blue-500/50 hover:bg-gradient-to-br hover:from-blue-600/20 hover:to-blue-700/20 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20"
                          title="LinkedIn"
                        >
                          <svg className="w-6 h-6 transition-transform duration-300 group-hover/social:scale-110" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recognition / Press - Enhanced */}
            {studio.recognitions && studio.recognitions.length > 0 && (
              <div className="group bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl p-8 md:p-10 shadow-xl hover:shadow-2xl hover:shadow-yellow-500/10 transition-all duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-orange-400 rounded-full" />
                  <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-yellow-100 to-orange-200 bg-clip-text">Recognition / Press</h2>
                </div>
                <div className="space-y-6">
                  {studio.recognitions.map((recognition, index) => (
                    <div 
                      key={index} 
                      className="group/award relative p-6 rounded-2xl bg-gradient-to-br from-[rgba(0,0,0,0.3)] to-[rgba(0,0,0,0.1)] border border-white/10 hover:border-yellow-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10 hover:-translate-y-1"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 to-orange-400 rounded-l-2xl opacity-0 group-hover/award:opacity-100 transition-opacity duration-300" />
                      <div className="pl-4">
                        <div className="inline-flex px-3 py-1 mb-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 rounded-lg text-xs font-bold border border-yellow-500/30">
                          {recognition.type}
                        </div>
                        <div className="text-lg font-bold text-cyan-100 mb-2 group-hover/award:text-white transition-colors">
                          {recognition.title}
                        </div>
                        {recognition.description && (
                          <div className="text-cyan-200/80 text-sm mb-3 leading-relaxed">{recognition.description}</div>
                        )}
                        <div className="flex items-center gap-3 text-xs text-cyan-300/70">
                          {recognition.source && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                              </svg>
                              {recognition.source}
                            </span>
                          )}
                          {recognition.year && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {recognition.year}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

