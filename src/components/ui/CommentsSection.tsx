import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getComments, getReplies, addComment, deleteComment, type Comment } from '../../services/comments';

interface CommentsSectionProps {
  postId: string;
  onAuthRequired?: () => void;
}

export function CommentsSection({ postId, onAuthRequired }: CommentsSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replies, setReplies] = useState<{ [key: string]: Comment[] }>({});

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await getComments(postId);
      setComments(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading comments:', error);
      setLoading(false);
    }
  };

  const loadReplies = async (commentId: string) => {
    try {
      const data = await getReplies(commentId);
      setReplies((prev) => ({ ...prev, [commentId]: data }));
    } catch (error) {
      console.error('Error loading replies:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      onAuthRequired?.();
      return;
    }

    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const userId = (user as any).$id || (user as any).id;
      const userName = (user as any).name || 'Anonymous';
      
      await addComment(postId, userId, userName, newComment.trim());
      setNewComment('');
      await loadComments();
    } catch (error: any) {
      if (error?.message?.includes('not found')) {
        alert('Comments feature is not yet configured. Please contact the administrator.');
      } else {
        alert('Failed to post comment. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!user) {
      onAuthRequired?.();
      return;
    }

    if (!replyContent.trim()) return;

    try {
      const userId = (user as any).$id || (user as any).id;
      const userName = (user as any).name || 'Anonymous';
      
      await addComment(postId, userId, userName, replyContent.trim(), undefined, parentId);
      setReplyContent('');
      setReplyingTo(null);
      await loadReplies(parentId);
    } catch (error) {
      alert('Failed to post reply. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteComment(commentId);
      await loadComments();
    } catch (error) {
      alert('Failed to delete comment. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="mt-12 pt-8 border-t border-white/10">
      <h3 className="text-2xl font-bold text-cyan-100 mb-6">
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-8">
        <div className="bg-[rgba(13,21,36,0.65)] border border-white/8 rounded-xl p-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={user ? 'Share your thoughts...' : 'Sign in to comment'}
            disabled={!user || submitting}
            className="w-full bg-transparent text-white border-0 outline-none resize-none min-h-[100px] placeholder:text-cyan-300/40"
            maxLength={1000}
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
            <span className="text-xs text-cyan-300/40">
              {newComment.length}/1000
            </span>
            <button
              type="submit"
              disabled={!user || submitting || !newComment.trim()}
              className="px-6 py-2 bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] font-bold rounded-lg transition-all duration-200 hover:from-cyan-400 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[rgba(13,21,36,0.65)] border border-white/8 rounded-xl p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-white/10 rounded w-1/4 mb-2" />
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-[rgba(13,21,36,0.65)] border border-white/8 rounded-xl">
          <p className="text-cyan-200/60 text-lg mb-2">💬 No comments yet</p>
          <p className="text-cyan-200/40 text-sm">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.$id} className="bg-[rgba(13,21,36,0.65)] border border-white/8 rounded-xl p-6">
              <div className="flex gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-cyan-400 to-cyan-300 flex items-center justify-center text-[#001018] font-bold flex-shrink-0">
                  {comment.userName.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-bold text-cyan-100">{comment.userName}</span>
                    <span className="text-xs text-cyan-300/40">•</span>
                    <span className="text-xs text-cyan-300/60">{formatDate(comment.createdAt)}</span>
                    {comment.updatedAt && (
                      <>
                        <span className="text-xs text-cyan-300/40">•</span>
                        <span className="text-xs text-cyan-300/40">edited</span>
                      </>
                    )}
                  </div>

                  {/* Content */}
                  <p className="text-cyan-200/90 leading-relaxed mb-3 whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        if (!user) {
                          onAuthRequired?.();
                          return;
                        }
                        setReplyingTo(comment.$id);
                        loadReplies(comment.$id);
                      }}
                      className="text-xs text-cyan-300 hover:text-cyan-200 font-semibold"
                    >
                      Reply
                    </button>
                    {user && (user as any).$id === comment.userId && (
                      <button
                        onClick={() => handleDeleteComment(comment.$id)}
                        className="text-xs text-red-300 hover:text-red-200 font-semibold"
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  {/* Reply Form */}
                  {replyingTo === comment.$id && (
                    <div className="mt-4 ml-4 pl-4 border-l-2 border-cyan-500/30">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                        className="w-full bg-[rgba(13,21,36,0.65)] border border-white/8 rounded-lg p-3 text-white outline-none resize-none min-h-[80px] placeholder:text-cyan-300/40"
                        maxLength={500}
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleSubmitReply(comment.$id)}
                          disabled={!replyContent.trim()}
                          className="px-4 py-1.5 bg-cyan-500 text-[#001018] font-bold rounded-lg text-sm hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Reply
                        </button>
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyContent('');
                          }}
                          className="px-4 py-1.5 bg-white/10 text-cyan-200 font-bold rounded-lg text-sm hover:bg-white/20"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {replies[comment.$id] && replies[comment.$id].length > 0 && (
                    <div className="mt-4 ml-4 pl-4 border-l-2 border-cyan-500/30 space-y-3">
                      {replies[comment.$id].map((reply) => (
                        <div key={reply.$id} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-linear-to-br from-cyan-400 to-cyan-300 flex items-center justify-center text-[#001018] font-bold text-sm flex-shrink-0">
                            {reply.userName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-cyan-100 text-sm">{reply.userName}</span>
                              <span className="text-xs text-cyan-300/60">{formatDate(reply.createdAt)}</span>
                            </div>
                            <p className="text-cyan-200/90 text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Load Replies Button */}
                  {!replies[comment.$id] && (
                    <button
                      onClick={() => loadReplies(comment.$id)}
                      className="mt-3 text-xs text-cyan-300 hover:text-cyan-200 font-semibold"
                    >
                      Load replies
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
