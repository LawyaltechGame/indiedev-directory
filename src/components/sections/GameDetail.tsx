import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { databases, Query } from '../../config/appwrite';
import { getStudioImageUrl } from '../../services/studioImages';
import { generateSlug, generateSimpleSlug } from '../../utils/slug';
import { SEOHead } from '../seo/SEOHead';

interface KeyFeature {
  feature: string;
  description: string;
}

interface Recognition {
  type?: string;
  title: string;
  source?: string;
  link?: string;
}

interface WhereToPlay {
  name: string;
  url: string;
}

interface GameDetailData {
  name: string;
  developedBy: string;
  publisher: string;
  status: string;
  releaseDate: string;
  platforms: string[];
  engine?: string;
  genre: string;
  monetization: string;
  description: string;
  metacritic?: string | number;
  verificationDate?: string;
  keyFeatures?: KeyFeature[];
  recognitions?: Recognition[];
  whereToPlay?: WhereToPlay[];
  tags?: string[];
  logoImageId?: string;
  trailerVideoUrl?: string;
  gameplayVideoUrl?: string;
  // Associated Studio details
  studioSlug?: string;
  studioLocation?: string;
  studioRegistrationId?: string;
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<GameDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGame = async () => {
      if (!id) {
        setError('Game ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID as string;
        const GAMES_TABLE_ID = import.meta.env.VITE_APPWRITE_GAMES_TABLE_ID as string;
        const PROFILE_TABLE_ID = import.meta.env.VITE_APPWRITE_PROFILE_TABLE_ID as string;

        if (!DB_ID || !GAMES_TABLE_ID) {
          throw new Error('Database configuration missing');
        }

        let gameDoc: any = null;
        const decodedId = decodeURIComponent(id);
        const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
        const searchNormalized = normalize(decodedId);

        // Fetch up to 500 games to avoid Appwrite default limit of 25
        const allGames = await databases.listDocuments(DB_ID, GAMES_TABLE_ID, [
          Query.equal('status', 'approved'),
          Query.limit(500),
        ]);

        gameDoc = allGames.documents.find((doc: any) => {
          try {
            const gameData = typeof doc.gameData === 'string' 
              ? JSON.parse(doc.gameData) 
              : doc.gameData;
            const gameName = gameData?.name || '';
            
            // Check normalized match, slug match, simple slug match, or exact name match
            if (
              normalize(gameName) === searchNormalized ||
              generateSlug(gameName) === decodedId.toLowerCase() ||
              generateSimpleSlug(gameName) === decodedId.toLowerCase() ||
              doc.$id === id
            ) {
              return true;
            }
            return false;
          } catch {
            return false;
          }
        });

        if (!gameDoc) {
          try {
            gameDoc = await databases.getDocument(DB_ID, GAMES_TABLE_ID, id);
          } catch {
            // fallback
          }
        }

        if (!gameDoc) {
          throw new Error('Game not found');
        }

        const rawData = typeof gameDoc.gameData === 'string'
          ? JSON.parse(gameDoc.gameData)
          : gameDoc.gameData;

        // Optionally fetch studio document for associated metadata
        let studioSlug = '';
        let studioLocation = rawData.studioLocation || '';
        let studioRegistrationId = rawData.registrationId || '';

        if (rawData.developedBy && PROFILE_TABLE_ID) {
          studioSlug = generateSlug(rawData.developedBy);
          try {
            const profilesRes = await databases.listDocuments(DB_ID, PROFILE_TABLE_ID, [
              Query.equal('status', 'approved'),
              Query.limit(500),
            ]);
            const studioDoc = profilesRes.documents.find((d: any) => {
              try {
                const sData = typeof d.profileData === 'string' ? JSON.parse(d.profileData) : d.profileData;
                return sData?.name?.toLowerCase() === rawData.developedBy.toLowerCase();
              } catch { return false; }
            });

            if (studioDoc) {
              const sData = typeof studioDoc.profileData === 'string' ? JSON.parse(studioDoc.profileData) : studioDoc.profileData;
              if (sData.city && sData.headquartersCountry) {
                studioLocation = `${sData.city}, ${sData.headquartersCountry}`;
              } else if (sData.location) {
                studioLocation = sData.location;
              }
              if (sData.registrationId) studioRegistrationId = sData.registrationId;
            }
          } catch (e) {
            console.warn('Could not fetch studio metadata:', e);
          }
        }

        // Build fallback tags if not provided
        let tags: string[] = rawData.tags || [];
        if (!tags || tags.length === 0) {
          const autoTags: string[] = [];
          if (rawData.genre) {
            rawData.genre.split(/[\/,]/).forEach((t: string) => {
              const trimmed = t.trim();
              if (trimmed && !autoTags.includes(trimmed)) autoTags.push(trimmed);
            });
          }
          if (rawData.publisher && rawData.developedBy && rawData.publisher.toLowerCase().includes(rawData.developedBy.toLowerCase())) {
            autoTags.push('Self-Published');
          }
          if (autoTags.length > 0) tags = autoTags;
        }

        // Build fallback whereToPlay if storeLinks provided
        let whereToPlay: WhereToPlay[] = rawData.whereToPlay || [];
        if ((!whereToPlay || whereToPlay.length === 0) && rawData.storeLinks) {
          whereToPlay = rawData.storeLinks.map((url: string) => {
            let label = 'Store Page';
            if (url.includes('steampowered.com')) label = 'Steam';
            else if (url.includes('epicgames.com')) label = 'Epic Games Store';
            else if (url.includes('playstation.com')) label = 'PlayStation Store';
            else if (url.includes('xbox.com') || url.includes('microsoft.com')) label = 'Xbox Store';
            else if (url.includes('nintendo.com')) label = 'Nintendo eShop';
            else if (url.includes('gog.com')) label = 'GOG';
            return { name: label, url };
          });
        }

        const parsedGame: GameDetailData = {
          name: rawData.name || 'Untitled Game',
          developedBy: rawData.developedBy || 'Independent Developer',
          publisher: rawData.publisher || rawData.developedBy || 'Self-Published',
          status: rawData.status || 'Released',
          releaseDate: rawData.releaseDate || 'TBA',
          platforms: rawData.platforms || ['PC'],
          engine: rawData.engine || '',
          genre: rawData.genre || 'Action',
          monetization: rawData.monetization || 'Paid Game',
          description: rawData.description || '',
          metacritic: rawData.metacritic || '',
          verificationDate: rawData.verificationDate || 'Verified August 2026',
          keyFeatures: rawData.keyFeatures || [],
          recognitions: rawData.recognitions || [],
          whereToPlay,
          tags,
          logoImageId: rawData.logoImageId || '',
          trailerVideoUrl: rawData.trailerVideoUrl || '',
          gameplayVideoUrl: rawData.gameplayVideoUrl || '',
          studioSlug: studioSlug || (rawData.developedBy ? generateSlug(rawData.developedBy) : ''),
          studioLocation,
          studioRegistrationId,
        };

        setGame(parsedGame);
      } catch (err: any) {
        console.error('Error loading game:', err);
        setError(err.message || 'Failed to load game');
      } finally {
        setLoading(false);
      }
    };

    loadGame();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070a] text-white pt-28 pb-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto" />
          <p className="text-cyan-300/80 font-medium">Loading game details...</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-[#05070a] text-white pt-28 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-8 flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition-colors"
          >
            <span>← Back</span>
          </button>
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
            <p className="text-red-300 text-lg">{error || 'Game not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const trailerYoutubeId = game.trailerVideoUrl ? extractYouTubeId(game.trailerVideoUrl) : null;
  const releaseYear = game.releaseDate ? game.releaseDate.match(/\b(19|20)\d{2}\b/)?.[0] || game.releaseDate : '';

  return (
    <>
      <SEOHead
        title={`${game.name} — ${game.genre} | Game Centralen`}
        description={game.description || `Explore ${game.name} by ${game.developedBy} on Game Centralen.`}
        canonicalUrl={`https://gamecentralen.com/game/${id}`}
        ogImage={game.logoImageId ? getStudioImageUrl(game.logoImageId) : undefined}
      />

      <div className="min-h-screen bg-[#05070a] text-white font-sans antialiased relative selection:bg-cyan-500/30">
        {/* Background Radial Glow */}
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-60"
          style={{
            background:
              'radial-gradient(900px 500px at 15% -5%, rgba(34,211,238,.10), transparent 60%), radial-gradient(800px 500px at 90% 0%, rgba(59,130,246,.10), transparent 60%)',
          }}
        />

        <main className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6 pt-28 pb-20">
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl shadow-xl transition-all duration-500 hover:border-cyan-500/30 mb-8 animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />
            <div className="relative p-8 md:p-12">
              {/* Back Button Link */}
              <Link
                to={game.studioSlug ? `/studio/${game.studioSlug}` : '#'}
                onClick={(e) => {
                  if (!game.studioSlug) {
                    e.preventDefault();
                    navigate(-1);
                  }
                }}
                className="inline-flex items-center gap-2 text-cyan-300/70 hover:text-cyan-300 text-sm font-semibold mb-8 transition-colors"
              >
                ← Back to {game.developedBy}
              </Link>

              {/* Status & Genre Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-bold shadow-lg border ${
                    game.status === 'Released'
                      ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-300 border-green-500/30'
                      : 'bg-gradient-to-r from-yellow-500/30 to-amber-500/30 text-yellow-300 border-yellow-500/30'
                  }`}
                >
                  {game.status}
                </span>
                {game.genre && (
                  <span className="px-3 py-1 bg-cyan-500/10 text-cyan-300 rounded-lg text-xs font-semibold border border-cyan-500/20">
                    {game.genre}
                  </span>
                )}
              </div>

              {/* Title & Studio Subtitle */}
              <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-cyan-100 via-cyan-300 to-blue-300 bg-clip-text text-transparent mb-4 tracking-tight">
                {game.name}
              </h1>

              <p className="text-lg text-cyan-200/80 font-medium">
                by{' '}
                <Link
                  to={game.studioSlug ? `/studio/${game.studioSlug}` : '#'}
                  className="text-cyan-300 hover:text-cyan-200 font-bold underline decoration-cyan-500/40 underline-offset-4 transition-colors"
                >
                  {game.developedBy}
                </Link>
                {releaseYear ? ` · ${releaseYear}` : ''}
              </p>
            </div>
          </section>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (Main Content) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description Section */}
              {game.description && (
                <section className="bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl shadow-xl transition-all duration-500 p-8 md:p-10 hover:border-cyan-500/30">
                  <div className="flex items-center gap-3 mb-6 flex-wrap">
                    <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full" />
                    <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-100 to-blue-200 bg-clip-text">
                      Description
                    </h2>
                    {game.verificationDate && (
                      <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-cyan-300/40 whitespace-nowrap">
                        {game.verificationDate}
                      </span>
                    )}
                  </div>
                  <p className="text-cyan-200/90 leading-relaxed text-lg whitespace-pre-line">
                    {game.description}
                  </p>
                </section>
              )}

              {/* Trailer Video Section */}
              {trailerYoutubeId && (
                <section className="bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl shadow-xl transition-all duration-500 p-8 md:p-10 hover:border-red-500/30">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 bg-gradient-to-b from-red-400 to-orange-400 rounded-full" />
                    <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-red-100 to-orange-200 bg-clip-text">
                      Trailer
                    </h2>
                  </div>
                  <div className="aspect-video rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${trailerYoutubeId}`}
                      title={`${game.name} Trailer`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                </section>
              )}

              {/* Key Features Section */}
              {game.keyFeatures && game.keyFeatures.length > 0 && (
                <section className="bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl shadow-xl transition-all duration-500 p-8 md:p-10 hover:border-cyan-500/30">
                  <div className="flex items-center gap-3 mb-6 flex-wrap">
                    <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-teal-400 rounded-full" />
                    <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-blue-100 to-teal-200 bg-clip-text">
                      Key Features
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {game.keyFeatures.map((feat, index) => (
                      <div
                        key={index}
                        className="p-5 rounded-2xl bg-gradient-to-br from-[rgba(0,0,0,0.3)] to-[rgba(0,0,0,0.1)] border border-white/10 hover:border-cyan-500/30 transition-all duration-300"
                      >
                        <h3 className="text-lg font-bold text-cyan-100 mb-2">{feat.feature}</h3>
                        <p className="text-cyan-200/75 text-sm leading-relaxed">{feat.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Recognition / Press Section */}
              {game.recognitions && game.recognitions.length > 0 && (
                <section className="bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl shadow-xl transition-all duration-500 p-8 md:p-10 hover:border-cyan-500/30">
                  <div className="flex items-center gap-3 mb-6 flex-wrap">
                    <div className="w-1 h-8 bg-gradient-to-b from-red-400 to-orange-400 rounded-full" />
                    <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-red-100 to-orange-200 bg-clip-text">
                      Recognition / Press
                    </h2>
                    {game.verificationDate && (
                      <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-cyan-300/40 whitespace-nowrap">
                        {game.verificationDate}
                      </span>
                    )}
                  </div>
                  <div className="space-y-4">
                    {game.recognitions.map((item, index) => {
                      const linkUrl = item.link || (item.source && item.source.startsWith('http') ? item.source : item.source ? `https://${item.source}` : '');
                      return (
                        <div key={index} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/25 mb-3">
                            {item.type || 'Award'}
                          </span>
                          <p className="text-cyan-100/90 leading-relaxed mb-2">{item.title}</p>
                          {linkUrl && (
                            <a
                              href={linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold break-all inline-flex items-center gap-1 transition-colors"
                            >
                              {linkUrl.replace(/^https?:\/\//, '')} ↗
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column (Sidebar) */}
            <div className="lg:col-span-1 space-y-8">
              {/* Game Info Section */}
              <section className="bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl shadow-xl transition-all duration-500 p-6 md:p-8 hover:border-cyan-500/30">
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full" />
                  <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-100 to-blue-200 bg-clip-text">
                    Game Info
                  </h2>
                  {game.verificationDate && (
                    <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-cyan-300/40 whitespace-nowrap">
                      {game.verificationDate}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <span className="text-cyan-400 mt-0.5 text-lg leading-none">🎮</span>
                    <div className="min-w-0">
                      <span className="text-cyan-300/70 text-xs block mb-1 uppercase tracking-wide">
                        Developed By
                      </span>
                      <span className="text-cyan-50 font-semibold text-sm leading-relaxed">
                        {game.developedBy}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <span className="text-cyan-400 mt-0.5 text-lg leading-none">📦</span>
                    <div className="min-w-0">
                      <span className="text-cyan-300/70 text-xs block mb-1 uppercase tracking-wide">
                        Publisher
                      </span>
                      <span className="text-cyan-50 font-semibold text-sm leading-relaxed">
                        {game.publisher}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <span className="text-cyan-400 mt-0.5 text-lg leading-none">📅</span>
                    <div className="min-w-0">
                      <span className="text-cyan-300/70 text-xs block mb-1 uppercase tracking-wide">
                        Release Date
                      </span>
                      <span className="text-cyan-50 font-semibold text-sm leading-relaxed">
                        {game.releaseDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <span className="text-cyan-400 mt-0.5 text-lg leading-none">💻</span>
                    <div className="min-w-0">
                      <span className="text-cyan-300/70 text-xs block mb-1 uppercase tracking-wide">
                        Platforms
                      </span>
                      <span className="text-cyan-50 font-semibold text-sm leading-relaxed">
                        {Array.isArray(game.platforms) ? game.platforms.join(', ') : game.platforms}
                      </span>
                    </div>
                  </div>

                  {game.engine && (
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                      <span className="text-cyan-400 mt-0.5 text-lg leading-none">⚙️</span>
                      <div className="min-w-0">
                        <span className="text-cyan-300/70 text-xs block mb-1 uppercase tracking-wide">
                          Engine
                        </span>
                        <span className="text-cyan-50 font-semibold text-sm leading-relaxed">
                          {game.engine}
                        </span>
                      </div>
                    </div>
                  )}

                  {game.monetization && (
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                      <span className="text-cyan-400 mt-0.5 text-lg leading-none">💰</span>
                      <div className="min-w-0">
                        <span className="text-cyan-300/70 text-xs block mb-1 uppercase tracking-wide">
                          Monetization
                        </span>
                        <span className="text-cyan-50 font-semibold text-sm leading-relaxed">
                          {game.monetization}
                        </span>
                      </div>
                    </div>
                  )}

                  {game.metacritic && (
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                      <span className="text-cyan-400 mt-0.5 text-lg leading-none">⭐</span>
                      <div className="min-w-0">
                        <span className="text-cyan-300/70 text-xs block mb-1 uppercase tracking-wide">
                          Metacritic
                        </span>
                        <span className="text-cyan-50 font-semibold text-sm leading-relaxed">
                          {game.metacritic}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Performance Section (Premium Locked Card) */}
              <section className="bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl shadow-xl transition-all duration-500 p-6 md:p-8 hover:border-cyan-500/30 relative">
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-emerald-400 rounded-full" />
                  <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-green-100 to-emerald-200 bg-clip-text">
                    Performance
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/15 text-amber-300 border border-amber-400/30">
                    🔒 Premium
                  </span>
                </div>

                <div className="relative">
                  {/* Blurred Background Mock Data */}
                  <div className="filter blur-md select-none pointer-events-none space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                      <span className="text-cyan-400 text-lg">📊</span>
                      <div>
                        <span className="text-cyan-300/70 text-xs block uppercase">Performance data</span>
                        <span className="text-cyan-50 font-semibold text-sm">Not tracked</span>
                      </div>
                    </div>
                  </div>

                  {/* Lock Overlay Modal */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-6 py-7 rounded-2xl bg-[rgba(9,14,22,0.92)] border border-amber-400/25 shadow-2xl max-w-md">
                      <div className="text-3xl mb-3">🔒</div>
                      <h3 className="text-lg font-bold text-amber-200 mb-2">Premium field</h3>
                      <p className="text-sm text-cyan-200/70 mb-5 leading-relaxed">
                        Unit and revenue estimates, review-count trajectory and concurrent-player history for this title.
                      </p>
                      <button
                        onClick={() => navigate('/login')}
                        className="inline-flex px-5 py-2.5 rounded-xl font-bold text-sm text-[#05070a] bg-gradient-to-r from-amber-300 to-orange-300 hover:from-amber-200 hover:to-orange-200 transition-colors"
                      >
                        Unlock with Premium
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Where to Play Section */}
              {game.whereToPlay && game.whereToPlay.length > 0 && (
                <section className="bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl shadow-xl transition-all duration-500 p-6 md:p-8 hover:border-cyan-500/30">
                  <div className="flex items-center gap-3 mb-6 flex-wrap">
                    <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-emerald-400 rounded-full" />
                    <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-green-100 to-emerald-200 bg-clip-text">
                      Where to Play
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {game.whereToPlay.map((store, index) => (
                      <a
                        key={index}
                        href={store.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-100 font-bold text-sm hover:border-cyan-400/60 transition-colors"
                      >
                        {store.name} ↗
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {/* Tags Section */}
              {game.tags && game.tags.length > 0 && (
                <section className="bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl shadow-xl transition-all duration-500 p-6 md:p-8 hover:border-cyan-500/30">
                  <div className="flex items-center gap-3 mb-6 flex-wrap">
                    <div className="w-1 h-8 bg-gradient-to-b from-violet-400 to-fuchsia-400 rounded-full" />
                    <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-violet-100 to-fuchsia-200 bg-clip-text">
                      Tags
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {game.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-cyan-500/10 text-cyan-300 rounded-lg text-xs font-semibold border border-cyan-500/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Studio Sidebar Widget */}
              {game.developedBy && (
                <section className="bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl shadow-xl transition-all duration-500 p-6 md:p-8 hover:border-cyan-500/30">
                  <div className="flex items-center gap-3 mb-6 flex-wrap">
                    <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-teal-400 rounded-full" />
                    <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-blue-100 to-teal-200 bg-clip-text">
                      Studio
                    </h2>
                  </div>

                  <Link
                    to={game.studioSlug ? `/studio/${game.studioSlug}` : '#'}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 transition-colors group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <span className="text-lg font-black text-transparent bg-gradient-to-br from-cyan-100 to-blue-300 bg-clip-text">
                        {game.developedBy.substring(0, 3).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="block font-bold text-cyan-100 group-hover:text-cyan-300 transition-colors">
                        {game.developedBy}
                      </span>
                      {(game.studioLocation || game.studioRegistrationId) && (
                        <span className="block text-xs text-cyan-300/60 truncate mt-0.5">
                          {[game.studioLocation, game.studioRegistrationId].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </div>
                  </Link>
                </section>
              )}
            </div>
          </div>
        </main>

        <footer className="relative z-10 border-t border-white/10 mt-8">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10 text-sm text-cyan-200/50 flex flex-col md:flex-row gap-3 justify-between">
            <span>Game Centralen — studio &amp; game directory</span>
            <span>Verified game metrics &amp; portfolio records. Per-section verification dates shown.</span>
          </div>
        </footer>
      </div>
    </>
  );
}
