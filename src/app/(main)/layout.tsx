'use client';

import React, { useState } from 'react';
import TopNavbar from '@/components/layout/TopNavbar';
import LeftSidebar from '@/components/layout/LeftSidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import BottomTabBar from '@/components/layout/BottomTabBar';
import FloatingChatDock from '@/components/layout/FloatingChatDock';
import { useAppStore } from '@/store/useAppStore';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  const miniChats = useAppStore((state) => state.miniChats);
  const minimizeChat = useAppStore((state) => state.minimizeChat);
  const closeChat = useAppStore((state) => state.closeChat);

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-gray-950">
      {/* Top Navbar */}
      <TopNavbar
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        onRightSidebarToggle={() => setRightSidebarOpen(!rightSidebarOpen)}
        rightSidebarOpen={rightSidebarOpen}
      />

      <div className="pt-[var(--navbar-height)] flex min-h-[calc(100vh-var(--navbar-height))]">
        {/* Left Sidebar */}
        <LeftSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto lg:ml-64 xl:mr-72 pb-16 lg:pb-0">
          {children}
        </main>

        {/* Right Sidebar */}
        {rightSidebarOpen && (
          <RightSidebar
            isOpen={rightSidebarOpen}
            onClose={() => setRightSidebarOpen(false)}
          />
        )}
      </div>

      {/* Bottom Tab Bar - Mobile only */}
      <BottomTabBar />

      {/* Floating Chat Dock */}
      <FloatingChatDock
        chats={miniChats}
        onMinimize={minimizeChat}
        onClose={closeChat}
      />
    </div>
  );
}
