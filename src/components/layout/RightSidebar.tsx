'use client';

import React from 'react';
import { Search, UserPlus, Users, MoreHorizontal } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  username: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastMessage?: string;
  time?: string;
}

const recentContacts: Contact[] = [
  { id: '1', name: 'Alice Johnson', username: '@alice', avatar: '', status: 'online' },
  { id: '2', name: 'Bob Smith', username: '@bob', avatar: '', status: 'offline', lastMessage: 'See you tomorrow!', time: '2h ago' },
  { id: '3', name: 'Carol White', username: '@carol', avatar: '', status: 'online' },
  { id: '4', name: 'David Brown', username: '@david', avatar: '', status: 'away', lastMessage: 'Thanks!', time: '5h ago' },
  { id: '5', name: 'Eve Davis', username: '@eve', avatar: '', status: 'offline', lastMessage: 'Great photo!', time: '1d ago' },
];

interface RightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RightSidebar({ isOpen, onClose }: RightSidebarProps) {
  return (
    <aside
      className={`
        fixed top-[var(--navbar-height)] right-0 bottom-0 z-40
        w-72 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Contacts
            </h2>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <MoreHorizontal className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1877f2] dark:text-gray-200 placeholder-gray-500"
            />
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 mt-3">
            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#1877f2] text-white rounded-lg text-sm font-medium hover:bg-[#166fe5] transition-colors">
              <UserPlus className="w-4 h-4" />
              Add Friend
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <Users className="w-4 h-4" />
              Groups
            </button>
          </div>
        </div>

        {/* Online contacts */}
        <div className="px-4 py-3">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Online — {recentContacts.filter((c) => c.status === 'online').length}
          </h3>
          <div className="space-y-1">
            {recentContacts
              .filter((c) => c.status === 'online')
              .map((contact) => (
                <button
                  key={contact.id}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1877f2] to-[#42b72a] flex items-center justify-center text-white text-sm font-medium">
                      {contact.name.charAt(0)}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {contact.name}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">Online</p>
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* Recent conversations */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Recent
          </h3>
          <div className="space-y-1">
            {recentContacts
              .filter((c) => c.status !== 'online')
              .map((contact) => (
                <button
                  key={contact.id}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-sm font-medium">
                      {contact.name.charAt(0)}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
                        contact.status === 'offline'
                          ? 'bg-gray-400'
                          : 'bg-yellow-500'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {contact.name}
                    </p>
                    {contact.lastMessage && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {contact.lastMessage} · {contact.time}
                      </p>
                    )}
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
