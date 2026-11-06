'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  MessageSquare,
  Video,
  User,
  PlusCircle,
} from 'lucide-react';

interface TabItem {
  label: string;
  href: string;
  icon: React.ElementType;
  action?: () => void;
  isAction?: boolean;
}

const tabs: TabItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Messages', href: '/messages', icon: MessageSquare },
  { label: '', href: '', icon: PlusCircle, isAction: true },
  { label: 'Calls', href: '/calls', icon: Video },
  { label: 'Profile', href: '/profile', icon: User },
];

interface BottomTabBarProps {
  onActionClick?: () => void;
}

export default function BottomTabBar({ onActionClick }: BottomTabBarProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          if (tab.isAction) {
            return (
              <button
                key={`action-${index}`}
                onClick={onActionClick}
                className="flex flex-col items-center justify-center gap-1 p-2"
                aria-label={tab.label || 'Create new'}
              >
                <div className="w-12 h-12 -mt-4 bg-[#1877f2] rounded-full flex items-center justify-center shadow-lg hover:bg-[#166fe5] transition-colors">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </button>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-[#1877f2] dark:text-[#42b72a]'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              aria-label={tab.label}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
