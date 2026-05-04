'use client';

import React from 'react';
import Image from 'next/image';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="flex items-center gap-2 sm:hidden">
        <div className="relative h-6 w-6">
          <Image 
            src="/favicon.ico" 
            alt="Voltan Logo" 
            fill 
            className="object-contain"
          />
        </div>
        <span className="text-lg font-bold tracking-tight">Sistema Voltan</span>
      </div>
    </header>
  );
}
