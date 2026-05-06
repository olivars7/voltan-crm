'use client';

import React from 'react';
import Image from 'next/image';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="flex w-full items-center justify-between sm:hidden">
        <div className="flex items-center gap-2">
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
        
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 bg-white/5 border border-white/5 hover:bg-white/10 rounded-full relative overflow-hidden group/toggle"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <div className="relative h-4 w-4">
            <Sun className={cn(
              "h-4 w-4 text-amber-400 absolute transition-all duration-500 transform",
              theme === 'dark' ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
            )} />
            <Moon className={cn(
              "h-4 w-4 text-zinc-300 absolute transition-all duration-500 transform",
              theme === 'light' ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
            )} />
          </div>
        </Button>
      </div>
    </header>
  );
}
