import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchBlogs, fetchNews, type WordPressPost } from '../../services/wordpress';

type TabType = 'blogs' | 'news';

export function ContentHub() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>((searchParams.get('tab') as TabType) || 'blogs');
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = activeTab === 'blogs' ? await fetchBlogs() : await fetchNews();
        setPosts(data);
        setLoading(false);
      } catch (err) {
        setError(`Failed to load ${activeTab}`);
        setLoading(false);
      }
    };

    loadPosts();
  }, [activeTab]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
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
            Content Hub
          </h1>
          <p className="text-xl text-cyan-200/80 mb-8">
            Insights, tutorials, news, and stories from the indie game development community
          </p>

          {/* Tab Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleTabChange('blogs')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                activeTab === 'blogs'
                  ? 'bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] shadow-[0_8px_22px_rgba(34,211,238,0.35)]'
                  : 'bg-[rgba(20,28,42,0.6)] border border-white/8 text-cyan-100 hover:bg-[rgba(0,229,255,0.12)] hover:border-cyan-400/40'
              }`}
            >
              <span>📝</span>
              <span>Blogs</span>
            </button>

            <button
              onClick={() => handleTabChange('news')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                activeTab === 'news'
                  ? 'bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] shadow-[0_8px_22px_rgba(34,211,238,0.35)]'
                  : 'bg-[rgba(20,28,42,0.6)] border border-white/8 text-cyan-100 hover:bg-[rgba(0,229,255,0.12)] hover:border-cyan-400/40'
              }`}
            >
              <span>📰</span>
              <span>News</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <>
            {activeTab === 'blogs' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-[rgba(20,28,42,0.6)] border border-white/8 rounded-2xl p-6 animate-pulse"
                  >
                    <div className="w-full h-48 bg-white/10 rounded-xl mb-4" />
                    <div className="h-6 bg-white/10 rounded mb-3" />
                    <div className="h-4 bg-white/10 rounded mb-2" />
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="bg-[rgba(20,28,42,0.6)] border border-white/8 rounded-2xl p-6 animate-pulse"
                  >
                    <div className="flex gap-6">
                      <div className="w-64 h-40 bg-white/10 rounded-xl flex-shrink-0" />
                      <div className="flex-1">
                        <div className="h-6 bg-white/10 rounded mb-3 w-3/4" />
                        <div className="h-4 bg-white/10 rounded mb-2" />
                        <div className="h-4 bg-white/10 rounded mb-2" />
                        <div className="h-4 bg-white/10 rounded w-2/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
            <p className="text-red-300 text-lg">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && posts.length === 0 && (
          <div className="bg-[rgba(20,28,42,0.6)] border border-white/8 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">{activeTab === 'blogs' ? '📝' : '📰'}</div>
            <h2 className="text-2xl font-bold mb-3 text-cyan-100">
              No {activeTab === 'blogs' ? 'Blogs' : 'News'} Yet
            </h2>
            <p className="text-cyan-200/70">
              {activeTab === 'blogs' ? 'Blog posts' : 'News articles'} will appear here.
            </p>
          </div>
        )}

        {/* Content Grid/List */}
        {!loading && !error && posts.length > 0 && (
          <>
            {activeTab === 'blogs' ? (
              // Blog Grid Layout
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-[rgba(20,28,42,0.6)] border border-white/8 rounded-2xl overflow-hidden hover:border-cyan-400/40 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(34,211,238,0.2)] group cursor-pointer"
                    onClick={() => {
                      const slug = post.link.split('/').filter(Boolean).pop();
                      navigate(`/content/${slug}`);
                    }}
                  >
                    {post._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
                      <div className="w-full h-48 overflow-hidden">
                        <img
                          src={post._embedded['wp:featuredmedia'][0].source_url}
                          alt={
                            post._embedded['wp:featuredmedia'][0].alt_text || post.title.rendered
                          }
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-cyan-300/60">
                          {new Date(post.date).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        {post._embedded?.author?.[0] && (
                          <>
                            <span className="text-cyan-300/40">•</span>
                            <span className="text-xs text-cyan-300 font-semibold">
                              By {post._embedded.author[0].name}
                            </span>
                          </>
                        )}
                      </div>

                      <h2
                        className="text-xl font-bold mb-3 text-cyan-100 group-hover:text-cyan-300 transition-colors duration-200"
                        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                      />

                      <div
                        className="text-sm text-cyan-200/70 mb-4 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                      />

                      <div className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 font-semibold transition-colors duration-200">
                        Read More <span>→</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              // News List Layout
              <div className="space-y-6">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-[rgba(20,28,42,0.6)] border border-white/8 rounded-2xl overflow-hidden hover:border-cyan-400/40 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(34,211,238,0.2)] group cursor-pointer"
                    onClick={() => {
                      const slug = post.link.split('/').filter(Boolean).pop();
                      navigate(`/content/${slug}`);
                    }}
                  >
                    <div className="flex flex-col md:flex-row gap-6 p-6">
                      {post._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
                        <div className="w-full md:w-64 h-40 flex-shrink-0 overflow-hidden rounded-xl">
                          <img
                            src={post._embedded['wp:featuredmedia'][0].source_url}
                            alt={
                              post._embedded['wp:featuredmedia'][0].alt_text || post.title.rendered
                            }
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-bold rounded-full">
                            NEWS
                          </span>
                          <span className="text-xs text-cyan-300/60">
                            {new Date(post.date).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          {post._embedded?.author?.[0] && (
                            <>
                              <span className="text-cyan-300/40">•</span>
                              <span className="text-xs text-cyan-300 font-semibold">
                                By {post._embedded.author[0].name}
                              </span>
                            </>
                          )}
                        </div>

                        <h2
                          className="text-2xl font-bold mb-3 text-cyan-100 group-hover:text-cyan-300 transition-colors duration-200"
                          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                        />

                        <div
                          className="text-sm text-cyan-200/70 mb-4 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                        />

                        <div className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 font-semibold transition-colors duration-200">
                          Read Full Article <span>→</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
