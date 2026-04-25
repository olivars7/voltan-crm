'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  DollarSign,
  Package,
  History,
  CalendarDays,
  Database,
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
  { href: '/pagos', icon: DollarSign, label: 'Pagos' },
  { href: '/console', icon: History, label: 'Consola' },
  { href: '/agenda', icon: CalendarDays, label: 'Agenda' },
  { href: '/test', icon: Database, label: 'Test DB' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-20 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/dashboard"
          className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-12 md:w-12"
        >
          <Package className="h-5 w-5 transition-all group-hover:scale-110 md:h-6 md:w-6" />
          <span className="sr-only">ClientFlow</span>
        </Link>
        <TooltipProvider>
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-12 md:w-12',
                    pathname.startsWith(item.href) && 'bg-accent text-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="border bg-background">
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>
    </aside>
  );
}
