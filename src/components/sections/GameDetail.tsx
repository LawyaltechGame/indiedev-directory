import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { databases, Query } from '../../config/appwrite';
import { getStudioImageUrl } from '../../services/studioImages';
import { generateSlug, generateSimpleSlug } from '../../utils/slug';
import { SEOHead } from '../seo/SEOHead';

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
  keyFeatures?: Array<{
    feature: string;
    description: string;
  }>;
  recognitions?: Array<{
    type: string;
    title: string;
    source?: string;
  }>;
  logoImageId?: string;
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

        if (!DB_ID || !GAMES_TABLE_ID) {
          throw new Error('Database configuration missing');
        }

        // Fetch game - check if ID looks like a slug (contains hyphens) or is a document ID
        let response;
        const decodedId = decodeURIComponent(id);
        const isSlug = decodedId.includes('-') && decodedId.length > 10; // Slugs are longer and contain hyphens
        
        if (isSlug) {
          // If it looks like a slug, search by name/slug directly
          const allGames = await databases.listDocuments(DB_ID, GAMES_TABLE_ID, [
            Query.equal('status', 'approved'),
          ]);
          const foundGame = allGames.documents.find((doc: any) => {
            try {
              const gameData = typeof doc.gameData === 'string' 
                ? JSON.parse(doc.gameData) 
                : doc.gameData;
              const gameName = gameData?.name || '';
              const searchSlug = decodedId.toLowerCase();
              
              // Handle special cases FIRST - use exact name matching to avoid conflicts
              if (searchSlug === 'owl-observatory') {
                return gameName === 'Owl Observatory';
              }
              
              if (searchSlug === 'dinner-with-an-owl-dessert-edition') {
                return gameName === 'Dinner with an Owl - "Dessert Edition"';
              }
              
              // Generate slugs using utility functions
              const gameSlug = generateSlug(gameName);
              const simpleSlug = generateSimpleSlug(gameName);
              
              // Exact slug match (most reliable)
              if (gameSlug === searchSlug || simpleSlug === searchSlug) {
                return true;
              }
              
              // Exact name match
              if (gameName.toLowerCase() === searchSlug) {
                return true;
              }
              
              return false;
            } catch {
              return false;
            }
          });
          if (foundGame) {
            response = foundGame;
          } else {
            throw new Error(`Game not found: ${decodedId}`);
          }
        } else {
          // Try to fetch by document ID first
          try {
            response = await databases.getDocument(DB_ID, GAMES_TABLE_ID, id);
          } catch (docError: any) {
            // If document not found by ID, try to find by name
            if (docError?.code === 404) {
              const allGames = await databases.listDocuments(DB_ID, GAMES_TABLE_ID, [
                Query.equal('status', 'approved'),
              ]);
              const foundGame = allGames.documents.find((doc: any) => {
                try {
                  const gameData = typeof doc.gameData === 'string' 
                    ? JSON.parse(doc.gameData) 
                    : doc.gameData;
                  const gameName = gameData?.name || '';
                  const searchSlug = decodedId.toLowerCase();
                  
                  // Document ID match
                  if (doc.$id === id) {
                    return true;
                  }
                  
                  // Handle special cases FIRST - use exact name matching to avoid conflicts
                  if (searchSlug === 'owl-observatory') {
                    return gameName === 'Owl Observatory';
                  }
                  
                  if (searchSlug === 'dinner-with-an-owl-dessert-edition') {
                    return gameName === 'Dinner with an Owl - "Dessert Edition"';
                  }
                  
                  // Generate slugs using utility functions
                  const gameSlug = generateSlug(gameName);
                  const simpleSlug = generateSimpleSlug(gameName);
                  
                  // Exact slug match (most reliable)
                  if (gameSlug === decodedId || gameSlug === id.toLowerCase() ||
                      simpleSlug === decodedId || simpleSlug === id.toLowerCase()) {
                    return true;
                  }
                  
                  // Exact name match
                  if (gameData?.name === decodedId || gameName.toLowerCase() === decodedId.toLowerCase()) {
                    return true;
                  }
                  
                  return false;
                } catch {
                  return false;
                }
              });
              if (foundGame) {
                response = foundGame;
              } else {
                throw docError;
              }
            } else {
              throw docError;
            }
          }
        }
        
        // Parse game data
        const gameData = typeof response.gameData === 'string' 
          ? JSON.parse(response.gameData) 
          : response.gameData;
        
        const gameDetail: GameDetailData = {
          name: gameData?.name || 'Unknown Game',
          developedBy: gameData?.developedBy || '',
          publisher: gameData?.publisher || '',
          status: gameData?.status || '',
          releaseDate: gameData?.releaseDate || '',
          platforms: gameData?.platforms || [],
          engine: gameData?.engine,
          genre: gameData?.genre || '',
          monetization: gameData?.monetization || '',
          description: gameData?.description || '',
          keyFeatures: gameData?.keyFeatures || [],
          recognitions: gameData?.recognitions || [],
          logoImageId: gameData?.logoImageId,
        };
        
        setGame(gameDetail);
        setLoading(false);
      } catch (err: any) {
        console.error('Error loading game:', err);
        setError(err.message || 'Failed to load game');
        setLoading(false);
      }
    };

    loadGame();
  }, [id]);

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

  if (error || !game) {
    return (
      <div className="min-h-screen bg-bg text-white pt-28 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-8 group flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition-all duration-300 hover:gap-3"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
            <span>Back</span>
          </button>
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
            <p className="text-red-300 text-lg">{error || 'Game not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${game.name} - ${game.genre} Game | Game Centralen`}
        description={game.description || `Learn more about ${game.name}, ${game.developedBy ? `developed by ${game.developedBy}` : 'an indie game'}.`}
        canonicalUrl={`https://gamecentralen.com/game/${id}`}
        ogImage={game.logoImageId ? getStudioImageUrl(game.logoImageId) : undefined}
      />
      <div className="min-h-screen bg-bg text-white pt-28 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 group flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition-all duration-300 hover:gap-3"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
          <span>Back</span>
        </button>

        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-[rgba(20,28,42,0.8)] via-[rgba(20,28,42,0.6)] to-[rgba(20,28,42,0.8)] border border-white/10 rounded-3xl overflow-hidden mb-12 shadow-2xl shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-500 group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Game Logo */}
              {game.logoImageId ? (
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0 border-2 border-cyan-500/30 p-3 shadow-lg shadow-cyan-500/20 group/logo hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300" />
                  <img
                    src={getStudioImageUrl(game.logoImageId)}
                    alt={`${game.name} logo`}
                    className="relative w-full h-full object-contain z-10"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const parent = target.parentElement;
                      if (parent) {
                        parent.className = 'w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center text-[#001018] text-4xl md:text-5xl font-black flex-shrink-0 shadow-lg';
                        parent.innerHTML = `<span>${game.name.charAt(0)}</span>`;
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-400 to-teal-400 flex items-center justify-center text-[#001018] text-4xl md:text-5xl font-black flex-shrink-0 shadow-lg shadow-cyan-500/30 hover:scale-105 transition-transform duration-300">
                  {game.name.charAt(0)}
                </div>
              )}

              {/* Game Details */}
              <div className="flex-1">
                <h1 className="text-5xl md:text-6xl font-black mb-3 bg-gradient-to-r from-cyan-100 via-cyan-300 to-blue-300 bg-clip-text text-transparent animate-fade-in">
                  {game.name}
                </h1>
                <div className="flex flex-wrap gap-4 mb-6">
                  {game.status && (
                    <span className={`inline-flex px-4 py-2 rounded-xl text-sm font-bold ${
                      game.status === 'Released' 
                        ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-300 border border-green-500/30' 
                        : 'bg-gradient-to-r from-yellow-500/30 to-amber-500/30 text-yellow-300 border border-yellow-500/30'
                    }`}>
                      {game.status}
                    </span>
                  )}
                  {game.genre && (
                    <span className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-xl text-sm font-semibold border border-cyan-500/30">
                      {game.genre}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {game.description && (
              <div className="group bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl p-8 md:p-10 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 hover:border-cyan-500/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full" />
                  <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-100 to-blue-200 bg-clip-text">Description</h2>
                </div>
                <p className="text-cyan-200/90 leading-relaxed text-lg">{game.description}</p>
              </div>
            )}

            {/* Key Features */}
            {game.keyFeatures && game.keyFeatures.length > 0 && (
              <div className="group bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl p-8 md:p-10 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full" />
                  <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-100 to-blue-200 bg-clip-text">Key Features</h2>
                </div>
                <div className="space-y-6">
                  {game.keyFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className="group/feature p-6 rounded-2xl bg-gradient-to-br from-[rgba(0,0,0,0.3)] to-[rgba(0,0,0,0.1)] border border-white/10 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1"
                    >
                      <h3 className="text-xl font-bold text-cyan-100 mb-2 group-hover/feature:text-white transition-colors">
                        {feature.feature}
                      </h3>
                      <p className="text-cyan-200/80 leading-relaxed">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recognition / Press */}
            {game.recognitions && game.recognitions.length > 0 && (
              <div className="group bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl p-8 md:p-10 shadow-xl hover:shadow-2xl hover:shadow-yellow-500/10 transition-all duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-orange-400 rounded-full" />
                  <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-yellow-100 to-orange-200 bg-clip-text">Recognition / Press</h2>
                </div>
                <div className="space-y-6">
                  {game.recognitions.map((recognition, index) => (
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
                        {recognition.source && (
                          <a
                            href={recognition.source.startsWith('http') ? recognition.source : `https://${recognition.source}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-cyan-300/70 hover:text-cyan-200 transition-colors flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            {recognition.source.replace(/^https?:\/\//, '')}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Game Info */}
            <div className="group bg-gradient-to-br from-[rgba(20,28,42,0.7)] to-[rgba(20,28,42,0.5)] border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 hover:border-cyan-500/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full" />
                <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-cyan-100 to-blue-200 bg-clip-text">Game Info</h2>
              </div>
              <div className="space-y-4">
                {game.developedBy && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group/item">
                    <span className="text-cyan-400">🎮</span>
                    <div className="flex-1">
                      <span className="text-cyan-300/70 text-xs block mb-1">Developed By</span>
                      <span className="text-cyan-100 font-semibold">{game.developedBy}</span>
                    </div>
                  </div>
                )}
                {game.publisher && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group/item">
                    <span className="text-blue-400">📦</span>
                    <div className="flex-1">
                      <span className="text-cyan-300/70 text-xs block mb-1">Publisher</span>
                      <span className="text-cyan-100 font-semibold">{game.publisher}</span>
                    </div>
                  </div>
                )}
                {game.releaseDate && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group/item">
                    <span className="text-yellow-400">📅</span>
                    <div className="flex-1">
                      <span className="text-cyan-300/70 text-xs block mb-1">Release Date</span>
                      <span className="text-cyan-100 font-semibold">{game.releaseDate}</span>
                    </div>
                  </div>
                )}
                {game.platforms && game.platforms.length > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group/item">
                    <span className="text-indigo-400 mt-1">💻</span>
                    <div className="flex-1">
                      <span className="text-cyan-300/70 text-xs block mb-2">Platforms</span>
                      <div className="flex flex-wrap gap-2">
                        {game.platforms.map((platform, idx) => (
                          <span key={idx} className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-lg text-xs font-semibold border border-cyan-500/30">
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {game.engine && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group/item">
                    <span className="text-orange-400">⚙️</span>
                    <div className="flex-1">
                      <span className="text-cyan-300/70 text-xs block mb-1">Engine</span>
                      <span className="text-cyan-100 font-semibold">{game.engine}</span>
                    </div>
                  </div>
                )}
                {game.monetization && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group/item">
                    <span className="text-green-400">💰</span>
                    <div className="flex-1">
                      <span className="text-cyan-300/70 text-xs block mb-1">Monetization</span>
                      <span className="text-cyan-100 font-semibold">{game.monetization}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

