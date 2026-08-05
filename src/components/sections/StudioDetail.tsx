import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
    year?: string;
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
  socialLinks?: Record<string, string>;
  recognitions?: Array<{
    type?: string;
    title: string;
    year?: string;
    description?: string;
    source?: string;
    link?: string;
  }>;
  trailerVideoUrl?: string;
  gameplayVideoUrl?: string;

  // Extended corporate profile fields matching remedy.html
  legalEntityName?: string;
  registrationId?: string;
  stockSymbol?: string;
  acquisitionStatus?: string;
  parentCompany?: string;
  leadership?: Array<{ name: string; role: string; bio?: string }>;
  financials?: Array<{
    year: string;
    revenue: string;
    ebitda?: string;
    ebit?: string;
    result?: string;
    balanceSheet?: string;
    equity?: string;
    equityRatio?: string;
    eps?: string;
    fte?: string;
  }>;
  workforce?: {
    headcount?: number;
    avgFte?: number;
    composition?: string;
  };
  whatChanged?: Array<{ date: string; event: string }>;
  businessModel?: string;
  ipOwned?: string;
  financingNotes?: string;
  similarStudios?: Array<{
    name: string;
    location: string;
    tags: string;
    description: string;
    link?: string;
  }>;
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

        let response: any = null;
        const decodedId = decodeURIComponent(id);
        const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
        const searchNormalized = normalize(decodedId);

        // Fetch up to 500 studio profiles to avoid Appwrite 25 default limit
        const allProfiles = await databases.listDocuments(DB_ID, PROFILE_TABLE_ID, [
          Query.equal('status', 'approved'),
          Query.limit(500),
        ]);

        response = allProfiles.documents.find((doc: any) => {
          try {
            const parsed = parseProfileJSONFields(doc);
            const studioName = parsed.name || '';
            if (
              doc.$id === id ||
              generateSlug(studioName) === decodedId.toLowerCase() ||
              normalize(studioName) === searchNormalized ||
              studioName.toLowerCase() === decodedId.toLowerCase()
            ) {
              return true;
            }
            return false;
          } catch {
            return false;
          }
        });

        if (!response) {
          try {
            response = await databases.getDocument(DB_ID, PROFILE_TABLE_ID, id);
          } catch {
            // fallback
          }
        }

        if (!response) {
          throw new Error(`Studio profile '${id}' could not be found.`);
        }

        const parsedProfile = parseProfileJSONFields(response);

        let profileImageId =
          parsedProfile.profileImageId ||
          (parsedProfile.profileData && typeof parsedProfile.profileData === 'object'
            ? parsedProfile.profileData.profileImageId
            : null) ||
          null;

        if (profileImageId === '' || profileImageId === 'NULL' || profileImageId === null) {
          profileImageId = null;
        }

        const studioData: StudioDetailData = {
          name: parsedProfile.name || 'Unknown Studio',
          tagline: parsedProfile.tagline || '',
          description: parsedProfile.description || '',
          website: parsedProfile.website || '',
          email: parsedProfile.email || parsedProfile.publicContactEmail || '',
          profileImageId: profileImageId,
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

          // Corporate extensions
          legalEntityName: parsedProfile.legalEntityName || '',
          registrationId: parsedProfile.registrationId || '',
          stockSymbol: parsedProfile.stockSymbol || '',
          acquisitionStatus: parsedProfile.acquisitionStatus || 'Independent',
          parentCompany: parsedProfile.parentCompany || '',
          leadership: parsedProfile.leadership || [],
          financials: parsedProfile.financials || [],
          workforce: parsedProfile.workforce || {},
          whatChanged: parsedProfile.whatChanged || [],
          businessModel: parsedProfile.businessModel || '',
          ipOwned: parsedProfile.ipOwned || '',
          financingNotes: parsedProfile.financingNotes || '',
          similarStudios: parsedProfile.similarStudios || []
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
    return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  };

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const goToGame = (gameTitle: string) => {
    let gameSlug: string;
    if (gameTitle.includes('Owl Observatory')) {
      gameSlug = 'owl-observatory';
    } else if (gameTitle.includes('Dinner with an Owl')) {
      gameSlug = 'dinner-with-an-owl-dessert-edition';
    } else {
      gameSlug = generateSlug(gameTitle);
    }
    navigate(`/game/${encodeURIComponent(gameSlug)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070a] text-white pt-28 pb-16 px-6">
        <div className="max-w-7xl mx-auto animate-pulse space-y-8">
          <div className="h-12 bg-white/10 rounded w-1/3" />
          <div className="h-96 bg-white/10 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !studio) {
    return (
      <div className="min-h-screen bg-[#05070a] text-white pt-28 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="mb-6 inline-block text-cyan-300 hover:text-cyan-200 font-semibold">
            ← Back to Directory
          </Link>
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
            <p className="text-red-300 text-lg">{error || 'Studio not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const youtubeId = studio.trailerVideoUrl ? extractYouTubeId(studio.trailerVideoUrl) : null;
  const studioInitials = studio.name.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase();

  return (
    <>
      <SEOHead
        title={`${studio.name} — Studio Profile | Game Centralen`}
        description={studio.tagline || studio.description || `Studio profile for ${studio.name}`}
        canonicalUrl={`https://gamecentralen.com/studio/${id}`}
        ogImage={studio.profileImageId ? getStudioImageUrl(studio.profileImageId) : undefined}
      />

      <div className="min-h-screen bg-[#05070a] text-white font-sans antialiased">
        {/* Background Gradients */}
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-60"
          style={{
            background:
              'radial-gradient(900px 500px at 15% -5%, rgba(34,211,238,.10), transparent 60%),radial-gradient(800px 500px at 90% 0%, rgba(59,130,246,.10), transparent 60%)',
          }}
        />

        <main className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6 pt-28 pb-20">

          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl shadow-xl transition-all duration-500 mb-8 p-8 md:p-12">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5" />
            <div className="relative">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-cyan-300/70 hover:text-cyan-300 text-sm font-semibold mb-8 cursor-pointer"
              >
                ← Back to Directory
              </Link>

              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Logo / Monogram */}
                {studio.profileImageId ? (
                  <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0 border-2 border-cyan-500/30 p-3 shadow-lg shadow-cyan-500/20">
                    <img
                      src={getStudioImageUrl(studio.profileImageId)}
                      alt={`${studio.name} logo`}
                      className="w-auto h-auto max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0 border-2 border-cyan-500/30 shadow-lg shadow-cyan-500/20">
                    <span className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-gradient-to-br from-cyan-100 to-blue-300 bg-clip-text">
                      {studioInitials}
                    </span>
                  </div>
                )}

                {/* Studio Information */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-cyan-100 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
                      {studio.name}
                    </h1>
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500/30 to-teal-500/30 text-emerald-300 border border-emerald-500/30">
                      {studio.acquisitionStatus || 'Independent'}
                    </span>
                  </div>

                  <p className="text-sm font-mono text-cyan-300/60 mb-4">
                    {[
                      studio.legalEntityName || studio.name,
                      studio.registrationId,
                      studio.city ? `${studio.city}, ${studio.headquartersCountry}` : studio.headquartersCountry,
                      studio.stockSymbol
                    ].filter(Boolean).join(' · ')}
                  </p>

                  <p className="text-lg md:text-2xl text-cyan-200/90 mb-6 font-medium">
                    {studio.tagline}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {studio.website && (
                      <a
                        href={formatUrl(studio.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl font-bold text-cyan-100 hover:border-cyan-400/60 transition"
                      >
                        🌐 {studio.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </a>
                    )}
                    <a
                      href="#financials"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-cyan-100 hover:border-amber-400/40 transition"
                    >
                      📊 Filed financials
                    </a>
                    <a
                      href="#games"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-cyan-100 hover:border-cyan-400/40 transition"
                    >
                      🎮 {studio.projects?.length || 0} titles
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Main Content */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* About Section */}
              {studio.description && (
                <section className="bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl shadow-xl p-8 md:p-10 hover:border-cyan-500/30 transition-all">
                  <div className="flex items-center gap-3 mb-6 flex-wrap">
                    <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full" />
                    <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-100 to-blue-200 bg-clip-text">
                      About
                    </h2>
                    <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-cyan-300/40 whitespace-nowrap">
                      Verified Profile
                    </span>
                  </div>
                  <p className="text-cyan-200/90 leading-relaxed text-lg">{studio.description}</p>
                </section>
              )}

              {/* Legal Entity & Ownership Section */}
              <section className="bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl shadow-xl p-8 md:p-10 hover:border-cyan-500/30 transition-all">
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-teal-400 rounded-full" />
                  <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-blue-100 to-teal-200 bg-clip-text">
                    Legal Entity & Ownership
                  </h2>
                </div>
                <div className="mb-6 p-5 rounded-2xl bg-black/30 border border-white/10 font-mono text-sm leading-7">
                  <div className="text-cyan-100">
                    <strong>{studio.legalEntityName || studio.name}</strong>{' '}
                    <span className="text-cyan-400/60">· {studio.registrationId || 'Registered Entity'}</span>
                  </div>
                  <div className="text-zinc-400/70 pt-2">
                    Operating presence in {studio.city ? `${studio.city}, ` : ''}{studio.headquartersCountry}. {studio.parentCompany ? `Parent company: ${studio.parentCompany}.` : 'Independent ownership.'}
                  </div>
                </div>
                <div className="p-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04]">
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border-cyan-500/30 border mb-3">
                    Corporate Profile
                  </span>
                  <h3 className="text-lg font-bold text-cyan-50 mb-1">{studio.name}</h3>
                  <p className="text-cyan-300 font-mono text-sm mb-4">{studio.registrationId || studio.stockSymbol || 'Registered Studio'}</p>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div>
                      <dt className="text-cyan-300/60 text-xs uppercase tracking-wide">Form</dt>
                      <dd className="text-cyan-100">{studio.studioType || 'Game Studio'}</dd>
                    </div>
                    <div>
                      <dt className="text-cyan-300/60 text-xs uppercase tracking-wide">Incorporated</dt>
                      <dd className="text-cyan-100">{studio.foundedYear || 'N/A'}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-cyan-300/60 text-xs uppercase tracking-wide">Registered Address</dt>
                      <dd className="text-cyan-100">{studio.city ? `${studio.city}, ` : ''}{studio.headquartersCountry || 'Global'}</dd>
                    </div>
                  </dl>
                </div>
              </section>

              {/* Financials (filed) Section */}
              <section id="financials" className="bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl shadow-xl p-8 md:p-10 hover:border-cyan-500/30 transition-all">
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-emerald-400 rounded-full" />
                  <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-green-100 to-emerald-200 bg-clip-text">
                    Financials (filed)
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-400/15 text-emerald-300 border border-emerald-400/30">
                    Verified
                  </span>
                </div>

                {studio.financials && studio.financials.length > 0 ? (
                  <div className="overflow-x-auto -mx-2 px-2 mb-6">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-white/15">
                          <th className="px-3 py-2.5 text-left text-xs font-bold text-cyan-200">Metric</th>
                          {studio.financials.map((f, i) => (
                            <th key={i} className="px-3 py-2.5 text-right text-xs font-bold text-cyan-200">
                              {f.year}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white/[0.03]">
                          <td className="px-3 py-2.5 text-left text-cyan-200/80 font-semibold">Revenue</td>
                          {studio.financials.map((f, i) => (
                            <td key={i} className="px-3 py-2.5 text-right tabular-nums text-cyan-50">
                              {f.revenue}
                            </td>
                          ))}
                        </tr>
                        {studio.financials.some(f => f.ebitda) && (
                          <tr>
                            <td className="px-3 py-2.5 text-left text-cyan-200/80 font-semibold">EBITDA</td>
                            {studio.financials.map((f, i) => (
                              <td key={i} className="px-3 py-2.5 text-right tabular-nums text-cyan-50">
                                {f.ebitda || 'n/t'}
                              </td>
                            ))}
                          </tr>
                        )}
                        {studio.financials.some(f => f.ebit) && (
                          <tr className="bg-white/[0.03]">
                            <td className="px-3 py-2.5 text-left text-cyan-200/80 font-semibold">Operating Profit (EBIT)</td>
                            {studio.financials.map((f, i) => (
                              <td key={i} className="px-3 py-2.5 text-right tabular-nums text-cyan-50">
                                {f.ebit || 'n/t'}
                              </td>
                            ))}
                          </tr>
                        )}
                        {studio.financials.some(f => f.fte) && (
                          <tr>
                            <td className="px-3 py-2.5 text-left text-cyan-300/70 font-semibold">Average Personnel (FTE)</td>
                            {studio.financials.map((f, i) => (
                              <td key={i} className="px-3 py-2.5 text-right tabular-nums text-cyan-300/80">
                                {f.fte || 'n/t'}
                              </td>
                            ))}
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-cyan-200/80 text-sm">
                    Funding Model: <strong className="text-cyan-100">{studio.fundingType || 'Private / Self-Funded'}</strong>. Official annual reports filed with local business registers.
                  </div>
                )}
              </section>

              {/* Leadership & Founder Pedigree Section */}
              <section className="bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl shadow-xl p-8 md:p-10 hover:border-cyan-500/30 transition-all">
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  <div className="w-1 h-8 bg-gradient-to-b from-violet-400 to-fuchsia-400 rounded-full" />
                  <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-violet-100 to-fuchsia-200 bg-clip-text">
                    Leadership & Founder Pedigree
                  </h2>
                </div>

                <div className="space-y-2">
                  {studio.leadership && studio.leadership.length > 0 ? (
                    studio.leadership.map((person, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="sm:w-56 flex-shrink-0">
                          <span className="block font-bold text-cyan-50 text-sm">{person.name}</span>
                          <span className="block text-[11px] text-cyan-300/60 uppercase tracking-wide">{person.role}</span>
                        </div>
                        <p className="text-sm text-cyan-200/80 leading-relaxed">{person.bio || 'Key leadership member.'}</p>
                      </div>
                    ))
                  ) : (
                    studio.founders?.map((founder, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="sm:w-56 flex-shrink-0">
                          <span className="block font-bold text-cyan-50 text-sm">{founder}</span>
                          <span className="block text-[11px] text-cyan-300/60 uppercase tracking-wide">Co-Founder</span>
                        </div>
                        <p className="text-sm text-cyan-200/80 leading-relaxed">Founding team member of {studio.name}.</p>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Projects Portfolio Section */}
              <section id="games" className="bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl shadow-xl p-8 md:p-10 hover:border-cyan-500/30 transition-all">
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full" />
                  <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-100 to-blue-200 bg-clip-text">
                    Projects Portfolio
                  </h2>
                </div>

                {studio.projects && studio.projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {studio.projects.map((project, index) => (
                      <div
                        key={index}
                        onClick={() => goToGame(project.gameTitle)}
                        className="block group/project bg-gradient-to-br from-[rgba(0,0,0,0.35)] to-[rgba(0,0,0,0.15)] border border-white/10 rounded-2xl p-6 hover:border-cyan-500/40 transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <span className="text-lg font-bold text-cyan-100 group-hover/project:text-white transition-colors">
                            {project.gameTitle}
                          </span>
                          {project.year && (
                            <span className="text-xs font-bold text-cyan-300/50 flex-shrink-0 mt-1">{project.year}</span>
                          )}
                        </div>
                        <div className="mb-3">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                              project.status === 'Released'
                                ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-300 border-green-500/30 border'
                                : project.status === 'In Development'
                                ? 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-blue-300 border-blue-500/30 border'
                                : 'bg-gradient-to-r from-zinc-500/30 to-slate-500/30 text-zinc-300 border-zinc-500/30 border'
                            }`}
                          >
                            {project.status}
                          </span>
                        </div>
                        <p className="text-sm text-cyan-200/60 mb-4">{project.platforms?.join(', ')}</p>
                        <span className="inline-flex items-center gap-2 text-cyan-300 group-hover/project:text-cyan-200 font-semibold text-sm">
                          View Game →
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-cyan-300/70 text-sm">No games listed in portfolio yet.</p>
                )}
              </section>

              {/* Media Gallery */}
              {youtubeId && (
                <section className="bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl shadow-xl p-8 md:p-10 hover:border-cyan-500/30 transition-all">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 bg-gradient-to-b from-red-400 to-orange-400 rounded-full" />
                    <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-red-100 to-orange-200 bg-clip-text">
                      Featured Trailer
                    </h2>
                  </div>
                  <div className="aspect-video rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      title="Trailer"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                </section>
              )}

              {/* Business & Collaboration Section */}
              <section className="bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl shadow-xl p-8 md:p-10 hover:border-cyan-500/30 transition-all">
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-teal-400 rounded-full" />
                  <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-blue-100 to-teal-200 bg-clip-text">
                    Business & Collaboration
                  </h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                    <span className="text-cyan-400 mt-0.5 text-lg leading-none">🤝</span>
                    <div className="min-w-0">
                      <span className="text-cyan-300/70 text-xs block mb-1 uppercase tracking-wide">Publishing Partners</span>
                      <span className="text-cyan-50 font-semibold text-sm leading-relaxed">{studio.publisherPartners || 'Self-Published'}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                    <span className="text-cyan-400 mt-0.5 text-lg leading-none">💰</span>
                    <div className="min-w-0">
                      <span className="text-cyan-300/70 text-xs block mb-1 uppercase tracking-wide">Financing</span>
                      <span className="text-cyan-50 font-semibold text-sm leading-relaxed">{studio.fundingType || 'Private / Self-Funded'}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Recognitions & Press Section */}
              {studio.recognitions && studio.recognitions.length > 0 && (
                <section className="bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl shadow-xl p-8 md:p-10 hover:border-cyan-500/30 transition-all">
                  <div className="flex items-center gap-3 mb-6 flex-wrap">
                    <div className="w-1 h-8 bg-gradient-to-b from-red-400 to-orange-400 rounded-full" />
                    <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-red-100 to-orange-200 bg-clip-text">
                      Recognition / Press
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {studio.recognitions.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 mb-3">
                          {item.type || 'Award'}
                        </span>
                        <p className="text-cyan-100/90 font-semibold leading-relaxed mb-1">{item.title}</p>
                        {item.source && <p className="text-cyan-300/60 text-xs">{item.source}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-8">
              
              {/* Key Facts */}
              <div className="bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl hover:border-cyan-500/30 transition-all">
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full" />
                  <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-100 to-blue-200 bg-clip-text">
                    Key Facts
                  </h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                    <span className="text-cyan-400 mt-0.5 text-lg leading-none">📍</span>
                    <div>
                      <span className="text-cyan-300/70 text-xs block mb-1 uppercase tracking-wide">Headquarters</span>
                      <span className="text-cyan-50 font-semibold text-sm">{studio.city ? `${studio.city}, ` : ''}{studio.headquartersCountry || 'Global'}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                    <span className="text-cyan-400 mt-0.5 text-lg leading-none">📅</span>
                    <div>
                      <span className="text-cyan-300/70 text-xs block mb-1 uppercase tracking-wide">Founded</span>
                      <span className="text-cyan-50 font-semibold text-sm">{studio.foundedYear || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                    <span className="text-cyan-400 mt-0.5 text-lg leading-none">🎮</span>
                    <div>
                      <span className="text-cyan-300/70 text-xs block mb-1 uppercase tracking-wide">Type</span>
                      <span className="text-cyan-50 font-semibold text-sm">{studio.studioType || 'Game Studio'}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                    <span className="text-cyan-400 mt-0.5 text-lg leading-none">⚙️</span>
                    <div>
                      <span className="text-cyan-300/70 text-xs block mb-1 uppercase tracking-wide">Engine</span>
                      <span className="text-cyan-50 font-semibold text-sm">{studio.gameEngines?.join(', ') || 'Custom Engine'}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                    <span className="text-cyan-400 mt-0.5 text-lg leading-none">📈</span>
                    <div>
                      <span className="text-cyan-300/70 text-xs block mb-1 uppercase tracking-wide">Titles Portfolio</span>
                      <span className="text-cyan-50 font-semibold text-sm">{studio.projects?.length || 0} titles listed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Workforce */}
              <div className="bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl hover:border-cyan-500/30 transition-all">
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  <div className="w-1 h-8 bg-gradient-to-b from-amber-400 to-orange-400 rounded-full" />
                  <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-amber-100 to-orange-200 bg-clip-text">
                    Workforce
                  </h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                    <span className="text-cyan-400 mt-0.5 text-lg leading-none">👥</span>
                    <div>
                      <span className="text-cyan-300/70 text-xs block mb-1 uppercase tracking-wide">Team Size</span>
                      <span className="text-cyan-50 font-semibold text-sm">{studio.workforce?.headcount || studio.teamSize || 'N/A'}</span>
                    </div>
                  </div>
                  {studio.workforce?.composition && (
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                      <span className="text-cyan-400 mt-0.5 text-lg leading-none">🌍</span>
                      <div>
                        <span className="text-cyan-300/70 text-xs block mb-1 uppercase tracking-wide">Composition</span>
                        <span className="text-cyan-50 font-semibold text-sm">{studio.workforce.composition}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* What Changed Timeline */}
              {studio.whatChanged && studio.whatChanged.length > 0 && (
                <div className="bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl hover:border-cyan-500/30 transition-all">
                  <div className="flex items-center gap-3 mb-6 flex-wrap">
                    <div className="w-1 h-8 bg-gradient-to-b from-amber-400 to-orange-400 rounded-full" />
                    <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-amber-100 to-orange-200 bg-clip-text">
                      What Changed
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {studio.whatChanged.map((event, idx) => (
                      <div key={idx} className="flex gap-3 p-3 rounded-xl bg-white/5">
                        <div className="flex flex-col items-center flex-shrink-0 pt-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                        </div>
                        <div>
                          <span className="text-cyan-300/70 text-xs font-bold uppercase tracking-wide block mb-1">
                            {event.date}
                          </span>
                          <p className="text-sm text-cyan-100/90 leading-relaxed">{event.event}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Platforms & Distribution */}
              <div className="bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl hover:border-cyan-500/30 transition-all">
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  <div className="w-1 h-8 bg-gradient-to-b from-violet-400 to-fuchsia-400 rounded-full" />
                  <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-violet-100 to-fuchsia-200 bg-clip-text">
                    Platforms & Distribution
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(studio.supportedPlatforms?.length ? studio.supportedPlatforms : ['PC', 'PlayStation', 'Xbox']).map((p, idx) => (
                    <span key={idx} className="px-3 py-1 bg-cyan-500/10 text-cyan-300 rounded-lg text-xs font-semibold border border-cyan-500/20">
                      {p}
                    </span>
                  ))}
                </div>
                {studio.distributionChannels && studio.distributionChannels.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {studio.distributionChannels.map((d, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-500/10 text-blue-300 rounded-lg text-xs font-semibold border border-blue-500/20">
                        {d}
                      </span>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </main>
      </div>
    </>
  );
}
