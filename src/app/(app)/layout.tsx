
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

// Dynamic import with SSR disabled to prevent WebGL/Server errors
const Aurora = dynamic(() => import('@/components/ui/aurora'), { ssr: false });

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-screen w-full overflow-hidden no-scrollbar bg-zinc-950">
      {/* Background Aurora stays fixed */}
      <div className="fixed inset-0 z-0">
        <Aurora
          colorStops={["#00e5ff", "#2273C3", "#5227FF"]}
          blend={0.5}
          amplitude={1.2}
          speed={0.4}
        />
      </div>
      
      {/* Scrollable content container */}
      <div className="relative z-10 flex h-full w-full bg-transparent overflow-y-auto no-scrollbar">
        <Sidebar />
        {/* py-8 ensures equal top and bottom margin (32px) */}
        <div className="flex flex-col flex-1 sm:pl-28 sm:pr-8 py-8 min-h-full">
          <Header />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
