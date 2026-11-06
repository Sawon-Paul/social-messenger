// src/app/(main)/page.tsx — News Feed with infinite scroll
'use client';

import { useState, useEffect, useCallback } from 'react';
import PostCreation from '@/components/posts/PostCreation';
import PostCard from '@/components/posts/PostCard';
import StoriesContainer from '@/components/stories/StoriesContainer';
import { createClient } from '@/lib/supabase/client';

interface Post {
  id: string;
  author_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

export default function HomePage() {
  const [userId, setUserId] = useState<string>('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Get current user on mount
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  // Fetch posts from Supabase
  const fetchPosts = useCallback(async (pageNum: number) => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const supabase = createClient();
      const start = pageNum * pageSize;
      const end = start + pageSize - 1;

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) throw error;

      if (!data || data.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => [...prev, ...data]);
        setPage(pageNum + 1);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= documentHeight - 200) {
      fetchPosts(page);
    }
  }, [page, fetchPosts]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Initial load
  useEffect(() => {
    fetchPosts(0);
  }, []);

  const handlePostCreated = () => {
    setPage(0);
    setPosts([]);
    setHasMore(true);
    fetchPosts(0);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Stories */}
        {userId && <StoriesContainer userId={userId} />}

        {/* Post Creation */}
        {userId && <PostCreation userId={userId} onPostCreated={handlePostCreated} />}

        {/* Posts Feed */}
        <div>
          {posts.length === 0 && !loading && (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-gray-400 dark:text-gray-500">No posts yet</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Be the first to share something!</p>
            </div>
          )}

          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              userId={userId}
              onDelete={() => handlePostDeleted(post.id)}
            />
          ))}

          {loading && (
            <div className="text-center py-4">
              <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">You've reached the end!</p>
          )}
        </div>
      </div>
    </div>
  );
}
