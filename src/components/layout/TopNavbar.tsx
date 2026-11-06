'use client';

import React, { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  MessageSquare,
  ChevronDown,
  X,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import NotificationBell from '@/components/notifications/NotificationBell';

interface TopNavbarProps {
  onMenuToggle: () => void;
  sidebarOpen: boolean;
  onRightSidebarToggle: () => void;
  rightSidebarOpen: boolean;
}

export default function TopNavbar({
  onMenuToggle,
  sidebarOpen,
  onRightSidebarToggle,
  rightSidebarOpen,
}: TopNavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 h-[var(--navbar-height)]">
      <div className="h-full px-4 flex items-center justify-between gap-4">
        {/* Left section */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Hamburger menu for mobile/tablet */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#1877f2] rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1877f2] hidden sm:block">
              ConnectHub
            </span>
          </Link>

          {/* Search bar - desktop */}
          <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#1877f2] dark:text-gray-200 placeholder-gray-500"
            />
          </div>

          {/* Search bar - mobile (toggle) */}
          <div className={`md:hidden ${searchOpen ? 'block' : 'hidden'} absolute top-16 left-4 right-4 z-40`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#1877f2] dark:text-gray-200 placeholder-gray-500"
                autoFocus
              />
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Search toggle - mobile */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle search"
          >
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Right sidebar toggle - desktop */}
          <button
            onClick={onRightSidebarToggle}
            className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle contacts"
          >
            {rightSidebarOpen ? (
              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* Notifications */}
          {userId && <NotificationBell userId={userId} />}

          {/* Profile avatar */}
          <Link href="/profile" className="flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1877f2] to-[#42b72a] flex items-center justify-center text-white font-medium text-sm">
              U
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
