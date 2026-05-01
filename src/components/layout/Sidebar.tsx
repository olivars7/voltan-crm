'use client';

import React, { useMemo } from 'react';
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
import { usePagos } from '@/hooks/usePagos';
import { useClientes } from '@/hooks/useClientes';
import { useAgenda } from '@/hooks/useAgenda';
import { isBefore, isToday, parseISO, startOfToday, startOfMonth, addMonths } from 'date-fns';

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
  const { pagos } = usePagos();
  const { clientes } = useClientes();
  const { llamadas } = useAgenda();

  const status = useMemo(() => {
    const now = new Date();
    const today = startOfToday();
    
    let hasOverdue = false;
    let hasTodayEvents = false;
    let hasTodayMeetings = false;

    // Check Calls - Solo para Agenda
    llamadas.forEach(l => {
      const callDate = parseISO(l.fecha);
      if (isToday(callDate)) {
        hasTodayMeetings = true;
      }
    });

    // Check Payments - Para Consola y Pagos
    pagos.forEach(p => {
      const dueDate = parseISO(p.fechaLimite);
      if (p.estado === 'pendiente') {
        if (isBefore(dueDate, today)) hasOverdue = true;
        if (isToday(dueDate)) hasTodayEvents = true;
      }
    });

    // Check Clients (Projects and Recurring)
    clientes.forEach(cl => {
      if (cl.estado === 'activo') {
        // Project delivery
        if (cl.proyecto && cl.proyecto.estado === 'en-progreso') {
          const deliveryDate = parseISO(cl.proyecto.fechaEntrega);
          if (isBefore(deliveryDate, today)) hasOverdue = true;
          if (isToday(deliveryDate)) hasTodayEvents = true;
        }

        // Recurring payments logic
        if (cl.diaDePago && cl.cuotaMensual && cl.cuotaMensual > 0) {
          const paymentDay = cl.diaDePago;
          let cursorDate = startOfMonth(parseISO(cl.fechaInicio));

          while (isBefore(cursorDate, addMonths(startOfMonth(now), 1))) {
            const paymentDueDate = new Date(
              cursorDate.getFullYear(),
              cursorDate.getMonth(),
              paymentDay
            );

            if (isBefore(paymentDueDate, addMonths(now, 1))) {
              const existingPayment = pagos.find(
                (p) =>
                  p.clienteId === cl.id &&
                  p.concepto === 'Mensualidad' &&
                  parseISO(p.fechaLimite).getFullYear() === paymentDueDate.getFullYear() &&
                  parseISO(p.fechaLimite).getMonth() === paymentDueDate.getMonth()
              );

              if (!existingPayment) {
                if (isBefore(paymentDueDate, today)) hasOverdue = true;
                if (isToday(paymentDueDate)) hasTodayEvents = true;
              }
            }
            cursorDate = addMonths(cursorDate, 1);
          }
        }
      }
    });

    return { hasOverdue, hasTodayEvents, hasTodayMeetings };
  }, [pagos, clientes, llamadas]);

  return (
    <>
      {/* Desktop Sidebar - Floating Style */}
      <aside className="fixed inset-y-4 left-4 z-50 hidden w-20 flex-col rounded-2xl border border-white/10 bg-zinc-950/80 shadow-2xl backdrop-blur-xl sm:flex transition-all duration-300">
        <nav className="flex flex-col items-center gap-6 px-2 py-8">
          <Link
            href="/dashboard"
            className="group flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-black transition-all duration-200 active:scale-95 hover:shadow-xl hover:shadow-white/5"
          >
            <img src="/favicon.ico" alt="Logo" className="h-6 w-6" />
            <span className="sr-only">Sistema Voltan</span>
          </Link>
          
          <div className="h-px w-8 bg-white/10" />

          <TooltipProvider delayDuration={0}>
            <div className="flex flex-col gap-4">
              {navItems.map((item) => {
                const isActive = item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href);
                const isPagos = item.href === '/pagos';
                const isConsola = item.href === '/console';
                const isAgenda = item.href === '/agenda';
                
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          'relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200 ease-in-out hover:bg-white/10 active:scale-90',
                          isActive 
                            ? 'bg-white text-black shadow-lg shadow-white/10' 
                            : 'text-zinc-400 hover:text-white'
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        
                        {/* Notification Dot for Pagos (Vencidos) */}
                        {isPagos && status.hasOverdue && (
                          <div className="absolute top-2 right-2">
                            <span className="flex h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-vibrate" />
                          </div>
                        )}

                        {/* Notification Dots for Consola */}
                        {isConsola && (
                          <div className="absolute top-2 right-2 flex gap-0.5">
                            {status.hasOverdue && (
                              <span className="flex h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-vibrate" />
                            )}
                            {status.hasTodayEvents && (
                              <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                            )}
                          </div>
                        )}

                        {/* Notification Dot for Agenda */}
                        {isAgenda && status.hasTodayMeetings && (
                          <div className="absolute top-2 right-2">
                            <span className="flex h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                          </div>
                        )}

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
            const isPagos = item.href === '/pagos';
            const isConsola = item.href === '/console';
            const isAgenda = item.href === '/agenda';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-1.5 rounded-xl p-2.5 transition-all duration-200 active:scale-90',
                  isActive 
                    ? 'bg-white text-black' 
                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                )}
              >
                <item.icon className="h-5 w-5" />
                
                {/* Notification Dot for Mobile Pagos */}
                {isPagos && status.hasOverdue && (
                  <div className="absolute top-1.5 right-1.5">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-rose-500 animate-vibrate" />
                  </div>
                )}

                {/* Notification Dots for Mobile Consola */}
                {isConsola && (
                  <div className="absolute top-1.5 right-1.5 flex gap-0.5">
                    {status.hasOverdue && (
                      <span className="flex h-1.5 w-1.5 rounded-full bg-rose-500 animate-vibrate" />
                    )}
                    {status.hasTodayEvents && (
                      <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    )}
                  </div>
                )}

                {/* Notification Dot for Mobile Agenda */}
                {isAgenda && status.hasTodayMeetings && (
                  <div className="absolute top-1.5 right-1.5">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-amber-400" />
                  </div>
                )}

                <span className="text-[10px] font-semibold uppercase tracking-wider hidden xs:block">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  );
}
