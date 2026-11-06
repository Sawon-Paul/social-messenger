'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  MessageSquare,
  Video,
  Store,
  Calendar,
  Bookmark,
  Heart,
  ChevronLeft,
  Globe,
  Bell,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: 'News Feed', href: '/', icon: Home },
  { label: 'Messenger', href: '/messages', icon: MessageSquare, badge: 3 },
  { label: 'Video Calls', href: '/calls', icon: Video },
  { label: 'Marketsplace', href: '/marketplace', icon: Store },
  { label: 'Groups', href: '/groups', icon: Users },
  { label: 'Events', href: '/events', icon: Calendar },
  { label: 'Watch', href: '/watch', icon: Bookmark },
  { label: 'Communities', href: '/communities', icon: Globe },
  { label: 'Notifications', href: '/notifications', icon: Bell, badge: 5 },
];

interface LeftSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeftSidebar({ isOpen, onClose }: LeftSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay for mobile/tablet */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-[var(--navbar-height)] left-0 bottom-0 z-40
          w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full overflow-y-auto py-4">
          {/* User profile section */}
          <Link href="/profile" className="px-4 mb-4">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1877f2] to-[#42b72a] flex items-center justify-center text-white font-medium">
                U
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  User Name
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  @username
                </p>
              </div>
            </div>
          </Link>

          {/* Divider */}
          <div className="mx-4 border-t border-gray-200 dark:border-gray-700" />

          {/* Navigation items */}
          <nav className="flex-1 px-2 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                    ${isActive
                      ? 'bg-[#1877f2]/10 text-[#1877f2] dark:text-[#42b72a]'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="bg-[#1877f2] text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* See more / collapse button */}
          <button className="mx-2 mb-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400">
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              © 2026 Social Messenger
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
