'use client';

import React from 'react';
import { Package } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="flex items-center gap-2 sm:hidden">
        <Package className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold tracking-tight">Sistema Voltan</span>
      </div>
    </header>
  );
}
