import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { BackgroundGradientAnimation } from '@/components/ui/background-gradient-animation';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-screen w-full overflow-hidden no-scrollbar">
      {/* Background stays fixed */}
      <BackgroundGradientAnimation
        firstColor="18, 113, 255"
        secondColor="0, 255, 255"
        thirdColor="120, 0, 255"
        fourthColor="0, 255, 180"
        fifthColor="0, 100, 255"
        pointerColor="0, 255, 255"
        containerClassName="fixed inset-0 z-0"
      />
      
      {/* Scrollable content container */}
      <div className="relative z-10 flex h-full w-full bg-transparent overflow-y-auto no-scrollbar">
        <Sidebar />
        <div className="flex flex-col flex-1 sm:pl-28 sm:pr-8 py-4 min-h-full">
          <Header />
          <main className="flex-1 pt-2 pr-2">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
