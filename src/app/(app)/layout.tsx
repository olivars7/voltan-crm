'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useTheme } from '@/components/ThemeProvider';
import { LoadingScreen } from '@/components/shared/LoadingScreen';

// Use a client-side only import for the Aurora component
const Aurora = dynamic(() => import('@/components/ui/aurora'), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black z-0" />
});

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();

  // Dark palette: Black, Deep Navy, Silver
  // Light palette: White, Celeste (Light Blue), More Gray
  const colorStops = theme === 'dark' 
    ? ["#000000", "#001F3F", "#C0C0C0"] 
    : ["#FFFFFF", "#B0E0E6", "#D1D5DB"];

  return (
    <div className="relative h-screen w-full overflow-hidden no-scrollbar bg-black">
      {/* Loading overlay for the first 2 seconds */}
      <LoadingScreen />

      {/* Background Aurora stays fixed with requested palette and enhanced flow */}
      <div className="fixed inset-0 z-0 transition-colors duration-1000">
        <Aurora
          colorStops={colorStops}
          blend={theme === 'dark' ? 1.0 : 0.8}
          amplitude={1.1}
          speed={0.8}
        />
      </div>
      
      {/* Scrollable content container */}
      <div className="relative z-10 flex h-full w-full bg-transparent overflow-y-auto no-scrollbar">
        <Sidebar />
        <div className="flex flex-col flex-1 sm:pl-72 sm:pr-8 py-6 min-h-full">
          <Header />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
