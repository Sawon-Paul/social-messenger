'use client';

import { useState, useEffect } from 'react';
import { Search, MessageSquare } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ChatListProps {
  userId: string;
  onChatSelect: (chatUserId: string, chatUserName: string, chatUserAvatar: string) => void;
}

interface Conversation {
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export default function ChatList({ userId, onChatSelect }: ChatListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch conversations from Supabase
  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const supabase = createClient();

        // Get all messages where user is sender or receiver
        const { data: messages, error } = await supabase
          .from('messages')
          .select(`
            id, sender_id, receiver_id, content, is_read, created_at,
            receiver:receiver_id (id),
            sender:sender_id (id)
          `)
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Group by conversation partner and get last message
        const convMap = new Map<string, Conversation>();
        messages?.forEach((msg: any) => {
          const otherUserId = msg.sender_id === userId 
            ? msg.receiver_id 
            : msg.sender_id;
          
          if (!convMap.has(otherUserId)) {
            convMap.set(otherUserId, {
              otherUserId,
              otherUserName: '',
              otherUserAvatar: '',
              lastMessage: msg.content,
              lastMessageTime: msg.created_at,
              unreadCount: 0,
            });
          } else {
            const existing = convMap.get(otherUserId)!;
            if (new Date(msg.created_at) > new Date(existing.lastMessageTime)) {
              existing.lastMessage = msg.content;
              existing.lastMessageTime = msg.created_at;
            }
            // Count unread messages
            if (msg.receiver_id === userId && !msg.is_read) {
              existing.unreadCount += 1;
            }
          }
        });

        // Fetch profiles for conversation partners
        const otherUserIds = Array.from(convMap.keys());
        if (otherUserIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', otherUserIds);

          profiles?.forEach((profile) => {
            const conv = convMap.get(profile.id);
            if (conv) {
              conv.otherUserName = profile.full_name;
              conv.otherUserAvatar = profile.avatar_url || '';
            }
          });
        }

        setConversations(Array.from(convMap.values()));
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [userId]);

  // Filter by search
  const filtered = conversations.filter((conv) =>
    conv.otherUserName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
            <MessageSquare size={48} className="mb-3 opacity-50" />
            <p className="text-lg font-semibold">No messages yet</p>
            <p className="text-sm mt-1">Start a conversation!</p>
          </div>
        ) : (
          filtered.map((conv) => (
            <button
              key={conv.otherUserId}
              onClick={() => onChatSelect(conv.otherUserId, conv.otherUserName, conv.otherUserAvatar)}
              className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700"
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {conv.otherUserAvatar ? (
                  <img
                    src={conv.otherUserAvatar}
                    alt={conv.otherUserName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {conv.otherUserName.substring(0, 1).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {conv.otherUserName}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                    {formatTime(conv.lastMessageTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {conv.lastMessage}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="ml-2 flex-shrink-0 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
