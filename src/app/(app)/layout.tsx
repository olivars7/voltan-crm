'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

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
  return (
    <div className="relative h-screen w-full overflow-hidden no-scrollbar bg-black">
      {/* Background Aurora stays fixed with requested palette and enhanced flow */}
      <div className="fixed inset-0 z-0">
        <Aurora
          colorStops={["#000000", "#001F3F", "#C0C0C0"]}
          blend={1.0}
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
