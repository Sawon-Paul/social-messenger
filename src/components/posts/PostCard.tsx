'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface PostCardProps {
  post: any;
  userId: string;
  onDelete?: () => void;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: { full_name: string; avatar_url: string };
}

export default function PostCard({ post, userId, onDelete }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [authorAvatar, setAuthorAvatar] = useState('');

  // Load author info
  useEffect(() => {
    const loadAuthor = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', post.author_id)
        .single();
      if (data) {
        setAuthorName(data.full_name);
        setAuthorAvatar(data.avatar_url || '');
      }
    };
    loadAuthor();
  }, [post.author_id]);

  // Load like status and count
  useEffect(() => {
    const loadLike = async () => {
      const supabase = createClient();
      const { data: likeData } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', userId)
        .single();
      setLiked(!!likeData);

      const { count } = await supabase
        .from('post_likes')
        .select('count', { count: 'exact', head: true })
        .eq('post_id', post.id);
      setLikeCount(count || 0);
    };
    loadLike();
  }, [post.id, userId]);

  // Load comments when expanded
  useEffect(() => {
    if (!showComments) return;
    const loadComments = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('post_comments')
        .select(`
          id, user_id, content, created_at,
          profiles:user_id (full_name, avatar_url)
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });
      if (data) setComments(data);
    };
    loadComments();
  }, [showComments, post.id]);

  const toggleLike = async () => {
    try {
      const supabase = createClient();
      if (liked) {
        await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', userId);
        setLiked(false);
        setLikeCount((c) => c - 1);
      } else {
        await supabase.from('post_likes').insert({ post_id: post.id, user_id: userId });
        setLiked(true);
        setLikeCount((c) => c + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const addComment = async () => {
    if (!commentText.trim()) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from('post_comments').insert({
        post_id: post.id,
        user_id: userId,
        content: commentText.trim(),
      });
      if (error) throw error;

      setCommentText('');
      // Reload comments
      const { data } = await supabase
        .from('post_comments')
        .select(`
          id, user_id, content, created_at,
          profiles:user_id (full_name, avatar_url)
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });
      if (data) setComments(data);
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  const deletePost = async () => {
    const supabase = createClient();
    await supabase.from('posts').delete().eq('id', post.id);
    onDelete?.();
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {authorAvatar ? (
            <img src={authorAvatar} alt={authorName} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {authorName.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{authorName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(post.created_at)}</p>
          </div>
        </div>
        {post.author_id === userId && (
          <button onClick={deletePost} className="text-gray-400 hover:text-red-600 transition-colors">
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{post.content}</p>
        </div>
      )}

      {/* Image */}
      {post.image_url && (
        <div className="w-full">
          <img src={post.image_url} alt="Post" className="w-full object-cover max-h-96" />
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
        {likeCount > 0 && <span>{likeCount} like{likeCount !== 1 ? 's' : ''}</span>}
        {comments.length > 0 && (
          <span>{comments.length} comment{comments.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={toggleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2 font-semibold transition-colors ${
            liked
              ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
          <span>Like</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-colors"
        >
          <MessageCircle size={20} />
          <span>Comment</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-colors">
          <Share2 size={20} />
          <span>Share</span>
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
          {/* Comment list */}
          <div className="space-y-3 mb-3 max-h-64 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-2">
                {comment.profiles?.avatar_url ? (
                  <img
                    src={comment.profiles.avatar_url}
                    alt={comment.profiles.full_name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {(comment.profiles?.full_name || 'U').substring(0, 1)}
                  </div>
                )}
                <div className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {comment.profiles?.full_name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Comment input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addComment()}
              className="flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
            <button
              onClick={addComment}
              disabled={!commentText.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-full font-semibold transition-colors disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
