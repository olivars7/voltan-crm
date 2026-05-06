'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    // La pantalla de carga dura 2 segundos
    const timer = setTimeout(() => {
      setVisible(false);
      // Esperamos a que termine la transición de opacidad antes de desmontar
      setTimeout(() => setMounted(false), 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-500 ease-in-out",
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="flex items-center gap-1">
        <span className="text-5xl text-white font-bold animate-pulse" style={{ animationDelay: '0s' }}>.</span>
        <span className="text-5xl text-white font-bold animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
        <span className="text-5xl text-white font-bold animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
      </div>
    </div>
  );
}
