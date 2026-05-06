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
      <div className="flex items-center gap-8">
        <div className="loader">
          <svg viewBox="0 0 80 80">
            <circle r="32" cy="40" cx="40" id="test"></circle>
          </svg>
        </div>

        <div className="loader triangle">
          <svg viewBox="0 0 86 80">
            <polygon points="43 8 79 72 7 72"></polygon>
          </svg>
        </div>

        <div className="loader">
          <svg viewBox="0 0 80 80">
            <rect height="64" width="64" y="8" x="8"></rect>
          </svg>
        </div>
      </div>
    </div>
  );
}
