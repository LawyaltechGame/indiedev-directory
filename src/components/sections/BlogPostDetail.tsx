import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { WordPressPost } from '../../services/wordpress';
import { ReactionButtons } from '../ui/ReactionButtons';
import { useAuth } from '../../contexts/AuthContext';

export function BlogPostDetail() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  useAuth();
  const [post, setPost] = useState<WordPressPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    const loadPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://test.lawyaltech.org/wp-json/wp/v2/posts?slug=${slug}&_embed`
        );
        
        if (!response.ok) {
          throw new Error('Failed to load post');
        }
        
        const data = await response.json();
        if (data.length > 0) {
          setPost(data[0]);
        } else {
          setError('Post not found');
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load post');
        setLoading(false);
      }
    };

    if (slug) {
      loadPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-white pt-28 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-white/10 rounded w-1/4 mb-8" />
            <div className="h-12 bg-white/10 rounded w-3/4 mb-4" />
            <div className="h-6 bg-white/10 rounded w-1/2 mb-8" />
            <div className="h-96 bg-white/10 rounded mb-8" />
            <div className="space-y-4">
              <div className="h-4 bg-white/10 rounded" />
              <div className="h-4 bg-white/10 rounded" />
              <div className="h-4 bg-white/10 rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-bg text-white pt-28 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/blogs')}
            className="mb-6 flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition-colors duration-200"
          >
            <span>←</span> Back to Blogs
          </button>
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
            <p className="text-red-300 text-lg">{error || 'Post not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const author = post._embedded?.author?.[0];

  return (
    <div className="min-h-screen bg-bg text-white pt-28 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/blogs')}
          className="mb-8 flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition-colors duration-200"
        >
          <span>←</span> Back to Blog
        </button>

        {/* Article Header */}
        <article className="bg-[rgba(20,28,42,0.6)] border border-white/8 rounded-2xl overflow-hidden">
          {/* Featured Image */}
          {post._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
            <div className="w-full h-96 overflow-hidden">
              <img
                src={post._embedded['wp:featuredmedia'][0].source_url}
                alt={post._embedded['wp:featuredmedia'][0].alt_text || post.title.rendered}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8 md:p-12">
            {/* Meta Info */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm text-cyan-300/60">
                {new Date(post.date).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
              {author && (
                <>
                  <span className="text-cyan-300/40">•</span>
                  <span className="text-sm text-cyan-300 font-semibold">
                    By {author.name}
                  </span>
                </>
              )}
            </div>

            {/* Title */}
            <h1
              className="text-4xl md:text-5xl font-black mb-6 bg-linear-to-r from-cyan-100 to-cyan-300 bg-clip-text text-transparent"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            {/* Content */}
            <div
              className="prose prose-lg prose-invert prose-cyan max-w-none mb-12
                prose-headings:text-white prose-headings:font-bold prose-headings:mb-6 prose-headings:mt-12
                prose-h2:text-3xl prose-h2:leading-tight
                prose-h3:text-2xl prose-h3:leading-snug
                prose-p:text-cyan-200/90 prose-p:leading-[1.8] prose-p:mb-6 prose-p:text-[17px]
                prose-a:text-cyan-300 prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-cyan-200
                prose-strong:text-white prose-strong:font-bold
                prose-ul:text-cyan-200/90 prose-ul:my-6 prose-ul:space-y-2
                prose-ol:text-cyan-200/90 prose-ol:my-6 prose-ol:space-y-2
                prose-li:text-[17px] prose-li:leading-relaxed prose-li:mb-2
                prose-li:marker:text-cyan-400
                prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
                prose-hr:border-white/10 prose-hr:my-12
                prose-blockquote:border-l-4 prose-blockquote:border-cyan-400 prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:italic prose-blockquote:text-cyan-200/70
                [&>*:first-child]:mt-0"
              dangerouslySetInnerHTML={{ __html: post.content.rendered }}
            />

            {/* Author Profile Section */}
            {author && (
              <div className="mt-12 pt-8 border-t border-white/10">
                <div className="flex gap-6 items-start bg-[rgba(13,21,36,0.65)] border border-white/8 rounded-2xl p-6">
                  {/* Author Avatar */}
                  <div className="flex-shrink-0">
                    <img
                      src={author.avatar_urls[96]}
                      alt={author.name}
                      className="w-20 h-20 rounded-full border-2 border-cyan-400/40"
                    />
                  </div>

                  {/* Author Info */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-cyan-100 mb-2">
                      {author.name}
                    </h3>
                    {author.description && (
                      <p className="text-cyan-200/70 leading-relaxed">
                        {author.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Reaction Buttons */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-lg font-bold text-cyan-100 mb-1">Was this helpful?</h3>
                  <p className="text-sm text-cyan-200/60">Let us know what you think</p>
                </div>
                <ReactionButtons
                  postId={post.id.toString()}
                  onAuthRequired={() => setShowAuthModal(true)}
                />
              </div>
            </div>
          </div>
        </article>

        {/* Auth Required Modal */}
        {showAuthModal && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-5"
            onClick={() => setShowAuthModal(false)}
          >
            <div
              className="bg-[rgba(20,28,42,0.95)] backdrop-blur-[20px] border border-white/8 rounded-2xl max-w-md w-full p-8 relative shadow-[0_25px_50px_rgba(0,0,0,0.5)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 bg-white/10 border-0 text-white w-8 h-8 rounded-lg cursor-pointer text-xl transition-all duration-200 hover:bg-white/20"
                onClick={() => setShowAuthModal(false)}
              >
                ✕
              </button>

              <div className="mb-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-linear-to-br from-cyan-400 to-cyan-300 rounded-full flex items-center justify-center text-[#001018] text-2xl font-black">
                  🔒
                </div>
                <h2 className="text-2xl font-bold mb-2 bg-linear-to-r from-cyan-100 to-cyan-300 bg-clip-text text-transparent">
                  Login Required
                </h2>
                <p className="text-cyan-200 text-sm">
                  Please sign in to like or dislike posts
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  className="flex-1 h-12 bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] font-extrabold rounded-xl border-0 cursor-pointer transition-all duration-200 hover:from-cyan-400 hover:to-cyan-500 shadow-[0_8px_22px_rgba(34,211,238,0.35)]"
                  onClick={() => {
                    setShowAuthModal(false);
                    navigate('/?login=true');
                  }}
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
