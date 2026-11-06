'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon, Video } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  created_at: string;
  expires_at: string;
  profiles?: { full_name: string; avatar_url: string };
}

interface StoryViewerProps {
  story: Story;
  allStories: Story[];
  currentIndex: number;
  onClose: () => void;
}

export default function StoryViewer({ story, allStories, currentIndex, onClose }: StoryViewerProps) {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const storyDuration = 5000; // 5 seconds per story
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Progress bar animation
  useEffect(() => {
    if (isPaused) return;

    setProgress(0);
    const startTime = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / storyDuration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        // Auto-advance to next story
        onAdvance();
      }
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [currentIndex, isPaused, onAdvance]);

  const onAdvance = useCallback(() => {
    if (currentIndex < allStories.length - 1) {
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIndex, allStories.length, onClose]);

  const goToNext = () => {
    if (currentIndex < allStories.length - 1) {
      setProgress(0);
    } else {
      onClose();
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
      >
        <X size={28} />
      </button>

      {/* Progress bars for each story in this user's sequence */}
      <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
        {allStories
          .filter((s) => s.user_id === story.user_id)
          .map((_, idx) => (
            <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{
                  width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
      </div>

      {/* User info */}
      <div className="absolute top-6 left-4 z-10 flex items-center gap-3">
        {story.profiles?.avatar_url ? (
          <img
            src={story.profiles.avatar_url}
            alt={story.profiles.full_name}
            className="w-10 h-10 rounded-full object-cover border-2 border-white"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold border-2 border-white">
            {(story.profiles?.full_name || 'U').substring(0, 1)}
          </div>
        )}
        <div>
          <p className="text-white font-semibold text-sm">{story.profiles?.full_name}</p>
          <p className="text-white/60 text-xs">
            {new Date(story.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Navigation areas */}
      <button
        onClick={goToPrev}
        disabled={currentIndex === 0}
        className="absolute left-0 top-0 w-1/6 h-full flex items-center justify-start pl-2 z-10 disabled:opacity-0"
      >
        <ChevronLeft size={32} className="text-white drop-shadow-lg" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-0 top-0 w-1/6 h-full flex items-center justify-end pr-2 z-10"
      >
        <ChevronRight size={32} className="text-white drop-shadow-lg" />
      </button>

      {/* Media content */}
      <div
        className="w-full max-w-md h-full max-h-[80vh] flex items-center justify-center"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {story.media_type === 'video' ? (
          <video
            src={story.media_url}
            className="w-full h-full object-cover rounded-lg"
            autoPlay
            muted
          />
        ) : (
          <img
            src={story.media_url}
            alt="Story"
            className="w-full h-full object-contain rounded-lg"
          />
        )}
      </div>
    </div>
  );
}
