import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchGamesByTime,
  getPlatformIcon,
  formatReleaseDate,
  type FreeGame,
  type TimeFilter,
  type PlatformFilter,
} from '../../services/freeGames';

export function FreeGamesHub() {
  const navigate = useNavigate();
  const [games, setGames] = useState<FreeGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('weekly');
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('steam');
  const [expandedGameId, setExpandedGameId] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    loadGames();
  }, [timeFilter, platformFilter]);

  const loadGames = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchGamesByTime(timeFilter, platformFilter);
      setGames(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load free games');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-white pt-28 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/')}
            className="mb-6 flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition-colors duration-200"
          >
            <span>←</span> Back to Home
          </button>

          <h1 className="text-5xl font-black mb-4 bg-linear-to-r from-cyan-100 to-cyan-300 bg-clip-text text-transparent">
            Free Paid Games (Limited Time)
          </h1>
          <p className="text-xl text-cyan-200/80 mb-8">
            Discover temporarily free games - normally paid games that are free for a limited time!
          </p>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Time Filter */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setTimeFilter('weekly')}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  timeFilter === 'weekly'
                    ? 'bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] shadow-[0_8px_22px_rgba(34,211,238,0.35)]'
                    : 'bg-[rgba(20,28,42,0.6)] border border-white/8 text-cyan-100 hover:bg-[rgba(0,229,255,0.12)] hover:border-cyan-400/40'
                }`}
              >
                Weekly
              </button>

              <button
                onClick={() => setTimeFilter('monthly')}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  timeFilter === 'monthly'
                    ? 'bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] shadow-[0_8px_22px_rgba(34,211,238,0.35)]'
                    : 'bg-[rgba(20,28,42,0.6)] border border-white/8 text-cyan-100 hover:bg-[rgba(0,229,255,0.12)] hover:border-cyan-400/40'
                }`}
              >
                Monthly
              </button>
            </div>

            {/* Platform Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setPlatformFilter('all')}
                className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 text-sm ${
                  platformFilter === 'all'
                    ? 'bg-linear-to-b from-purple-500 to-purple-300 text-[#001018] shadow-[0_8px_22px_rgba(168,85,247,0.35)]'
                    : 'bg-[rgba(20,28,42,0.6)] border border-white/8 text-cyan-100 hover:bg-[rgba(168,85,247,0.12)] hover:border-purple-400/40'
                }`}
              >
                All
              </button>

              <button
                onClick={() => setPlatformFilter('steam')}
                className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 text-sm ${
                  platformFilter === 'steam'
                    ? 'bg-linear-to-b from-purple-500 to-purple-300 text-[#001018] shadow-[0_8px_22px_rgba(168,85,247,0.35)]'
                    : 'bg-[rgba(20,28,42,0.6)] border border-white/8 text-cyan-100 hover:bg-[rgba(168,85,247,0.12)] hover:border-purple-400/40'
                }`}
              >
                🎮 Steam
              </button>

              <button
                onClick={() => setPlatformFilter('playstation')}
                className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 text-sm ${
                  platformFilter === 'playstation'
                    ? 'bg-linear-to-b from-purple-500 to-purple-300 text-[#001018] shadow-[0_8px_22px_rgba(168,85,247,0.35)]'
                    : 'bg-[rgba(20,28,42,0.6)] border border-white/8 text-cyan-100 hover:bg-[rgba(168,85,247,0.12)] hover:border-purple-400/40'
                }`}
              >
                🎮 PlayStation
              </button>

              <button
                onClick={() => setPlatformFilter('xbox')}
                className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 text-sm ${
                  platformFilter === 'xbox'
                    ? 'bg-linear-to-b from-purple-500 to-purple-300 text-[#001018] shadow-[0_8px_22px_rgba(168,85,247,0.35)]'
                    : 'bg-[rgba(20,28,42,0.6)] border border-white/8 text-cyan-100 hover:bg-[rgba(168,85,247,0.12)] hover:border-purple-400/40'
                }`}
              >
                🎮 Xbox
              </button>

              <button
                onClick={() => setPlatformFilter('gog')}
                className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 text-sm ${
                  platformFilter === 'gog'
                    ? 'bg-linear-to-b from-purple-500 to-purple-300 text-[#001018] shadow-[0_8px_22px_rgba(168,85,247,0.35)]'
                    : 'bg-[rgba(20,28,42,0.6)] border border-white/8 text-cyan-100 hover:bg-[rgba(168,85,247,0.12)] hover:border-purple-400/40'
                }`}
              >
                🎮 GOG
              </button>

              <button
                onClick={() => setPlatformFilter('android')}
                className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 text-sm ${
                  platformFilter === 'android'
                    ? 'bg-linear-to-b from-purple-500 to-purple-300 text-[#001018] shadow-[0_8px_22px_rgba(168,85,247,0.35)]'
                    : 'bg-[rgba(20,28,42,0.6)] border border-white/8 text-cyan-100 hover:bg-[rgba(168,85,247,0.12)] hover:border-purple-400/40'
                }`}
              >
                🤖 Android
              </button>

              <button
                onClick={() => setPlatformFilter('ios')}
                className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 text-sm ${
                  platformFilter === 'ios'
                    ? 'bg-linear-to-b from-purple-500 to-purple-300 text-[#001018] shadow-[0_8px_22px_rgba(168,85,247,0.35)]'
                    : 'bg-[rgba(20,28,42,0.6)] border border-white/8 text-cyan-100 hover:bg-[rgba(168,85,247,0.12)] hover:border-purple-400/40'
                }`}
              >
                🍎 iOS
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-[rgba(20,28,42,0.6)] border border-white/8 rounded-2xl overflow-hidden animate-pulse"
              >
                <div className="w-full h-48 bg-white/10" />
                <div className="p-4">
                  <div className="h-6 bg-white/10 rounded mb-3" />
                  <div className="h-4 bg-white/10 rounded mb-2" />
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
            <p className="text-red-300 text-lg">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && games.length === 0 && (
          <div className="bg-[rgba(20,28,42,0.6)] border border-white/8 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold mb-3 text-cyan-100">No Games Found</h2>
            <p className="text-cyan-200/70">Try adjusting your filters</p>
          </div>
        )}

        {/* Games Grid */}
        {!loading && !error && games.length > 0 && (
          <>
            <div className="mb-6 text-cyan-200/60">
              Showing {games.length} free games
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {games.map((game) => {
                const isExpanded = expandedGameId === game.id;
                return (
                  <article
                    key={game.id}
                    className="bg-[rgba(20,28,42,0.6)] border border-white/8 rounded-2xl overflow-hidden hover:border-cyan-400/40 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(34,211,238,0.2)] group flex flex-col"
                  >
                    {/* Game Thumbnail */}
                    <div 
                      className="w-full h-48 overflow-hidden relative cursor-pointer"
                      onClick={() => window.open(game.game_url, '_blank')}
                    >
                      <img
                        src={game.thumbnail}
                        alt={game.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null; // Prevent infinite loop
                          target.src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=450&fit=crop&q=80';
                        }}
                      />
                      {/* Platform Badge */}
                      <div className="absolute top-3 right-3 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-sm font-bold">
                        {getPlatformIcon(game.platform)} {game.platform}
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      {/* Genre Badge */}
                      <div className="mb-2">
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-full">
                          {game.genre}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold mb-2 text-cyan-100 group-hover:text-cyan-300 transition-colors duration-200 line-clamp-2">
                        {game.title}
                      </h3>

                      {/* Description */}
                      <div className="mb-3 flex-1">
                        <p className={`text-sm text-cyan-200/70 ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {game.short_description}
                        </p>
                        {game.short_description.length > 100 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedGameId(isExpanded ? null : game.id);
                            }}
                            className="text-xs text-cyan-400 hover:text-cyan-300 mt-1 font-semibold inline-block"
                          >
                            {isExpanded ? 'Show less' : 'Read more'}
                          </button>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-cyan-300/60 mb-4">
                        <span>{game.publisher !== 'Unknown' ? game.publisher : game.platform}</span>
                        <span>{formatReleaseDate(game.release_date)}</span>
                      </div>

                      {/* Play Button */}
                      <button 
                        onClick={() => window.open(game.game_url, '_blank')}
                        className="w-full py-2 bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] font-bold rounded-lg transition-all duration-200 hover:from-cyan-400 hover:to-cyan-500 shadow-[0_4px_12px_rgba(34,211,238,0.35)]"
                      >
                        Play Free →
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
