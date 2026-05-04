'use client';
import { useClientes } from '@/hooks/useClientes';
import { usePagos } from '@/hooks/usePagos';
import { useAgenda } from '@/hooks/useAgenda';
import { useLeads } from '@/hooks/useLeads';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Users, DollarSign, ClipboardCheck, ArrowUp, ArrowDown, Target, CheckCircle, CalendarDays, TrendingUp, HandCoins, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, Bar, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Separator } from "@/components/ui/separator"
import { isBefore, parseISO, subMonths, startOfMonth, endOfMonth, format, isWithinInterval, isToday, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { type Cliente, type Pago, type LlamadaAgendada, type LlamadaEstado } from '@/lib/types';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PagoDetail } from '@/components/pagos/PagoDetail';
import { ClienteDetail } from '@/components/clientes/ClienteDetail';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { AgendaDetail } from '@/components/agenda/AgendaDetail';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

type TimelineItem = {
  date: Date;
  type: 'pago' | 'entrega' | 'llamada' | 'cierre';
  subType: 'overdue' | 'upcoming' | 'completed';
  data: any;
  cliente: any;
}

const DotDivider = () => (
  <div className="flex flex-col gap-0.5 px-2 self-center opacity-30">
    <div className="w-1 h-1 rounded-full bg-zinc-400" />
    <div className="w-1 h-1 rounded-full bg-zinc-400" />
  </div>
);

