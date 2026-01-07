import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getComments, getReplies, addComment, deleteComment, syncWordPressComment, deleteCommentAndReplies, getWordPressCommentsFromAppwrite, type Comment } from '../../services/comments';
import { fetchWordPressComments, type WordPressComment } from '../../services/wordpress';

interface CommentsSectionProps {
  postId: string;
  onAuthRequired?: () => void;
  isWordPressPost?: boolean; // Indicates if this is a WordPress post
}

export function CommentsSection({ postId, onAuthRequired, isWordPressPost = false }: CommentsSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replies, setReplies] = useState<{ [key: string]: Comment[] }>({});
  const [checkedForReplies, setCheckedForReplies] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadComments();
  }, [postId, isWordPressPost]);

  // Convert WordPress comment to Comment format and sync to Appwrite
  const convertAndSyncWordPressComment = async (wpComment: WordPressComment, parentAppwriteId?: string): Promise<Comment | null> => {
    // Strip HTML tags from content for display
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = wpComment.content.rendered;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Sync to Appwrite so users can reply
    const syncedComment = await syncWordPressComment(
      wpComment.id.toString(),
      postId,
      wpComment.author.toString(),
      wpComment.author_name || 'Anonymous',
      textContent.trim(),
      wpComment.author_avatar_urls?.[96],
      wpComment.date,
      parentAppwriteId // Use Appwrite ID for parent if this is a reply
    );
    
    return syncedComment;
  };

  const loadComments = async () => {
    try {
      setLoading(true);
      
      // Load Appwrite comments
      const appwriteComments = await getComments(postId);
      
      // Load WordPress comments if this is a WordPress post and sync to Appwrite
      let syncedWordPressComments: Comment[] = [];
      if (isWordPressPost) {
        const postIdNum = parseInt(postId, 10);
        if (!isNaN(postIdNum)) {
          const wpComments = await fetchWordPressComments(postIdNum);
          
          // Get all WordPress comments currently in Appwrite
          const existingWpCommentsInAppwrite = await getWordPressCommentsFromAppwrite(postId);
          const existingWpCommentIds = new Set(
            existingWpCommentsInAppwrite.map(c => c.wpCommentId).filter(Boolean)
          );
          
          // Get all WordPress comment IDs that are currently approved
          const currentWpCommentIds = new Set(
            wpComments.map(c => c.id.toString())
          );
          
          // Find WordPress comments that should be deleted (no longer in WordPress or unapproved)
          const commentsToDelete = existingWpCommentsInAppwrite.filter(
            comment => comment.wpCommentId && !currentWpCommentIds.has(comment.wpCommentId)
          );
          
          // Delete comments and all their replies that are no longer in WordPress
          for (const commentToDelete of commentsToDelete) {
            try {
              await deleteCommentAndReplies(commentToDelete.$id);
            } catch (error) {
              console.error(`Error deleting WordPress comment ${commentToDelete.wpCommentId}:`, error);
            }
          }
          
          // Organize WordPress comments by parent
          const wpCommentsMap = new Map<number, WordPressComment[]>();
          const topLevelComments: WordPressComment[] = [];
          
          wpComments.forEach((comment) => {
            if (comment.parent === 0) {
              topLevelComments.push(comment);
            } else {
              if (!wpCommentsMap.has(comment.parent)) {
                wpCommentsMap.set(comment.parent, []);
              }
              wpCommentsMap.get(comment.parent)!.push(comment);
            }
          });
          
          // Sync top-level WordPress comments to Appwrite
          const syncPromises = topLevelComments.map(comment => convertAndSyncWordPressComment(comment));
          const syncedTopLevel = await Promise.all(syncPromises);
          syncedWordPressComments = syncedTopLevel.filter((c): c is Comment => c !== null);
          
          // Create a map of WordPress comment IDs to Appwrite comment IDs
          const wpIdToAppwriteId = new Map<number, string>();
          syncedWordPressComments.forEach(comment => {
            if (comment.wpCommentId) {
              wpIdToAppwriteId.set(parseInt(comment.wpCommentId), comment.$id);
            }
          });
          
          // Sync replies for WordPress comments
          const allSyncedReplies: { [parentId: string]: Comment[] } = {};
          for (const [parentWpId, replies] of wpCommentsMap.entries()) {
            const parentAppwriteId = wpIdToAppwriteId.get(parentWpId);
            if (parentAppwriteId) {
              // Sort replies by date (oldest first for nested replies)
              const sortedReplies = replies.sort((a, b) => 
                new Date(a.date).getTime() - new Date(b.date).getTime()
              );
              
              // Sync each reply
              const syncedReplies: Comment[] = [];
              for (const reply of sortedReplies) {
                const syncedReply = await convertAndSyncWordPressComment(reply, parentAppwriteId);
                if (syncedReply) {
                  syncedReplies.push(syncedReply);
                }
              }
              
              if (syncedReplies.length > 0) {
                allSyncedReplies[parentAppwriteId] = syncedReplies;
              }
            }
          }
          
          // Set all replies at once
          if (Object.keys(allSyncedReplies).length > 0) {
            setReplies((prev) => ({ ...prev, ...allSyncedReplies }));
            // Mark parent comments as checked since we've loaded their replies
            Object.keys(allSyncedReplies).forEach((parentId) => {
              setCheckedForReplies((prev) => new Set(prev).add(parentId));
            });
          }
          
          // Mark all top-level WordPress comments without replies as checked
          syncedWordPressComments.forEach((comment) => {
            const hasReplies = allSyncedReplies[comment.$id];
            if (!hasReplies) {
              setCheckedForReplies((prev) => new Set(prev).add(comment.$id));
            }
          });
        }
      }
      
      // Merge comments (synced WordPress comments first, then Appwrite comments)
      // Filter out duplicates (Appwrite comments that are synced WordPress comments)
      const appwriteCommentIds = new Set(appwriteComments.map(c => c.wpCommentId).filter(Boolean));
      const uniqueAppwriteComments = appwriteComments.filter(c => !c.wpCommentId || !appwriteCommentIds.has(c.wpCommentId));
      
      const allComments = [...syncedWordPressComments, ...uniqueAppwriteComments];
      // Sort by date (newest first)
      allComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setComments(allComments);
      
      // Check which Appwrite comments have replies and mark them
      // We'll check for replies asynchronously to avoid blocking
      const checkRepliesForComments = async () => {
        // Check all comments (both WordPress synced and Appwrite)
        for (const comment of allComments) {
          // Skip if already checked or has replies loaded
          if (checkedForReplies.has(comment.$id) || replies[comment.$id]) {
            continue;
          }
          
          try {
            const replyData = await getReplies(comment.$id);
            if (replyData.length > 0) {
              // There are replies, but we'll load them on demand
              // Just don't mark as checked so "Load replies" shows
            } else {
              // No replies, mark as checked so button doesn't show
              setCheckedForReplies((prev) => new Set(prev).add(comment.$id));
            }
          } catch (error) {
            // On error, mark as checked to prevent repeated attempts
            setCheckedForReplies((prev) => new Set(prev).add(comment.$id));
          }
        }
      };
      
      // Run check in background (don't await)
      checkRepliesForComments();
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading comments:', error);
      setLoading(false);
    }
  };

  const loadReplies = async (commentId: string) => {
    try {
      // Load replies from Appwrite (includes both WordPress synced replies and Appwrite replies)
      const data = await getReplies(commentId);
      setReplies((prev) => ({ ...prev, [commentId]: data }));
      // Mark as checked (even if empty, so we don't show the button again)
      setCheckedForReplies((prev) => new Set(prev).add(commentId));
    } catch (error) {
      console.error('Error loading replies:', error);
      // Mark as checked even on error to prevent repeated attempts
      setCheckedForReplies((prev) => new Set(prev).add(commentId));
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

  const handleDeleteReply = async (replyId: string, parentCommentId: string) => {
    if (!confirm('Are you sure you want to delete this reply?')) return;

    try {
      await deleteComment(replyId);
      // Reload replies for the parent comment
      await loadReplies(parentCommentId);
    } catch (error) {
      alert('Failed to delete reply. Please try again.');
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
                <div className="relative w-10 h-10 flex-shrink-0">
                  {comment.userAvatar ? (
                    <img
                      src={comment.userAvatar}
                      alt={comment.userName}
                      className="w-10 h-10 rounded-full border-2 border-cyan-400/40 object-cover"
                      onError={(e) => {
                        // Hide image and show fallback on error
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector('.avatar-fallback') as HTMLElement;
                        if (fallback) {
                          fallback.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div 
                    className={`avatar-fallback w-10 h-10 rounded-full bg-linear-to-br from-cyan-400 to-cyan-300 flex items-center justify-center text-[#001018] font-bold ${comment.userAvatar ? 'hidden' : ''}`}
                  >
                    {comment.userName.charAt(0).toUpperCase()}
                  </div>
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
                    {user && (user as any).$id === comment.userId && !comment.wpCommentId && (
                      <button
                        onClick={() => handleDeleteComment(comment.$id)}
                        className="text-red-300 hover:text-red-200 transition-colors duration-200 p-1"
                        title="Delete comment"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
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
                          <div className="relative w-8 h-8 flex-shrink-0">
                            {reply.userAvatar ? (
                              <img
                                src={reply.userAvatar}
                                alt={reply.userName}
                                className="w-8 h-8 rounded-full border-2 border-cyan-400/40 object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.parentElement?.querySelector('.avatar-fallback') as HTMLElement;
                                  if (fallback) {
                                    fallback.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <div 
                              className={`avatar-fallback w-8 h-8 rounded-full bg-linear-to-br from-cyan-400 to-cyan-300 flex items-center justify-center text-[#001018] font-bold text-sm ${reply.userAvatar ? 'hidden' : ''}`}
                            >
                              {reply.userName.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-bold text-cyan-100 text-sm">{reply.userName}</span>
                              <span className="text-xs text-cyan-300/60">{formatDate(reply.createdAt)}</span>
                              {user && (user as any).$id === reply.userId && !reply.wpCommentId && (
                                <>
                                  <span className="text-xs text-cyan-300/40">•</span>
                                  <button
                                    onClick={() => handleDeleteReply(reply.$id, comment.$id)}
                                    className="text-red-300 hover:text-red-200 transition-colors duration-200 p-1"
                                    title="Delete reply"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3.5 w-3.5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                </>
                              )}
                            </div>
                            <p className="text-cyan-200/90 text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Load Replies Button - Only show if not checked yet and no replies loaded */}
                  {!replies[comment.$id] && !checkedForReplies.has(comment.$id) && (
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
