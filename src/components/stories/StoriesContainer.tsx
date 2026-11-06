'use client';

import { useState, useEffect } from 'react';
import StoryCard from './StoryCard';
import StoryViewer from './StoryViewer';
import { createClient } from '@/lib/supabase/client';

interface StoriesContainerProps {
  userId: string;
}

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  created_at: string;
  expires_at: string;
  profiles?: { full_name: string; avatar_url: string };
}

export default function StoriesContainer({ userId }: StoriesContainerProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [viewingStory, setViewingStory] = useState<{ story: Story; index: number } | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch active stories (not expired)
  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('stories')
          .select(`
            id, user_id, media_url, media_type, created_at, expires_at,
            profiles:user_id (full_name, avatar_url)
          `)
          .gte('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setStories(data);
      } catch (error) {
        console.error('Error fetching stories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  // Group stories by user
  const storiesByUser = stories.reduce((acc, story) => {
    if (!acc[story.user_id]) {
      acc[story.user_id] = [];
    }
    acc[story.user_id].push(story);
    return acc;
  }, {} as Record<string, Story[]>);

  // Get unique users with stories
  const usersWithStories = Object.keys(storiesByUser).map((userId) => ({
    userId,
    stories: storiesByUser[userId],
    name: storiesByUser[userId][0]?.profiles?.full_name || 'Unknown',
    avatarUrl: storiesByUser[userId][0]?.profiles?.avatar_url,
  }));

  const handleStoryClick = (userStories: Story[]) => {
    const firstIndex = stories.findIndex((s) => s.user_id === userStories[0].user_id);
    setViewingStory({ story: userStories[0], index: firstIndex });
  };

  if (loading || usersWithStories.length === 0) {
    return null;
  }

  return (
    <>
      {/* Stories row */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Stories</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {/* Add Story button (own) */}
          <StoryCard
            isOwn
            name="Add Story"
            onClick={() => {
              // TODO: Open story creation modal
              alert('Story creation coming soon!');
            }}
          />

          {/* Other users' stories */}
          {usersWithStories.map(({ userId: uid, stories: userStories, name, avatarUrl }) => (
            <StoryCard
              key={uid}
              avatarUrl={avatarUrl || undefined}
              name={name}
              hasStory={userStories.length > 0}
              onClick={() => handleStoryClick(userStories)}
            />
          ))}
        </div>
      </div>

      {/* Story viewer overlay */}
      {viewingStory && (
        <StoryViewer
          story={viewingStory.story}
          allStories={stories}
          currentIndex={viewingStory.index}
          onClose={() => setViewingStory(null)}
        />
      )}
    </>
  );
}
