'use client';

import Link from 'next/link';
import { Users, Lock } from 'lucide-react';

interface CommunityCardProps {
  community: {
    id: string;
    name: string;
    description: string | null;
    avatar_url: string | null;
    privacy: 'public' | 'private';
    member_count?: number;
  };
}

export default function CommunityCard({ community }: CommunityCardProps) {
  return (
    <Link href={`/communities/${community.id}`} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          {community.avatar_url ? (
            <img
              src={community.avatar_url}
              alt={community.name}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
              <Users size={28} />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate">
                {community.name}
              </h3>
              {community.privacy === 'private' && (
                <Lock size={14} className="text-gray-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {community.description || 'No description'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {community.member_count || 0} members
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
