// src/app/(main)/communities/[id]/page.tsx — Community detail page
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, Lock, Unlock, Plus, UserPlus, UserMinus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Community {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  privacy: 'public' | 'private';
  creator_id: string;
  created_at: string;
}

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = params.id as string;

  const [community, setCommunity] = useState<Community | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatorName, setCreatorName] = useState('');

  // Fetch community details
  useEffect(() => {
    const fetchCommunity = async () => {
      setLoading(true);
      try {
        const supabase = createClient();

        // Get community
        const { data: communityData, error: communityError } = await supabase
          .from('communities')
          .select('*')
          .eq('id', communityId)
          .single();

        if (communityError) throw communityError;
        if (!communityData) {
          setLoading(false);
          return;
        }

        setCommunity(communityData);

        // Get members
        const { data: membersData, error: membersError } = await supabase
          .from('community_members')
          .select(`
            user_id,
            profiles:user_id (full_name, avatar_url)
          `)
          .eq('community_id', communityId);

        if (membersError) throw membersError;
        if (membersData) setMembers(membersData);

        // Check if current user is member and get creator name
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: membership } = await supabase
            .from('community_members')
            .select('id')
            .eq('community_id', communityId)
            .eq('user_id', user.id)
            .single();

          setIsMember(!!membership);

          // Get creator name
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', communityData.creator_id)
            .single();

          if (profileData) setCreatorName(profileData.full_name);
        }
      } catch (error) {
        console.error('Error fetching community:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunity();
  }, [communityId]);

  const handleJoin = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !community) return;

    if (community.privacy === 'private') {
      // Send join request (could implement a separate table for this)
      alert('Join request sent! (Pending implementation)');
      return;
    }

    const { error } = await supabase.from('community_members').insert({
      community_id: communityId,
      user_id: user.id,
    });

    if (!error) setIsMember(true);
  };

  const handleLeave = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', user.id);

    if (!error) setIsMember(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 text-lg">Community not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Cover */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-20">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-start gap-4">
            {/* Avatar */}
            {community.avatar_url ? (
              <img
                src={community.avatar_url}
                alt={community.name}
                className="w-24 h-24 rounded-xl object-cover border-4 border-white dark:border-gray-800"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white border-4 border-white dark:border-gray-800">
                <Users size={40} />
              </div>
            )}

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{community.name}</h1>
                {community.privacy === 'private' ? (
                  <Lock size={18} className="text-gray-500" />
                ) : (
                  <Unlock size={18} className="text-green-600" />
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {community.description || 'No description'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Created by {creatorName}
              </p>
            </div>

            {/* Action button */}
            <div className="flex gap-2">
              {isMember ? (
                <button
                  onClick={handleLeave}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                >
                  <UserMinus size={18} />
                  <span>Leave</span>
                </button>
              ) : (
                <button
                  onClick={handleJoin}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  <UserPlus size={18} />
                  <span>Join</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Members Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users size={24} className="text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Members</h2>
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold px-3 py-1 rounded-full">
              {members.length}
            </span>
          </div>

          {members.length === 0 ? (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">
              No members yet. Be the first to join!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {members.map((member) => (
                <div key={member.user_id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {member.profiles?.avatar_url ? (
                    <img
                      src={member.profiles.avatar_url}
                      alt={member.profiles.full_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                      {(member.profiles?.full_name || 'U').substring(0, 1)}
                    </div>
                  )}
                  <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {member.profiles?.full_name || 'Unknown'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Posts Section (placeholder) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Posts</h2>
            {isMember && (
              <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors">
                <Plus size={16} />
                <span>New Post</span>
              </button>
            )}
          </div>
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">
            {isMember ? 'No posts yet. Start the conversation!' : 'Join this community to see posts.'}
          </p>
        </div>
      </div>
    </div>
  );
}
