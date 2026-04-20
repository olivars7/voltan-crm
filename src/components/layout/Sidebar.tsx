'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Calendar,
  DollarSign,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/clientes', icon: Users, label: 'Clientes' },
  { href: '/citas', icon: Calendar, label: 'Citas' },
  { href: '/pagos', icon: DollarSign, label: 'Pagos' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-4 left-4 z-10 hidden w-16 flex-col items-center justify-center rounded-full border bg-background/80 backdrop-blur-sm sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 py-5">
        <Link
          href="/dashboard"
          className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground"
        >
          <Package className="h-5 w-5 transition-all group-hover:scale-110" />
          <span className="sr-only">ClientFlow</span>
        </Link>
        <TooltipProvider>
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground',
                    pathname.startsWith(item.href) && 'bg-accent text-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="border-border/20 bg-background/50 backdrop-blur-md">
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>
    </aside>
  );
}
