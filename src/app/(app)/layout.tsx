import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-transparent overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 sm:pl-28 sm:pr-8 py-4 h-full">
        <Header />
        <main className="flex-1 overflow-y-auto custom-scrollbar pt-2 pr-2">
          {children}
        </main>
      </div>
    </div>
  );
}
