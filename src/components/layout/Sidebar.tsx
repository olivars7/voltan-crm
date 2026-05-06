'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Home,
  Users,
  DollarSign,
  History,
  CalendarDays,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
  
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0 });

  useEffect(() => {
    const index = navItems.findIndex(item => 
      item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href)
    );
    if (index !== -1) {
      setActiveIndex(index);
    }
  }, [pathname]);

  useEffect(() => {
    const activeEl = containerRef.current?.querySelectorAll('.nav-link')[activeIndex] as HTMLElement;
    if (activeEl) {
      setIndicatorStyle({
        top: activeEl.offsetTop,
        height: activeEl.offsetHeight,
      });
    }
  }, [activeIndex]);

  const status = useMemo(() => {
    const now = new Date();
    const today = startOfToday();
    
    let hasOverdue = false;
    let hasTodayEvents = false;
    let hasTodayMeetings = false;

    llamadas.forEach(l => {
      const callDate = parseISO(l.fecha);
      if (['pronto', 'pendiente'].includes(l.estado)) {
        if (isToday(callDate) || isBefore(callDate, now)) {
          hasTodayMeetings = true;
        }
      }
    });

    pagos.forEach(p => {
      const dueDate = parseISO(p.fechaLimite);
      if (p.estado === 'pendiente') {
        if (isBefore(dueDate, today)) hasOverdue = true;
        if (isToday(dueDate)) hasTodayEvents = true;
      }
    });

    clientes.forEach(cl => {
      if (cl.estado === 'activo') {
        if (cl.proyecto && cl.proyecto.estado === 'en-progreso') {
          const deliveryDate = parseISO(cl.proyecto.fechaEntrega);
          if (isBefore(deliveryDate, today)) hasOverdue = true;
          if (isToday(deliveryDate)) hasTodayEvents = true;
        }

        if (cl.diaDePago && cl.cuotaMensual && cl.cuotaMensual > 0) {
          const paymentDay = cl.diaDePago;
          let cursorDate = startOfMonth(parseISO(cl.fechaInicio));

          while (isBefore(cursorDate, addMonths(startOfMonth(now), 1))) {
            const paymentDueDate = new Date(
              cursorDate.getFullYear(),
              cursorDate.getMonth(),
              paymentDay
            );

            if (isBefore(paymentDueDate, now)) {
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
      <style>
        {`
          .gooey-filter {
            position: absolute;
            left: 0;
            right: 0;
            filter: url('#gooey');
            pointer-events: none;
            z-index: 0;
          }
          .gooey-indicator {
            position: absolute;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
          }
          .nav-link {
            position: relative;
            z-index: 10;
            transition: all 0.1s ease;
          }
          .nav-link.active {
            color: #ffffff;
            font-weight: 600;
          }
          @keyframes vibrate {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-0.5px); }
            75% { transform: translateX(0.5px); }
          }
          .animate-vibrate {
            animation: vibrate 0.3s ease-in-out infinite;
          }
        `}
      </style>
      
      <svg className="hidden">
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-6 left-4 z-50 hidden w-64 flex-col rounded-2xl border border-white/10 bg-zinc-950/20 shadow-2xl backdrop-blur-3xl sm:flex">
        <nav className="flex flex-col gap-6 px-4 py-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-2 mb-1.5 transition-all duration-100 active:scale-95"
          >
            <div className="relative h-6 w-6 shrink-0">
               <Image 
                src="/favicon.ico" 
                alt="Voltan Logo" 
                fill 
                className="object-contain"
               />
            </div>
            <span className="text-lg font-bold tracking-tight text-white uppercase">Voltan</span>
          </Link>
          
          <div className="h-px w-full bg-white/5 mx-auto" />

          <div className="relative flex flex-col gap-2 px-2" ref={containerRef}>
            <div className="gooey-filter" style={{ height: '100%' }}>
              <div 
                className="gooey-indicator" 
                style={{ 
                  top: indicatorStyle.top, 
                  height: indicatorStyle.height 
                }} 
              />
            </div>

            {navItems.map((item, index) => {
              const isActive = activeIndex === index;
              const isPagos = item.href === '/pagos';
              const isConsola = item.href === '/console';
              const isAgenda = item.href === '/agenda';
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'nav-link flex h-12 w-full items-center gap-3 px-4 rounded-xl font-medium text-sm transition-all duration-100',
                    isActive ? 'active' : 'text-zinc-400 hover:text-white hover:bg-white/10'
                  )}
                >
                  <item.icon className="h-[14px] w-[14px] shrink-0" />
                  <span>{item.label}</span>
                  
                  <div className="ml-auto flex gap-1">
                    {isPagos && status.hasOverdue && (
                      <span className="flex h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-vibrate" />
                    )}
                    {isConsola && (
                      <>
                        {status.hasOverdue && <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-vibrate" />}
                        {status.hasTodayEvents && <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />}
                      </>
                    )}
                    {isAgenda && status.hasTodayMeetings && (
                      <span className="flex h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-vibrate" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
      
      {/* Mobile Bottom Bar */}
      <nav className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl border border-white/10 bg-zinc-950/40 p-1.5 shadow-2xl backdrop-blur-2xl sm:hidden">
        <div className="grid grid-cols-6 items-center justify-around gap-1">
          {navItems.map((item, index) => {
            const isActive = activeIndex === index;
            const isPagos = item.href === '/pagos';
            const isConsola = item.href === '/console';
            const isAgenda = item.href === '/agenda';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-1 rounded-lg p-2 transition-all duration-100 active:scale-90',
                  isActive ? 'bg-white/10 backdrop-blur-md text-white border border-white/10' : 'text-zinc-500'
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                
                {isPagos && status.hasOverdue && (
                  <div className="absolute top-1 right-1">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-rose-500 animate-vibrate" />
                  </div>
                )}
                {isConsola && (status.hasOverdue || status.hasTodayEvents) && (
                  <div className="absolute top-1 right-1 flex gap-0.5">
                    {status.hasOverdue && <span className="flex h-1 w-1 rounded-full bg-rose-500" />}
                    {status.hasTodayEvents && <span className="flex h-1 w-1 rounded-full bg-emerald-500" />}
                  </div>
                )}
                {isAgenda && status.hasTodayMeetings && (
                  <div className="absolute top-1 right-1">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-vibrate" />
                  </div>
                )}

                <span className="text-[8px] font-bold uppercase tracking-tight hidden xs:block">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  );
}
