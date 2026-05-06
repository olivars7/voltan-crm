'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { useTheme } from '@/components/ThemeProvider';

// Importación dinámica del componente Aurora para evitar errores de SSR
const Aurora = dynamic(() => import('@/components/ui/aurora'), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black z-0" />
});

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(true);
  const { theme } = useTheme();

  // Definición de colores basada en el tema para que coincida con el layout
  const colorStops = theme === 'dark' 
    ? ["#000000", "#001F3F", "#C0C0C0"] 
    : ["#FFFFFF", "#B0E0E6", "#D1D5DB"];

  useEffect(() => {
    // La pantalla de carga ahora dura 2.5 segundos (2000 + 500ms)
    const timer = setTimeout(() => {
      setVisible(false);
      // Esperamos a que termine la transición de opacidad antes de desmontar
      setTimeout(() => setMounted(false), 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500 ease-in-out bg-black",
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {/* Fondo Aurora dedicado para la pantalla de carga */}
      <div className="absolute inset-0 z-0">
        <Aurora
          colorStops={colorStops}
          blend={theme === 'dark' ? 1.0 : 0.8}
          amplitude={1.1}
          speed={0.8}
        />
      </div>

      {/* Contenedor del cargador geométrico */}
      <div className="relative z-10 flex items-center gap-8">
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
