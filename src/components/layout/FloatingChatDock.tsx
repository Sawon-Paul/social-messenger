'use client';

import React, { useState } from 'react';
import { X, Minimize, Maximize, Send, Paperclip, Mic, Smile } from 'lucide-react';

interface MiniChat {
  id: string;
  contactName: string;
  contactAvatar: string;
  lastMessage: string;
  unreadCount: number;
}

interface FloatingChatDockProps {
  chats: MiniChat[];
  onMinimize: (id: string) => void;
  onClose: (id: string) => void;
}

export default function FloatingChatDock({
  chats,
  onMinimize,
  onClose,
}: FloatingChatDockProps) {
  const [activeChat, setActiveChat] = useState<string | null>(null);

  if (chats.length === 0) return null;

  const activeChatData = chats.find((c) => c.id === activeChat);

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2 sm:bottom-6">
      {/* Active chat window */}
      {activeChatData && (
        <div className="w-[calc(100vw-2rem)] sm:w-80 md:w-96 h-[500px] max-h-[60vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#1877f2] text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium">
                {activeChatData.contactAvatar || activeChatData.contactName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold">{activeChatData.contactName}</p>
                <p className="text-xs text-white/80">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onMinimize(activeChat)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Minimize chat"
              >
                <Minimize className="w-4 h-4" />
              </button>
              <button
                onClick={() => onClose(activeChat)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f0f2f5] dark:bg-gray-800">
            <div className="flex justify-center">
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
                Today
              </span>
            </div>
            {/* Sample messages */}
            <div className="flex justify-end">
              <div className="max-w-[75%] bg-[#1877f2] text-white px-4 py-2 rounded-2xl rounded-br-md">
                <p className="text-sm">Hey! How are you?</p>
                <p className="text-[10px] text-white/70 mt-1">10:30 AM</p>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[75%] bg-white dark:bg-gray-700 px-4 py-2 rounded-2xl rounded-bl-md shadow-sm">
                <p className="text-sm text-gray-900 dark:text-gray-100">I'm good! Working on the project.</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">10:32 AM</p>
              </div>
            </div>
          </div>

          {/* Input area */}
          <div className="px-3 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400">
                <Paperclip className="w-5 h-5" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#1877f2] dark:text-gray-200 placeholder-gray-500"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400">
                  <Smile className="w-5 h-5" />
                </button>
              </div>
              <button className="p-2.5 bg-[#1877f2] text-white rounded-full hover:bg-[#166fe5] transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat dock buttons */}
      <div className="flex flex-col-reverse gap-2">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => setActiveChat(chat.id === activeChat ? null : chat.id)}
            className="relative group"
            aria-label={`Open chat with ${chat.contactName}`}
          >
            {/* Tooltip */}
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {chat.contactName}
              {chat.unreadCount > 0 && (
                <span className="ml-2 bg-[#1877f2] px-1.5 py-0.5 rounded-full text-xs">
                  {chat.unreadCount}
                </span>
              )}
            </div>

            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1877f2] to-[#42b72a] flex items-center justify-center text-white font-medium shadow-lg border-2 border-white dark:border-gray-900">
              {chat.contactAvatar || chat.contactName.charAt(0)}
              {chat.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-gray-900">
                  {chat.unreadCount}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
