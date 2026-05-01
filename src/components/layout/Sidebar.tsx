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
  Lightbulb,
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
  { href: '/leads', icon: Lightbulb, label: 'Leads' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar - Floating Style */}
      <aside className="fixed inset-y-4 left-4 z-50 hidden w-20 flex-col rounded-2xl border border-white/10 bg-zinc-950/80 shadow-2xl backdrop-blur-xl sm:flex transition-all duration-300">
        <nav className="flex flex-col items-center gap-6 px-2 py-8">
          <Link
            href="/dashboard"
            className="group flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-black transition-transform duration-200 active:scale-95"
          >
            <Package className="h-6 w-6" />
            <span className="sr-only">Sistema Voltan</span>
          </Link>
          
          <div className="h-px w-8 bg-white/10" />

          <TooltipProvider delayDuration={0}>
            <div className="flex flex-col gap-4">
              {navItems.map((item) => {
                const isActive = item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200 ease-in-out hover:bg-white/10 active:scale-90',
                          isActive 
                            ? 'bg-white text-black shadow-lg shadow-white/10' 
                            : 'text-zinc-400 hover:text-white'
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="sr-only">{item.label}</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="border-white/10 bg-zinc-900 text-white backdrop-blur-md">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </TooltipProvider>
        </nav>
      </aside>
      
      {/* Mobile Bottom Bar - Floating Style */}
      <nav className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl border border-white/10 bg-zinc-950/80 p-2 shadow-2xl backdrop-blur-xl sm:hidden transition-all duration-300">
        <div className="grid grid-cols-6 items-center justify-around gap-1">
          {navItems.map((item) => {
            const isActive = item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1.5 rounded-xl p-2.5 transition-all duration-200 active:scale-90',
                  isActive 
                    ? 'bg-white text-black' 
                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider hidden xs:block">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  );
}
