// src/app/(main)/messages/page.tsx — Messenger page with conversation list and chat
'use client';

import { useState, useEffect } from 'react';
import ChatList from '@/components/messenger/ChatList';
import ChatWindow from '@/components/messenger/ChatWindow';
import { createClient } from '@/lib/supabase/client';

export default function MessagesPage() {
  const [userId, setUserId] = useState<string>('');
  const [selectedChat, setSelectedChat] = useState<{
    userId: string;
    userName: string;
    userAvatar: string;
  } | null>(null);

  // Get current user on mount
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-100 dark:bg-gray-900">
      <div className="h-full flex max-w-6xl mx-auto">
        {/* Chat List */}
        <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} w-full md:w-96 flex-col border-r border-gray-200 dark:border-gray-700`}>
          {userId && (
            <ChatList
              userId={userId}
              onChatSelect={(chatUserId, chatUserName, chatUserAvatar) =>
                setSelectedChat({ userId: chatUserId, userName: chatUserName, userAvatar: chatUserAvatar })
              }
            />
          )}
        </div>

        {/* Chat Window */}
        <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
          {selectedChat ? (
            <ChatWindow
              userId={userId}
              chatUserId={selectedChat.userId}
              chatUserName={selectedChat.userName}
              chatUserAvatar={selectedChat.userAvatar}
              onBack={() => setSelectedChat(null)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-50">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <p className="text-lg font-semibold">Select a conversation</p>
                <p className="text-sm mt-1">Choose a friend to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
