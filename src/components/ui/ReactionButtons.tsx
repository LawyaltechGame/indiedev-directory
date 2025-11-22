import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getReactionCounts, addReaction, type ReactionCounts } from '../../services/reactions';

interface ReactionButtonsProps {
  postId: string;
  onAuthRequired?: () => void;
}

export function ReactionButtons({ postId, onAuthRequired }: ReactionButtonsProps) {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<ReactionCounts>({
    likes: 0,
    dislikes: 0,
    userReaction: null,
  });
  const [loading, setLoading] = useState(false);

  // Load initial reaction counts
  useEffect(() => {
    loadReactions();
  }, [postId, user]);

  const loadReactions = async () => {
    try {
      const userId = user ? (user as any).$id || (user as any).id : undefined;
      const counts = await getReactionCounts(postId, userId);
      setReactions(counts);
    } catch (error) {
      console.error('Error loading reactions:', error);
    }
  };

  const handleReaction = async (type: 'like' | 'dislike') => {
    if (!user) {
      onAuthRequired?.();
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      const userId = (user as any).$id || (user as any).id;
      await addReaction(postId, userId, type);
      await loadReactions();
    } catch (error: any) {
      console.error('Error adding reaction:', error);
      // Show user-friendly error message
      if (error?.message?.includes('collection not found')) {
        alert('Reactions feature is not yet configured. Please contact the administrator.');
      } else {
        alert('Failed to add reaction. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Like Button */}
      <button
        onClick={() => handleReaction('like')}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
          reactions.userReaction === 'like'
            ? 'bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
            : 'bg-[rgba(13,21,36,0.65)] border border-white/8 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400/40'
        } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        title={user ? 'Like this post' : 'Login to like'}
      >
        <span className="text-xl">👍</span>
        <span className="text-sm font-bold">{reactions.likes}</span>
      </button>

      {/* Dislike Button */}
      <button
        onClick={() => handleReaction('dislike')}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
          reactions.userReaction === 'dislike'
            ? 'bg-red-500/20 border-2 border-red-400 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
            : 'bg-[rgba(13,21,36,0.65)] border border-white/8 text-cyan-300 hover:bg-red-500/10 hover:border-red-400/40'
        } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        title={user ? 'Dislike this post' : 'Login to dislike'}
      >
        <span className="text-xl">👎</span>
        <span className="text-sm font-bold">{reactions.dislikes}</span>
      </button>
    </div>
  );
}
