'use client';
import { useClientes } from '@/hooks/useClientes';
import { usePagos } from '@/hooks/usePagos';
import { useAgenda } from '@/hooks/useAgenda';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Users, DollarSign, ClipboardCheck, RotateCw, Trash2, CalendarDays, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { isBefore, parseISO, subMonths, startOfMonth, endOfMonth, format, isWithinInterval, addMonths, isToday, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { type Cliente, type Pago, type LlamadaAgendada, type LlamadaEstado } from '@/lib/types';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PagoDetail } from '@/components/pagos/PagoDetail';
import { ClienteDetail } from '@/components/clientes/ClienteDetail';
import { ClienteForm } from '@/components/clientes/ClienteForm';
import { Button } from '@/components/ui/button';
import { PagoForm } from '@/components/pagos/PagoForm';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { AgendaDetail } from '@/components/agenda/AgendaDetail';

type TimelineItem = {
  date: Date;
  type: 'pago' | 'entrega' | 'llamada';
  subType: 'overdue' | 'upcoming';
  data: any;
  cliente: any;
}

export default function DashboardPageClient() {
  const { clientes, getClienteById, updateCliente, loading: clientesLoading, deleteAllClientes, resetClientes } = useClientes();
  const { pagos, updatePago, loading: pagosLoading, deleteAllPagos, resetPagos } = usePagos();
  const { llamadas, updateLlamada, loading: llamadasLoading, deleteAllLlamadas } = useAgenda();

  const [now, setNow] = useState<Date | null>(null);
  const [devZoneLoading, setDevZoneLoading] = useState<string | null>(null);
  
  const { toast } = useToast();
  
  const [isPagoDetailOpen, setPagoDetailOpen] = useState(false);
  const [isClienteFormOpen, setClienteFormOpen] = useState(false);
  const [isPagoFormOpen, setPagoFormOpen] = useState(false);
  const [isAgendaDetailOpen, setAgendaDetailOpen] = useState(false);

  const [selectedPago, setSelectedPago] = useState<Pago | undefined>(undefined);
  const [selectedClienteId, setSelectedClienteId] = useState<string | undefined>(undefined);
  const [editingCliente, setEditingCliente] = useState<Cliente | undefined>(undefined);
  const [editingPago, setEditingPago] = useState<Pago | undefined>(undefined);
  const [selectedLlamada, setSelectedLlamada] = useState<LlamadaAgendada | undefined>(undefined);
  const [visibleTimeline, setVisibleTimeline] = useState(40);

  useEffect(() => {
    setNow(new Date());
  }, []);

  const monthName = now ? format(now, 'MMMM', { locale: es }) : '';
  const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  
  const handleResetData = async () => {
    const isConfirmed = window.confirm(
      '¿Estás seguro de que quieres reiniciar todos los datos a su estado inicial? Esta acción eliminará todos los cambios que hayas hecho.'
    );
    if (isConfirmed) {
      setDevZoneLoading('Reiniciando datos...');
      await resetClientes();
      await resetPagos();
      await deleteAllLlamadas();
      setDevZoneLoading(null);
      toast({ title: 'Datos reiniciados', description: 'Los datos de prueba han sido cargados.' });
    }
  };

  const handleDeleteAllData = async () => {
    const isConfirmed = window.confirm(
      '¿Estás seguro de que quieres eliminar TODOS los datos de la aplicación? Esta acción es irreversible y dejará la aplicación vacía.'
    );
    if (isConfirmed) {
      setDevZoneLoading('Eliminando todos los datos...');
      await deleteAllClientes();
      await deleteAllPagos();
      await deleteAllLlamadas();
      setDevZoneLoading(null);
      toast({ title: 'Datos eliminados', description: 'La aplicación está vacía.' });
    }
  };

  const handleOpenPagoDetail = (pago: Pago) => {
    setSelectedPago(pago);
    setPagoDetailOpen(true);
  }
  
  const handleOpenAgendaDetail = (llamada: LlamadaAgendada) => {
    setSelectedLlamada(llamada);
    setAgendaDetailOpen(true);
  }

  const handleOpenClienteDetail = (clienteId: string) => {
    setSelectedClienteId(clienteId);
  }

  const handleToggleStatusFromDetail = async (pago: Pago) => {
     if (pago.estado === 'pendiente') {
      const updatedPago = { ...pago, estado: 'pagado' as const, fechaPago: new Date().toISOString() };
      await updatePago(updatedPago);
      toast({ title: "Pago actualizado", description: "El pago ha sido marcado como pagado." });
      setSelectedPago(updatedPago);
    } else {
      const { fechaPago, ...rest } = pago;
      const updatedPago = { ...rest, estado: 'pendiente' as const };
      await updatePago(updatedPago);
      toast({ title: "Pago actualizado", description: "El pago ha sido marcado como pendiente." });
      setSelectedPago(updatedPago);
    }
    setPagoDetailOpen(false);
  }

  const handleSetLlamadaStatus = async (llamada: LlamadaAgendada, status: 'realizada' | 'cancelada') => {
    const updatedLlamada = { ...llamada, estado: status };
    await updateLlamada(updatedLlamada);
    toast({ title: `Llamada ${status}`, description: "El estado de la llamada ha sido actualizado." });
    setAgendaDetailOpen(false);
  };

  const handleOpenClienteFromPago = (clienteId: string) => {
    setSelectedClienteId(clienteId);
    setPagoDetailOpen(false);
  }

  const handleOpenEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setSelectedClienteId(undefined);
    setClienteFormOpen(true);
  }

  const handleEditClienteSubmit = async (values: any) => {
    if (editingCliente) {
      const updatedData = { ...editingCliente, ...values };
      await updateCliente(updatedData);
      toast({ title: "Cliente actualizado", description: "Los datos del cliente han sido actualizados." });
      setClienteFormOpen(false);
      setEditingCliente(undefined);
    }
  };

  const handleOpenEditPago = (pago: Pago) => {
    setEditingPago(pago);
    setPagoDetailOpen(false);
    setPagoFormOpen(true);
  };

  const handleEditPagoSubmit = async (values: any) => {
    if (editingPago) {
      const updatedData = { ...editingPago, ...values };
      await updatePago(updatedData);
      toast({ title: "Pago actualizado", description: "Los datos del pago han sido actualizados." });
      if (selectedPago?.id === updatedData.id) {
          setSelectedPago(updatedData);
      }
      setPagoFormOpen(false);
      setEditingPago(undefined);
    }
  };

  const handleItemClick = (item: TimelineItem) => {
    if (item.type === 'pago') {
      handleOpenPagoDetail(item.data as Pago);
    } else if (item.type === 'entrega') {
      const cliente = clientes.find(c => c.id === item.cliente.id);
      if (cliente) {
        handleOpenClienteDetail(cliente.id);
      }
    } else if (item.type === 'llamada') {
      handleOpenAgendaDetail(item.data as LlamadaAgendada);
    }
  };

  const kpiData = React.useMemo(() => {
    if (!now) {
      return {
        activeClients: 0,
        activeClientsComparisonText: '',
        projectedRevenue: 0,
        newClientsThisMonth: 0,
        newClientsComparisonText: ''
      };
    }

    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(lastMonthStart);

    const activeClients = clientes.filter((c) => c.estado === 'activo').length;
    const newClientsThisMonth = clientes.filter(c => isWithinInterval(parseISO(c.fechaInicio), { start: thisMonthStart, end: thisMonthEnd })).length;
    const activeClientsComparisonText = `+${newClientsThisMonth} este mes`;

    const revenueThisMonth = pagos
      .filter(p => p.estado === 'pagado' && p.fechaPago && isWithinInterval(parseISO(p.fechaPago), { start: thisMonthStart, end: thisMonthEnd }))
      .reduce((sum, p) => sum + p.monto, 0);

    let pendingPaymentsThisMonth: Pago[] = [];
    pagos.forEach(p => {
        if (p.estado === 'pendiente' && isWithinInterval(parseISO(p.fechaLimite), { start: thisMonthStart, end: thisMonthEnd })) {
            pendingPaymentsThisMonth.push(p);
        }
    });
    clientes.forEach(cl => {
        if (cl.estado === 'activo' && cl.diaDePago && cl.cuotaMensual && cl.cuotaMensual > 0) {
            const paymentDay = cl.diaDePago;
            const paymentDueDateThisMonth = new Date(now.getFullYear(), now.getMonth(), paymentDay);

            if (isWithinInterval(paymentDueDateThisMonth, { start: thisMonthStart, end: thisMonthEnd })) {
                const paymentForMonthExists = pagos.some(p =>
                    p.clienteId === cl.id &&
                    p.concepto === 'Mensualidad' &&
                    parseISO(p.fechaLimite).getFullYear() === paymentDueDateThisMonth.getFullYear() &&
                    parseISO(p.fechaLimite).getMonth() === paymentDueDateThisMonth.getMonth()
                );
                if (!paymentForMonthExists) {
                    pendingPaymentsThisMonth.push({
                        id: `recurring-${cl.id}-${paymentDueDateThisMonth.toISOString()}`,
                        clienteId: cl.id,
                        monto: cl.cuotaMensual,
                        concepto: 'Mensualidad',
                        fechaLimite: paymentDueDateThisMonth.toISOString(),
                        estado: 'pendiente',
                        notas: 'Pago recurrente autogenerado.',
                    });
                }
            }
        }
    });
    const pendingAmountThisMonth = [...new Map(pendingPaymentsThisMonth.map(item => [item.id, item])).values()].reduce((sum, p) => sum + p.monto, 0);
    const projectedRevenue = revenueThisMonth + pendingAmountThisMonth;

    const newClientsLastMonth = clientes.filter(c => isWithinInterval(parseISO(c.fechaInicio), { start: lastMonthStart, end: lastMonthEnd })).length;
    const diff = newClientsThisMonth - newClientsLastMonth;
    const newClientsComparisonText = `${diff >= 0 ? '+' : ''}${diff} vs mes pasado`;

    return { activeClients, activeClientsComparisonText, projectedRevenue, newClientsThisMonth, newClientsComparisonText };
  }, [now, clientes, pagos]);


  const timelineItems: TimelineItem[] = [];
  if (now) {
    const getEffectiveStatus = (llamada: LlamadaAgendada): LlamadaEstado => {
      const callDate = parseISO(llamada.fecha);
      if (llamada.estado === 'pronto' && (isToday(callDate) || isPast(callDate))) {
        return 'pendiente';
      }
      return llamada.estado;
    };

    llamadas.forEach(l => {
        const effectiveStatus = getEffectiveStatus(l);
        const callDate = parseISO(l.fecha);
        if (effectiveStatus === 'pronto' || effectiveStatus === 'pendiente') {
            timelineItems.push({
                date: callDate,
                type: 'llamada',
                subType: isBefore(callDate, now) ? 'overdue' : 'upcoming',
                data: l,
                cliente: { nombre: l.nombre }
            });
        }
    });

    pagos.forEach(p => {
      const cliente = getClienteById(p.clienteId);
      if (cliente && cliente.estado === 'activo' && p.estado === 'pendiente') {
        const dueDate = parseISO(p.fechaLimite);
        timelineItems.push({
          date: dueDate,
          type: 'pago',
          subType: isBefore(dueDate, now) ? 'overdue' : 'upcoming',
          data: p,
          cliente: cliente,
        });
      }
    });

    clientes.forEach(cl => {
      if (cl.estado === 'activo' && cl.proyecto && cl.proyecto.estado === 'en-progreso') {
        timelineItems.push({
          date: parseISO(cl.proyecto.fechaEntrega),
          type: 'entrega',
          subType: isBefore(parseISO(cl.proyecto.fechaEntrega), now) ? 'overdue' : 'upcoming',
          data: cl.proyecto,
          cliente: cl,
        });
      }

      if (cl.estado === 'activo' && cl.diaDePago && cl.cuotaMensual && cl.cuotaMensual > 0) {
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
              const syntheticPago: Pago = {
                id: `recurring-${cl.id}-${paymentDueDate.toISOString()}`,
                clienteId: cl.id,
                monto: cl.cuotaMensual,
                concepto: 'Mensualidad',
                fechaLimite: paymentDueDate.toISOString(),
                estado: 'pendiente',
                notas: 'Pago recurrente autogenerado.',
              };
              timelineItems.push({
                date: paymentDueDate,
                type: 'pago',
                subType: isBefore(paymentDueDate, now) ? 'overdue' : 'upcoming',
                data: syntheticPago,
                cliente: cl,
              });
            }
          }
          cursorDate = addMonths(cursorDate, 1);
        }
      }
    });
  }
  
  const uniqueTimelineItems = [...new Map(timelineItems.map(item => [item.data.id || `${item.data.nombre}-${item.cliente.id}`, item])).values()];
  
  const sortedTimeline = uniqueTimelineItems.sort((a, b) => {
    if (a.subType === 'overdue' && b.subType !== 'overdue') return -1;
    if (a.subType !== 'overdue' && b.subType === 'overdue') return 1;
    return a.date.getTime() - b.date.getTime();
  });

  const last4Months = now ? Array.from({ length: 4 }).map((_, i) => subMonths(now, 3 - i)) : [];
  
  const monthlyRevenue = last4Months.map(monthDate => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    
    const revenue = pagos
      .filter(p => p.estado === 'pagado' && p.fechaPago && isWithinInterval(parseISO(p.fechaPago), { start: monthStart, end: monthEnd }))
      .reduce((sum, p) => sum + p.monto, 0);
      
    return {
      month: format(monthDate, 'MMM', { locale: es }),
      ingresos: revenue,
    };
  });

  const newClientsByMonth = last4Months.map(monthDate => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    
    const newClients = clientes
      .filter(c => c.fechaInicio && isWithinInterval(parseISO(c.fechaInicio), { start: monthStart, end: monthEnd }))
      .length;
      
    return {
      month: format(monthDate, 'MMM', { locale: es }),
      clientes: newClients,
    };
  });

  const chartConfig: ChartConfig = {
    ingresos: {
      label: "Ingresos",
      color: "hsl(var(--chart-1))",
    },
    clientes: {
      label: "Nuevos Clientes",
      color: "hsl(var(--chart-2))",
    },
  }
  
  const selectedCliente = selectedClienteId ? clientes.find(c => c.id === selectedClienteId) : undefined;

  const TimelineIcon = ({ type }: { type: TimelineItem['type'] }) => {
    switch (type) {
      case 'pago': return <DollarSign className="h-4 w-4 text-muted-foreground" />;
      case 'entrega': return <ClipboardCheck className="h-4 w-4 text-muted-foreground" />;
      case 'llamada': return <CalendarDays className="h-4 w-4 text-muted-foreground" />;
      default: return null;
    }
  }
  
  const getItemStatus = (item: TimelineItem): 'pagado' | 'pendiente' | 'vencido' | 'pronto' | 'realizada' | 'cancelada' => {
    if (item.type === 'pago') {
      if (item.data.estado === 'pagado') return 'pagado';
      if (item.subType === 'overdue') return 'vencido';
      return 'pendiente';
    }
    if (item.type === 'llamada') {
        const effectiveStatus = getEffectiveStatus(item.data);
        if (effectiveStatus === 'pendiente' && item.subType === 'overdue') return 'vencido';
        return effectiveStatus as any;
    }
    return 'pendiente';
  }


  const getEffectiveStatus = (llamada: LlamadaAgendada): LlamadaEstado => {
      if (!now) return llamada.estado;
      const callDate = parseISO(llamada.fecha);
      if (llamada.estado === 'pronto' && (isToday(callDate) || isPast(callDate))) {
        return 'pendiente';
      }
      return llamada.estado;
    };

  if (clientesLoading || pagosLoading || llamadasLoading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Cargando datos...</p>
            </div>
        </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes activos</CardTitle>
              <Users className="h-4 w-4 text-status-active" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{now ? kpiData.activeClients : '...'}</div>
              {now && <p className="text-xs text-muted-foreground">{kpiData.activeClientsComparisonText}</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos de {now ? capitalizedMonthName : '...'}</CardTitle>
              <DollarSign className="h-4 w-4 text-status-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{now ? formatCurrency(kpiData.projectedRevenue) : '...'}</div>
              <p className="text-xs text-muted-foreground">Suma de pagos y pendientes del mes.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cierres de {now ? capitalizedMonthName : '...'}</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-status-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{now ? kpiData.newClientsThisMonth : '...'}</div>
              {now && <p className="text-xs text-muted-foreground">{kpiData.newClientsComparisonText}</p>}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-1">
            <CardHeader>
              <CardTitle>Consola General</CardTitle>
              <CardDescription>Eventos importantes ordenados cronológicamente.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 custom-scrollbar">
                  <div className="space-y-2 pr-4">
                      {now && sortedTimeline.slice(0, visibleTimeline).map((item, index) => (
                          <div 
                            key={`${item.type}-${item.data.id}-${index}`}
                            onClick={() => handleItemClick(item)} 
                            className="flex items-start gap-4 cursor-pointer hover:bg-muted/50 p-2 -m-2 rounded-lg transition-colors"
                          >
                              <TimelineIcon type={item.type} />
                              <div className="flex-1 space-y-1 overflow-hidden">
                                  <div className="flex flex-wrap items-center justify-between gap-x-2">
                                    <p className="text-sm font-medium leading-none">
                                        {item.type === 'pago' && `${item.data.concepto}: ${formatCurrency(item.data.monto)}`}
                                        {item.type === 'entrega' && `Entrega: ${item.data.nombre}`}
                                        {item.type === 'llamada' && `Llamada: ${item.data.nombre}`}
                                    </p>
                                    {item.subType === 'overdue' && <StatusBadge status={getItemStatus(item)} />}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                      <span className={item.subType === 'overdue' ? 'text-status-danger font-medium' : ''}>
                                        {formatDate(item.date, "d MMM, yyyy")}
                                      </span>
                                      {' • '}
                                      {item.cliente?.nombre}
                                  </p>
                              </div>
                          </div>
                      ))}
                      {(!now || (now && sortedTimeline.length === 0)) && (
                          <p className="text-sm text-muted-foreground text-center py-10">
                            {now ? 'No hay eventos próximos.' : 'Cargando eventos...'}
                          </p>
                      )}
                  </div>
              </ScrollArea>
            </CardContent>
            {visibleTimeline < sortedTimeline.length && (
              <CardFooter className="justify-center pt-4">
                <Button onClick={() => setVisibleTimeline(v => v + 40)}>Cargar más</Button>
              </CardFooter>
            )}
          </Card>
          <Card className="xl:col-span-2">
              <CardHeader>
                  <CardTitle>Estadísticas</CardTitle>
                  <CardDescription>Rendimiento de los últimos 4 meses.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                  <Card>
                      <CardHeader>
                          <CardTitle className="text-base">Ingresos Mensuales</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <ChartContainer config={chartConfig} className="w-full h-48">
                              <BarChart accessibilityLayer data={monthlyRevenue} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                                  <YAxis tickFormatter={(value) => `$${value/1000}k`} tickLine={false} axisLine={false} fontSize={12} width={40} />
                                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" className="bg-background/80 backdrop-blur-sm" />} />
                                  <Bar dataKey="ingresos" fill="var(--color-ingresos)" radius={4} />
                              </BarChart>
                          </ChartContainer>
                      </CardContent>
                  </Card>
                  <Card>
                      <CardHeader>
                          <CardTitle className="text-base">Nuevos Clientes</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <ChartContainer config={chartConfig} className="w-full h-48">
                              <BarChart accessibilityLayer data={newClientsByMonth} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={20} />
                                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" className="bg-background/80 backdrop-blur-sm" />} />
                                  <Bar dataKey="clientes" fill="var(--color-clientes)" radius={4} />
                              </BarChart>
                          </ChartContainer>
                      </CardContent>
                  </Card>
              </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isPagoDetailOpen} onOpenChange={setPagoDetailOpen}>
        {selectedPago && <PagoDetail 
            pago={selectedPago} 
            onOpenCliente={handleOpenClienteFromPago}
            onToggleStatus={() => handleToggleStatusFromDetail(selectedPago)}
            onEditRequest={() => handleOpenEditPago(selectedPago)}
            />}
      </Dialog>
      
      <Dialog open={!!selectedClienteId} onOpenChange={(isOpen) => !isOpen && setSelectedClienteId(undefined)}>
        {selectedCliente && <ClienteDetail cliente={selectedCliente} clientes={clientes} onEditRequest={() => handleOpenEditCliente(selectedCliente)} onUpdateCliente={updateCliente} />}
      </Dialog>

      <Dialog open={isClienteFormOpen} onOpenChange={setClienteFormOpen}>
        <ClienteForm 
            cliente={editingCliente} 
            onSubmit={handleEditClienteSubmit} 
            setOpen={setClienteFormOpen}
        />
      </Dialog>

      <Dialog open={isPagoFormOpen} onOpenChange={setPagoFormOpen}>
        <PagoForm 
            pago={editingPago}
            clientes={clientes} 
            onSubmit={handleEditPagoSubmit} 
            setOpen={setPagoFormOpen}
        />
      </Dialog>
      
      <Dialog open={isAgendaDetailOpen} onOpenChange={setAgendaDetailOpen}>
        {selectedLlamada && <AgendaDetail 
          llamada={selectedLlamada}
          onSetStatus={(status) => handleSetLlamadaStatus(selectedLlamada, status)}
        />}
      </Dialog>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Zona de Desarrollador</CardTitle>
          <CardDescription>
            Acciones para ayudar durante el desarrollo.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          {devZoneLoading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-muted-foreground">{devZoneLoading}</span>
                </div>
            </div>
          )}
          <div className="flex flex-wrap items-start gap-8">
            <div>
              <Button variant="destructive" onClick={handleResetData} disabled={!!devZoneLoading}>
                <RotateCw className="mr-2 h-4 w-4" />
                Reiniciar Datos de Prueba
              </Button>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                Esto eliminará todos los datos y los restaurará a los datos de prueba iniciales.
              </p>
            </div>
            <div>
              <Button variant="destructive" onClick={handleDeleteAllData} disabled={!!devZoneLoading}>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Todos los Datos
              </Button>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                Esto eliminará permanentemente todos los datos, dejando la aplicación vacía.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
