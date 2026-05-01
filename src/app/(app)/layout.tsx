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
    <div className="relative h-screen w-full overflow-hidden">
      <BackgroundGradientAnimation
        firstColor="18, 113, 255"
        secondColor="0, 255, 255"
        thirdColor="0, 80, 255"
        fourthColor="0, 200, 255"
        fifthColor="0, 100, 200"
        containerClassName="absolute inset-0 z-0"
      >
        <div className="relative z-10 flex h-full w-full bg-transparent overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 sm:pl-28 sm:pr-8 py-4 h-full">
            <Header />
            <main className="flex-1 overflow-y-auto custom-scrollbar pt-2 pr-2">
              {children}
            </main>
          </div>
        </div>
      </BackgroundGradientAnimation>
    </div>
  );
}
