'use client';

import { Image as ImageIcon, Plus } from 'lucide-react';

interface StoryCardProps {
  avatarUrl?: string;
  name: string;
  isOwn?: boolean;
  hasStory?: boolean;
  onClick?: () => void;
}

export default function StoryCard({ avatarUrl, name, isOwn, hasStory, onClick }: StoryCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 min-w-[72px]"
    >
      <div className={`relative w-16 h-16 rounded-full ${hasStory ? 'p-[2px] bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600' : ''}`}>
        {isOwn ? (
          <div className="w-full h-full rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center relative">
            <Plus className="absolute bottom-0 right-0 w-5 h-5 bg-blue-600 text-white rounded-full p-0.5" />
          </div>
        ) : avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full rounded-full object-cover" />
        ) : (
          <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            {name.substring(0, 1).toUpperCase()}
          </div>
        )}
      </div>
      <span className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[72px]">{name}</span>
    </button>
  );
}
