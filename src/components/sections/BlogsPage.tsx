import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBlogs, type WordPressPost } from '../../services/wordpress';

export function BlogsPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setLoading(true);
        const data = await fetchBlogs();
        setPosts(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load blogs');
        setLoading(false);
      }
    };

    loadBlogs();
  }, []);

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
            📝 Blogs
          </h1>
          <p className="text-xl text-cyan-200/80">
            Insights, tutorials, and stories from the indie game development community
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[rgba(20,28,42,0.6)] border border-white/8 rounded-2xl p-6 animate-pulse">
                <div className="w-full h-48 bg-white/10 rounded-xl mb-4" />
                <div className="h-6 bg-white/10 rounded mb-3" />
                <div className="h-4 bg-white/10 rounded mb-2" />
                <div className="h-4 bg-white/10 rounded w-3/4" />
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
        {!loading && !error && posts.length === 0 && (
          <div className="bg-[rgba(20,28,42,0.6)] border border-white/8 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold mb-3 text-cyan-100">No Blogs Yet</h2>
            <p className="text-cyan-200/70">
              Blog posts will appear here once the WordPress API is connected.
            </p>
          </div>
        )}

        {/* Blog Posts Grid */}
        {!loading && !error && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-[rgba(20,28,42,0.6)] border border-white/8 rounded-2xl overflow-hidden hover:border-cyan-400/40 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(34,211,238,0.2)] group"
              >
                {post._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
                  <div className="w-full h-48 overflow-hidden">
                    <img
                      src={post._embedded['wp:featuredmedia'][0].source_url}
                      alt={post._embedded['wp:featuredmedia'][0].alt_text || post.title.rendered}
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
                        year: 'numeric'
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
                  
                  <button
                    onClick={() => {
                      const slug = post.link.split('/').filter(Boolean).pop();
                      navigate(`/blogs/${slug}`);
                    }}
                    className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 font-semibold transition-colors duration-200"
                  >
                    Read More <span>→</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