export default function DashboardPageClient() {
  const { clientes, updateCliente, loading: clientesLoading } = useClientes();
  const { pagos, loading: pagosLoading } = usePagos();
  const { llamadas, loading: llamadasLoading } = useAgenda();
  const { leads, loading: leadsLoading } = useLeads();

  const [now, setNow] = useState<Date | null>(null);
  const { toast } = useToast();
  
  const [isPagoDetailOpen, setPagoDetailOpen] = useState(false);
  const [isAgendaDetailOpen, setAgendaDetailOpen] = useState(false);
  const [consoleView, setConsoleView] = useState<'upcoming' | 'completed'>('upcoming');

  const [selectedPago, setSelectedPago] = useState<Pago | undefined>(undefined);
  const [selectedClienteId, setSelectedClienteId] = useState<string | undefined>(undefined);
  const [selectedLlamada, setSelectedLlamada] = useState<LlamadaAgendada | undefined>(undefined);
  const [visibleTimeline, setVisibleTimeline] = useState(40);

  useEffect(() => {
    setNow(new Date());
  }, []);

  const handleItemClick = (item: TimelineItem) => {
    if (item.type === 'pago') {
      setSelectedPago(item.data as Pago);
      setPagoDetailOpen(true);
    } else if (item.type === 'entrega') {
      setSelectedClienteId(item.cliente.id);
    } else if (item.type === 'llamada') {
      setSelectedLlamada(item.data as LlamadaAgendada);
      setAgendaDetailOpen(true);
    }
  };

  const kpiData = React.useMemo(() => {
    if (!now) return {
        activeClients: 0,
        newClientsThisMonth: 0,
        projectedRevenue: 0,
        revenueDiff: 0,
        newClientsDiff: 0,
        averageTicket: 0,
        conversionRate: 0,
        collectionRate: 0,
        newLeadsThisMonth: 0,
        leadsDiff: 0
    };

    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(lastMonthStart);

    const activeClients = clientes.filter((c) => c.estado === 'activo').length;
    const newClientsThisMonth = clientes.filter(c => isWithinInterval(parseISO(c.fechaInicio), { start: thisMonthStart, end: thisMonthEnd })).length;
    const newClientsLastMonth = clientes.filter(c => isWithinInterval(parseISO(c.fechaInicio), { start: lastMonthStart, end: lastMonthEnd })).length;
    
    const newLeadsThisMonth = leads.filter(l => isWithinInterval(parseISO(l.fechaCreacion), { start: thisMonthStart, end: thisMonthEnd })).length;
    const newLeadsLastMonth = leads.filter(l => isWithinInterval(parseISO(l.fechaCreacion), { start: lastMonthStart, end: lastMonthEnd })).length;

    const paidPagos = pagos.filter(p => p.estado === 'pagado');
    const averageTicket = paidPagos.length > 0 ? paidPagos.reduce((sum, p) => sum + p.monto, 0) / paidPagos.length : 0;

    const totalLeads = leads.length;
    const convertedLeads = leads.filter(l => l.estado === 'convertido').length;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    const calculateProjectedRevenue = (start: Date, end: Date) => {
        const revenue = pagos
            .filter(p => p.estado === 'pagado' && p.fechaPago && isWithinInterval(parseISO(p.fechaPago), { start, end }))
            .reduce((sum, p) => sum + p.monto, 0);

        let pendingMonto = pagos
            .filter(p => p.estado === 'pendiente' && isWithinInterval(parseISO(p.fechaLimite), { start, end }))
            .reduce((sum, p) => sum + p.monto, 0);

        clientes.forEach(cl => {
            if (cl.estado === 'activo' && cl.diaDePago && cl.cuotaMensual && cl.cuotaMensual > 0) {
                const paymentDate = new Date(start.getFullYear(), start.getMonth(), cl.diaDePago);
                if (isWithinInterval(paymentDate, { start, end })) {
                    const exists = pagos.some(p =>
                        p.clienteId === cl.id && p.concepto === 'Mensualidad' &&
                        parseISO(p.fechaLimite).getMonth() === start.getMonth()
                    );
                    if (!exists) pendingMonto += cl.cuotaMensual;
                }
            }
        });
        
        const totalProjected = revenue + pendingMonto;
        const collection = totalProjected > 0 ? (revenue / totalProjected) * 100 : 0;
        return { total: totalProjected, collection };
    };

    const currentMonthRevenue = calculateProjectedRevenue(thisMonthStart, thisMonthEnd);
    const lastMonthRevenue = calculateProjectedRevenue(lastMonthStart, lastMonthEnd);

    return {
        activeClients,
        newClientsThisMonth,
        projectedRevenue: currentMonthRevenue.total,
        revenueDiff: currentMonthRevenue.total - lastMonthRevenue.total,
        newClientsDiff: newClientsThisMonth - newClientsLastMonth,
        averageTicket,
        conversionRate,
        collectionRate: currentMonthRevenue.collection,
        newLeadsThisMonth,
        leadsDiff: newLeadsThisMonth - newLeadsLastMonth
    };
  }, [now, clientes, pagos, leads]);

  const timelineItems: TimelineItem[] = [];
  const completedItems: TimelineItem[] = [];

  if (now) {
    const getEffectiveStatus = (l: LlamadaAgendada): LlamadaEstado => {
      const callDate = parseISO(l.fecha);
      if (l.estado === 'pronto' && (isToday(callDate) || isPast(callDate))) return 'pendiente';
      return l.estado;
    };

    llamadas.forEach(l => {
        const effectiveStatus = getEffectiveStatus(l);
        const callDate = parseISO(l.fecha);
        if (effectiveStatus === 'pronto' || effectiveStatus === 'pendiente') {
            timelineItems.push({ date: callDate, type: 'llamada', subType: isBefore(callDate, now) ? 'overdue' : 'upcoming', data: l, cliente: { nombre: l.nombre } });
        } else if (effectiveStatus === 'realizada') {
          completedItems.push({ date: callDate, type: 'llamada', subType: 'completed', data: l, cliente: { nombre: l.nombre } });
        }
    });

    pagos.forEach(p => {
      const cliente = clientes.find(c => c.id === p.clienteId);
      if (cliente && cliente.estado === 'activo') {
        if (p.estado === 'pendiente') {
          const dueDate = parseISO(p.fechaLimite);
          timelineItems.push({ date: dueDate, type: 'pago', subType: isBefore(dueDate, now) ? 'overdue' : 'upcoming', data: p, cliente: cliente });
        } else if (p.estado === 'pagado' && p.fechaPago) {
          completedItems.push({ date: parseISO(p.fechaPago), type: 'pago', subType: 'completed', data: p, cliente: cliente });
        }
      }
    });

    clientes.forEach(cl => {
      if (cl.estado === 'activo' && cl.proyecto) {
        if (cl.proyecto.estado === 'en-progreso') {
          timelineItems.push({ date: parseISO(cl.proyecto.fechaEntrega), type: 'entrega', subType: isBefore(parseISO(cl.proyecto.fechaEntrega), now) ? 'overdue' : 'upcoming', data: cl.proyecto, cliente: cl });
        } else if (cl.proyecto.estado === 'completado' && cl.proyecto.fechaEntrega) {
          completedItems.push({ date: parseISO(cl.proyecto.fechaEntrega), type: 'entrega', subType: 'completed', data: cl.proyecto, cliente: cl });
        }
      }
    });
  }
  
  const sortedTimeline = timelineItems.sort((a, b) => a.date.getTime() - b.date.getTime());
  const sortedCompleted = completedItems.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  const last4Months = now ? Array.from({ length: 4 }).map((_, i) => subMonths(now, 3 - i)) : [];
  const monthlyRevenue = last4Months.map(monthDate => ({ 
    month: format(monthDate, 'MMM', { locale: es }), 
    ingresos: pagos.filter(p => p.estado === 'pagado' && p.fechaPago && isWithinInterval(parseISO(p.fechaPago), { start: startOfMonth(monthDate), end: endOfMonth(monthDate) })).reduce((sum, p) => sum + p.monto, 0) 
  }));
  const newClientsByMonth = last4Months.map(monthDate => ({ 
    month: format(monthDate, 'MMM', { locale: es }), 
    clientes: clientes.filter(c => c.fechaInicio && isWithinInterval(parseISO(c.fechaInicio), { start: startOfMonth(monthDate), end: endOfMonth(monthDate) })).length 
  }));

  if (clientesLoading || pagosLoading || llamadasLoading || leadsLoading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
  }

  const capitalizedMonthName = now ? format(now, 'MMMM', { locale: es }).replace(/^\w/, (c) => c.toUpperCase()) : '';

  return (
    <div className="space-y-6 animate-in fade-in duration-1000 pb-20">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden group border-white/5">
            <Users className="absolute -right-4 -bottom-4 h-24 w-24 text-white opacity-[0.03] transition-transform duration-500 group-hover:scale-110" />
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Clientes Activos</CardTitle>
              <div className="p-1.5 rounded-full bg-white/5 border border-white/5">
                <Users className="h-3 w-3 text-status-active" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-2">
              <div className="text-3xl font-bold tracking-tighter text-white">{kpiData.activeClients}</div>
              <p className="text-[10px] text-muted-foreground/60 flex items-center mt-1 font-medium">
                <StatusBadge status="activo" />
                <span className="ml-2">en operación</span>
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group border-white/5">
            <DollarSign className="absolute -right-4 -bottom-4 h-24 w-24 text-white opacity-[0.03] transition-transform duration-500 group-hover:scale-110" />
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Ingresos {capitalizedMonthName}</CardTitle>
              <div className="p-1.5 rounded-full bg-white/5 border border-white/5">
                <DollarSign className="h-3 w-3 text-status-success" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-2">
              <div className="text-3xl font-bold tracking-tighter text-white">{formatCurrency(kpiData.projectedRevenue)}</div>
              <p className={cn("text-[10px] font-bold flex items-center mt-1", kpiData.revenueDiff >= 0 ? "text-emerald-500" : "text-rose-500")}>
                {kpiData.revenueDiff >= 0 ? <ArrowUp className="h-2.5 w-2.5 mr-0.5" /> : <ArrowDown className="h-2.5 w-2.5 mr-0.5" />}
                {formatCurrency(Math.abs(kpiData.revenueDiff))} vs mes anterior
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group border-white/5">
            <ClipboardCheck className="absolute -right-4 -bottom-4 h-24 w-24 text-white opacity-[0.03] transition-transform duration-500 group-hover:scale-110" />
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Entregas de {capitalizedMonthName}</CardTitle>
              <div className="p-1.5 rounded-full bg-white/5 border border-white/5">
                <ClipboardCheck className="h-3 w-3 text-status-warning" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-2">
              <div className="text-3xl font-bold tracking-tighter text-white">{kpiData.newClientsThisMonth}</div>
              <p className={cn("text-[10px] font-bold flex items-center mt-1", kpiData.newClientsDiff >= 0 ? "text-emerald-500" : "text-rose-500")}>
                {kpiData.newClientsDiff >= 0 ? <ArrowUp className="h-2.5 w-2.5 mr-0.5" /> : <ArrowDown className="h-2.5 w-2.5 mr-0.5" />}
                {Math.abs(kpiData.newClientsDiff)} nuevos proyectos
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group border-white/5">
            <Target className="absolute -right-4 -bottom-4 h-24 w-24 text-white opacity-[0.03] transition-transform duration-500 group-hover:scale-110" />
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Leads del Mes</CardTitle>
              <div className="p-1.5 rounded-full bg-white/5 border border-white/5">
                <Target className="h-3 w-3 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-2">
              <div className="text-3xl font-bold tracking-tighter text-white">{kpiData.newLeadsThisMonth}</div>
              <p className={cn("text-[10px] font-bold flex items-center mt-1", kpiData.leadsDiff >= 0 ? "text-emerald-500" : "text-rose-500")}>
                {kpiData.leadsDiff >= 0 ? <ArrowUp className="h-2.5 w-2.5 mr-0.5" /> : <ArrowDown className="h-2.5 w-2.5 mr-0.5" />}
                {Math.abs(kpiData.leadsDiff)} prospectos nuevos
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-1">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-sm font-bold">Consola</CardTitle>
                <CardDescription className="text-[9px]">Eventos y fechas límites.</CardDescription>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/5 border border-white/10">
                <Label htmlFor="console-toggle" className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  {consoleView === 'upcoming' ? 'Próximos' : 'Registro'}
                </Label>
                <Switch 
                  id="console-toggle" 
                  checked={consoleView === 'completed'} 
                  onCheckedChange={(checked) => setConsoleView(checked ? 'completed' : 'upcoming')} 
                />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-2 pt-4">
              <ScrollArea className="h-[360px] custom-scrollbar">
                <div className="space-y-1.5 pr-3">
                  {(consoleView === 'upcoming' ? sortedTimeline : sortedCompleted).slice(0, visibleTimeline).map((item, index) => (
                    <div key={index} onClick={() => handleItemClick(item)} className="flex items-start gap-2.5 cursor-pointer hover:bg-white/5 p-1.5 rounded-lg transition-all duration-300 border border-transparent hover:border-white/5">
                      <div className="mt-0.5 p-1.5 rounded-md bg-white/5">
                        {item.type === 'pago' ? <DollarSign className="h-3 w-3 text-white" /> : item.type === 'entrega' ? <ClipboardCheck className="h-3 w-3 text-white" /> : <CalendarDays className="h-3 w-3 text-white" />}
                      </div>
                      <div className="flex-1 space-y-0.5 overflow-hidden">
                        <div className="flex flex-wrap items-center justify-between gap-x-2">
                          <p className="text-[11px] font-medium leading-tight truncate pr-2 text-white">
                            {item.type === 'pago' ? `${item.data.concepto}: ${formatCurrency(item.data.monto)}` : item.type === 'entrega' ? `Entrega: ${item.data.nombre}` : `Llamada: ${item.data.nombre}`}
                          </p>
                          {item.subType === 'overdue' && <StatusBadge status="vencido" />}
                        </div>
                        <p className="text-[9px] text-muted-foreground">
                          <span className={item.subType === 'overdue' ? 'text-rose-500 font-medium' : ''}>
                            {consoleView === 'upcoming' ? formatDate(item.date, "d MMM, yyyy") : formatRelativeTime(item.date)}
                          </span> 
                          {' • '} 
                          {item.cliente?.nombre}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(consoleView === 'upcoming' ? sortedTimeline : sortedCompleted).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-20 opacity-50">No hay eventos para mostrar.</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            {visibleTimeline < (consoleView === 'upcoming' ? sortedTimeline : sortedCompleted).length && (
              <CardFooter className="justify-center border-t border-white/5 p-1.5">
                <Button variant="ghost" size="sm" className="h-6 text-[9px]" onClick={() => setVisibleTimeline(v => v + 40)}>Cargar más</Button>
              </CardFooter>
            )}
          </Card>

          <Card className="xl:col-span-2 flex flex-col"><CardHeader className="p-4 pb-0 text-center"><CardTitle className="text-sm font-bold">Estadísticas de Rendimiento</CardTitle><CardDescription className="text-[9px]">Análisis profundo de crecimiento y eficiencia.</CardDescription></CardHeader><CardContent className="flex-1 flex flex-col justify-between p-4 pt-6 space-y-6"><div className="flex-1 grid gap-6 md:grid-cols-2 items-stretch"><div className="flex flex-col space-y-3"><h4 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 text-center">Ingresos Mensuales (MXN)</h4><ChartContainer config={{ingresos:{label:"Ingresos",color:"hsl(var(--chart-1))"}}} className="w-full h-56">
                <BarChart data={monthlyRevenue} margin={{ top: 5, right: 15, left: 15, bottom: 0 }}>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={5} fontSize={8} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tickFormatter={(v) => `$${v/1000}k`} tickLine={false} axisLine={false} fontSize={8} width={45} stroke="hsl(var(--muted-foreground))" />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" className="bg-background/90 border-border" />} />
                  <Bar dataKey="ingresos" fill="var(--color-ingresos)" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ChartContainer></div><div className="flex flex-col space-y-3"><h4 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 text-center">Nuevos Clientes (Altas)</h4><ChartContainer config={{clientes:{label:"Clientes",color:"hsl(var(--chart-2))"}}} className="w-full h-56">
                <BarChart data={newClientsByMonth} margin={{ top: 5, right: 15, left: 15, bottom: 0 }}>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={5} fontSize={8} stroke="hsl(var(--muted-foreground))" />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={8} width={25} stroke="hsl(var(--muted-foreground))" />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" className="bg-background/90 border-border" />} />
                  <Bar dataKey="clientes" fill="var(--color-clientes)" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ChartContainer></div></div><div className="pt-2"><Separator className="bg-white/5 mb-6" /><div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center"><div className="flex flex-col items-center space-y-1.5"><div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.15em] text-muted-foreground/50 font-bold"><TrendingUp className="h-3 w-3 text-status-active" /> Ticket Promedio</div><p className="text-[13px] font-bold text-white tracking-tight">{formatCurrency(kpiData.averageTicket)}</p></div><div className="flex flex-col items-center space-y-1.5"><div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.15em] text-muted-foreground/50 font-bold"><DollarSign className="h-3 w-3 text-status-success" /> Proyección Anual</div><p className="text-[13px] font-bold text-white tracking-tight">{formatCurrency(kpiData.projectedRevenue * 12)}</p></div><div className="flex flex-col items-center space-y-1.5"><div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.15em] text-muted-foreground/50 font-bold"><Target className="h-3 w-3 text-status-warning" /> Conversión</div><p className="text-[13px] font-bold text-white tracking-tight">{kpiData.conversionRate.toFixed(1)}%</p></div><div className="flex flex-col items-center space-y-1.5"><div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.15em] text-muted-foreground/50 font-bold"><HandCoins className="h-3 w-3 text-emerald-400" /> Tasa de Cobro</div><p className="text-[13px] font-bold text-white tracking-tight">{kpiData.collectionRate.toFixed(1)}%</p></div></div></div></CardContent></Card>
        </div>

        <Card className="w-full">
          <CardHeader className="p-3 pb-2 border-b border-white/5">
            <CardTitle className="text-xs font-bold flex items-center gap-2">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent className="p-4 overflow-hidden">
            <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar py-2">
              {sortedCompleted.length > 0 ? sortedCompleted.map((item, index) => (
                <React.Fragment key={index}>
                  <div className="flex-1 min-w-[240px] p-4 flex flex-col gap-1.5 transition-all duration-300 hover:bg-white/15 bg-white/10 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md cursor-pointer" onClick={() => handleItemClick(item)}>
                    <div className="flex items-center gap-2 text-white">
                      <CheckCircle className="h-3.5 w-3.5 text-status-success" />
                      <span className="text-[10px] font-bold truncate">{item.type === 'pago' ? `Pago: ${item.data.concepto}` : item.type === 'entrega' ? `Entrega: ${item.data.nombre}` : `Llamada: ${item.data.nombre}`}</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground/80 line-clamp-2 leading-relaxed">{item.type === 'pago' ? `${item.cliente?.nombre} liquidó ${formatCurrency(item.data.monto)}.` : item.type === 'entrega' ? `Se completó satisfactoriamente el proyecto para ${item.cliente?.nombre}.` : `Llamada finalizada con ${item.data.nombre}.`}</p>
                    <span className="text-[8px] text-muted-foreground/40 font-semibold uppercase mt-1">{formatRelativeTime(item.date)}</span>
                  </div>
                  {index !== sortedCompleted.length - 1 && <DotDivider />}
                </React.Fragment>
              )) : (
                <div className="w-full py-4 text-center text-[10px] text-muted-foreground/40 uppercase tracking-widest font-bold">No hay actividad registrada recientemente</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={isPagoDetailOpen} onOpenChange={setPagoDetailOpen}>{selectedPago && <PagoDetail pago={selectedPago} onOpenCliente={(id) => { setSelectedClienteId(id); setPagoDetailOpen(false); }} onToggleStatus={() => setPagoDetailOpen(false)} onEditRequest={() => setPagoDetailOpen(false)} />}</Dialog>
        <Dialog open={!!selectedClienteId} onOpenChange={(o) => !o && setSelectedClienteId(undefined)}>{selectedClienteId && <ClienteDetail cliente={clientes.find(c => c.id === selectedClienteId)!} clientes={clientes} onEditRequest={() => setSelectedClienteId(undefined)} onUpdateCliente={updateCliente} />}</Dialog>
        <Dialog open={isAgendaDetailOpen} onOpenChange={setAgendaDetailOpen}>{selectedLlamada && <AgendaDetail llamada={selectedLlamada} onSetStatus={() => setAgendaDetailOpen(false)} />}</Dialog>
    </div>
  );
}
