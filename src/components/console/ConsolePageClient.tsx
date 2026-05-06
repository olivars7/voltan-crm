'use client';
import { useClientes } from '@/hooks/useClientes';
import { usePagos } from '@/hooks/usePagos';
import { useAgenda } from '@/hooks/useAgenda';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { DollarSign, ClipboardCheck, CheckCircle, CalendarDays, Loader2, Info, TrendingUp, HandCoins, Target, History } from 'lucide-react';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { isBefore, parseISO, addMonths, startOfToday, isToday, isPast, startOfMonth, isWithinInterval, endOfMonth, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEffect, useState, useMemo } from 'react';
import { type Cliente, type Pago, type LlamadaAgendada, type LlamadaEstado } from '@/lib/types';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PagoDetail } from '@/components/pagos/PagoDetail';
import { ClienteDetail } from '@/components/clientes/ClienteDetail';
import { PageHeader } from '@/components/shared/PageHeader';
import { ClienteForm } from '@/components/clientes/ClienteForm';
import { PagoForm } from '@/components/pagos/PagoForm';
import { AgendaDetail } from '@/components/agenda/AgendaDetail';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';

type TimelineItem = {
  date: Date;
  type: 'pago' | 'entrega' | 'llamada';
  subType: 'upcoming' | 'overdue' | 'completed';
  data: any;
  cliente: any;
}

export default function ConsolePageClient() {
  const { clientes, getClienteById, updateCliente, deleteCliente, loading: clientesLoading } = useClientes();
  const { pagos, updatePago, deletePago, loading: pagosLoading } = usePagos();
  const { llamadas, updateLlamada, loading: llamadasLoading } = useAgenda();
  const [now, setNow] = useState<Date | null>(null);
  
  const { toast } = useToast();
  
  // State for dialogs
  const [isPagoDetailOpen, setPagoDetailOpen] = useState(false);
  const [isClienteFormOpen, setClienteFormOpen] = useState(false);
  const [isPagoFormOpen, setPagoFormOpen] = useState(false);
  const [isAgendaDetailOpen, setAgendaDetailOpen] = useState(false);

  const [selectedPago, setSelectedPago] = useState<Pago | undefined>(undefined);
  const [selectedClienteId, setSelectedClienteId] = useState<string | undefined>(undefined);
  const [editingCliente, setEditingCliente] = useState<Cliente | undefined>(undefined);
  const [editingPago, setEditingPago] = useState<Pago | undefined>(undefined);
  const [selectedLlamada, setSelectedLlamada] = useState<LlamadaAgendada | undefined>(undefined);
  
  // Pagination state
  const [visibleUpcoming, setVisibleUpcoming] = useState(40);
  const [visibleCompleted, setVisibleCompleted] = useState(40);

  useEffect(() => {
    setNow(startOfToday());
  }, []);

  const monthName = now ? format(now, 'MMMM', { locale: es }) : '';
  const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  // KPI Calculations
  const stats = useMemo(() => {
    if (!now) return { deliveriesPending: 0, estimatedRevenue: 0, deliveriesCompleted: 0, currentRevenue: 0 };
    
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const deliveriesPending = clientes.filter(c => c.estado === 'activo' && c.proyecto?.estado === 'en-progreso').length;
    
    const deliveriesCompleted = clientes.filter(c => 
      c.proyecto?.estado === 'completado' && 
      c.proyecto.fechaEntrega && 
      isWithinInterval(parseISO(c.proyecto.fechaEntrega), { start: monthStart, end: monthEnd })
    ).length;

    const currentRevenue = pagos.filter(p => 
      p.estado === 'pagado' && 
      p.fechaPago && 
      isWithinInterval(parseISO(p.fechaPago), { start: monthStart, end: monthEnd })
    ).reduce((sum, p) => sum + p.monto, 0);

    let pendingTotal = pagos.filter(p => 
      p.estado === 'pendiente' && 
      isWithinInterval(parseISO(p.fechaLimite), { start: monthStart, end: monthEnd })
    ).reduce((sum, p) => sum + p.monto, 0);

    // Add synthetic recurring payments for the current month
    clientes.forEach(cl => {
      if (cl.estado === 'activo' && cl.diaDePago && cl.cuotaMensual && cl.cuotaMensual > 0) {
        const paymentDate = new Date(now.getFullYear(), now.getMonth(), cl.diaDePago);
        if (isWithinInterval(paymentDate, { start: monthStart, end: monthEnd })) {
            const exists = pagos.some(p => 
                p.clienteId === cl.id && 
                p.concepto === 'Mensualidad' && 
                parseISO(p.fechaLimite).getMonth() === now.getMonth()
            );
            if (!exists) pendingTotal += cl.cuotaMensual;
        }
      }
    });

    return {
      deliveriesPending,
      estimatedRevenue: currentRevenue + pendingTotal,
      deliveriesCompleted,
      currentRevenue
    };
  }, [now, clientes, pagos]);

  // Dialog handlers
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

  const handleDeleteCliente = async () => {
    if (editingCliente) {
      if(window.confirm(`¿Estás seguro de que quieres eliminar a ${editingCliente.nombre}? Esto eliminará también todos sus pagos asociados de forma permanente.`)){
        await deleteCliente(editingCliente.id);
        toast({ title: "Cliente eliminado", description: "El cliente y todos sus datos han sido eliminados." });
        setClienteFormOpen(false);
        setEditingCliente(undefined);
        if(selectedClienteId === editingCliente.id) {
            setSelectedClienteId(undefined);
        }
      }
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
  
  const handleDeletePago = async (pagoId?: string) => {
    const idToDelete = pagoId || editingPago?.id;
    if (idToDelete && !idToDelete.startsWith('recurring-')) {
        if(window.confirm(`¿Estás seguro de que quieres eliminar este pago? Esta acción es permanente.`)){
            await deletePago(idToDelete);
            toast({ title: "Pago eliminado", description: "El pago ha sido eliminado permanentemente." });
            setPagoFormOpen(false);
            setEditingPago(undefined);
            if (selectedPago?.id === idToDelete) {
                setPagoDetailOpen(false);
                setSelectedPago(undefined);
            }
        }
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

  const upcomingItems: TimelineItem[] = [];
  const completedItems: TimelineItem[] = [];

  if (now) {
    const getEffectiveStatus = (llamada: LlamadaAgendada): LlamadaEstado => {
      const callDate = parseISO(llamada.fecha);
      if (llamada.estado === 'pronto' && (isToday(callDate) || isPast(callDate))) {
        return 'pendiente';
      }
      return llamada.estado;
    };

    // Process calls
    llamadas.forEach(l => {
      const effectiveStatus = getEffectiveStatus(l);
      const callDate = parseISO(l.fecha);
      if (effectiveStatus === 'pronto' || effectiveStatus === 'pendiente') {
          upcomingItems.push({
              date: callDate,
              type: 'llamada',
              subType: isBefore(callDate, now) ? 'overdue' : 'upcoming',
              data: l,
              cliente: { nombre: l.nombre } // Mock client for display consistency
          });
      } else { // 'realizada' or 'cancelada'
          completedItems.push({
              date: callDate,
              type: 'llamada',
              subType: 'completed',
              data: l,
              cliente: { nombre: l.nombre }
          });
      }
    });

    // Process real payments
    pagos.forEach(p => {
      const cliente = getClienteById(p.clienteId);
      if (cliente && cliente.estado === 'activo') {
        if (p.estado === 'pendiente') {
          const dueDate = parseISO(p.fechaLimite);
          upcomingItems.push({
            date: dueDate,
            type: 'pago',
            subType: isBefore(dueDate, now) ? 'overdue' : 'upcoming',
            data: p,
            cliente: cliente
          });
        } else if (p.estado === 'pagado' && p.fechaPago) {
          completedItems.push({
            date: parseISO(p.fechaPago),
            type: 'pago',
            subType: 'completed',
            data: p,
            cliente: cliente
          });
        }
      }
    });

    // Process projects and synthetic recurring payments
    clientes.forEach(cl => {
      if (cl.estado === 'activo' && cl.proyecto) {
        if (cl.proyecto.estado === 'en-progreso') {
          upcomingItems.push({
            date: parseISO(cl.proyecto.fechaEntrega),
            type: 'entrega',
            subType: isBefore(parseISO(cl.proyecto.fechaEntrega), now) ? 'overdue' : 'upcoming',
            data: cl.proyecto,
            cliente: cl
          });
        } else if (cl.proyecto.estado === 'completado' && cl.proyecto.fechaEntrega) {
           completedItems.push({
            date: parseISO(cl.proyecto.fechaEntrega), 
            type: 'entrega',
            subType: 'completed',
            data: cl.proyecto,
            cliente: cl
          });
        }
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

          if (isBefore(paymentDueDate, now)) {
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
              upcomingItems.push({
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

  const sortedUpcoming = upcomingItems.sort((a, b) => {
    if (a.subType === 'overdue' && b.subType !== 'overdue') return -1;
    if (a.subType !== 'overdue' && b.subType === 'overdue') return 1;
    return a.date.getTime() - b.date.getTime();
  });
  const sortedCompleted = completedItems.sort((a, b) => b.date.getTime() - a.date.getTime());
  
  const selectedCliente = selectedClienteId ? clientes.find(c => c.id === selectedClienteId) : undefined;

  const TimelineIcon = ({ type, subType }: { type: TimelineItem['type'], subType: TimelineItem['subType'] }) => {
    if (subType === 'completed') {
      return <CheckCircle className="h-4 w-4 text-status-success" />;
    }
    switch (type) {
      case 'pago': return <DollarSign className="h-4 w-4 text-primary/80" />;
      case 'entrega': return <ClipboardCheck className="h-4 w-4 text-primary/80" />;
      case 'llamada': return <CalendarDays className="h-4 w-4 text-primary/80" />;
      default: return null;
    }
  }
  
  const renderTimelineItem = (item: TimelineItem, index: number) => (
      <div 
        key={`${item.type}-${item.data.id}-${index}`}
        onClick={() => handleItemClick(item)} 
        className="flex items-start gap-4 cursor-pointer hover:bg-white/10 p-3 rounded-xl transition-all duration-300 border border-transparent hover:border-white/10"
      >
          <div className="mt-1 p-2 rounded-lg bg-white/10 backdrop-blur-xl">
            <TimelineIcon type={item.type} subType={item.subType} />
          </div>
          <div className="flex-1 space-y-1 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-x-2">
                <p className="text-sm font-semibold leading-none truncate pr-2 text-white">
                    {item.type === 'pago' && `${item.data.concepto}: ${formatCurrency(item.data.monto)}`}
                    {item.type === 'entrega' && `Entrega: ${item.data.nombre}`}
                    {item.type === 'llamada' && `Cita: ${item.data.nombre}`}
                </p>
                {item.subType === 'overdue' && <StatusBadge status="vencido" />}
              </div>
              <p className="text-xs text-zinc-400">
                  <span className={item.subType === 'overdue' ? 'text-rose-400 font-bold' : ''}>
                    {item.subType === 'completed' 
                      ? `Completado ${formatRelativeTime(item.date)}`
                      : formatDate(item.date, "d MMM, yyyy")
                    }
                  </span>
                  {' • '}
                  <span className="text-zinc-300">{item.cliente?.nombre}</span>
              </p>
          </div>
      </div>
  );

  const isLoading = clientesLoading || pagosLoading || llamadasLoading;

  const KpiCard = ({ title, value, subtitle, icon: Icon, colorClass, highlightClass }: { title: string, value: string | number, subtitle: string, icon: any, colorClass: string, highlightClass: string }) => (
    <Card className="border-white/10 bg-zinc-950/20 backdrop-blur-3xl relative overflow-hidden group h-full">
        <div className={`absolute top-0 left-0 w-1 h-full ${highlightClass}`} />
        <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">{title}</CardTitle>
            <Icon className={`h-4 w-4 ${colorClass} opacity-80 group-hover:opacity-100 transition-opacity`} />
        </CardHeader>
        <CardContent className="p-4 pt-2">
            <div className="flex flex-col">
                <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
                <p className="text-[10px] text-muted-foreground/60 font-medium mt-1 leading-tight">{subtitle}</p>
            </div>
        </CardContent>
    </Card>
  );

  return (
    <div className="pb-20">
      <PageHeader
        title="Consola"
        description="Registro cronológico y KPIs operativos."
      />
      
      {isLoading ? (
            <div className="flex items-center justify-center h-[70vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Cargando eventos...</p>
                </div>
            </div>
        ) : (
      <div className="space-y-6">
        {/* KPI Grid - Clean Redesign */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard 
                title="Proyectos Activos" 
                value={stats.deliveriesPending} 
                subtitle="Entregas actualmente en curso"
                icon={ClipboardCheck}
                colorClass="text-primary"
                highlightClass="bg-primary/60"
            />
            <KpiCard 
                title="Proyección de Mes" 
                value={formatCurrency(stats.estimatedRevenue)} 
                subtitle="Total cobrado más adeudos"
                icon={TrendingUp}
                colorClass="text-status-active"
                highlightClass="bg-status-active/60"
            />
            <KpiCard 
                title="Cierres de Mes" 
                value={stats.deliveriesCompleted} 
                subtitle={`Éxitos logrados en ${capitalizedMonthName}`}
                icon={CheckCircle}
                colorClass="text-status-success"
                highlightClass="bg-status-success/60"
            />
            <KpiCard 
                title="Ingresos Reales" 
                value={formatCurrency(stats.currentRevenue)} 
                subtitle="Monto efectivamente liquidado"
                icon={HandCoins}
                colorClass="text-emerald-400"
                highlightClass="bg-emerald-500/60"
            />
        </div>

        {/* Console Lists */}
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-white/10 bg-zinc-950/20 backdrop-blur-3xl shadow-2xl">
                <CardHeader className="pb-2">
                <CardTitle className="text-white font-bold text-base flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-primary" /> Eventos Próximos
                </CardTitle>
                </CardHeader>
                <CardContent>
                <ScrollArea className="h-[55vh] custom-scrollbar">
                    <div className="space-y-2 pr-4">
                        {now && sortedUpcoming.slice(0, visibleUpcoming).map(renderTimelineItem)}
                        {(!now || (now && sortedUpcoming.length === 0)) && (
                            <p className="text-sm text-zinc-500 text-center py-20">
                                {now ? 'No hay eventos próximos.' : 'Cargando eventos...'}
                            </p>
                        )}
                    </div>
                </ScrollArea>
                </CardContent>
                {visibleUpcoming < sortedUpcoming.length && (
                <CardFooter className="justify-center border-t border-white/10 p-2">
                    <Button variant="ghost" size="sm" className="text-[10px] text-zinc-400 hover:text-white" onClick={() => setVisibleUpcoming(v => v + 40)}>Cargar más eventos</Button>
                </CardFooter>
                )}
            </Card>
            <Card className="border-white/10 bg-zinc-950/20 backdrop-blur-3xl shadow-2xl">
                <CardHeader className="pb-2">
                <CardTitle className="text-white font-bold text-base flex items-center gap-2">
                    <History className="w-4 h-4 text-primary" /> Registro de Actividad
                </CardTitle>
                </CardHeader>
                <CardContent>
                <ScrollArea className="h-[55vh] custom-scrollbar">
                    <div className="space-y-2 pr-4">
                        {now && sortedCompleted.slice(0, visibleCompleted).map(renderTimelineItem)}
                        {(!now || (now && sortedCompleted.length === 0)) && (
                            <p className="text-sm text-zinc-500 text-center py-20">
                                {now ? 'No hay actividad reciente.' : 'Cargando eventos...'}
                            </p>
                        )}
                    </div>
                </ScrollArea>
                </CardContent>
                {visibleCompleted < sortedCompleted.length && (
                <CardFooter className="justify-center border-t border-white/10 p-2">
                    <Button variant="ghost" size="sm" className="text-[10px] text-zinc-400 hover:text-white" onClick={() => setVisibleCompleted(v => v + 40)}>Ver historial completo</Button>
                </CardFooter>
                )}
            </Card>
        </div>
      </div>
      )}

      {/* Dialogs */}
      <Dialog open={isPagoDetailOpen} onOpenChange={setPagoDetailOpen}>
        {selectedPago && <PagoDetail pago={selectedPago} 
            onOpenCliente={handleOpenClienteFromPago}
            onToggleStatus={() => handleToggleStatusFromDetail(selectedPago)}
            onEditRequest={() => handleOpenEditPago(selectedPago)}
            onDeleteRequest={() => handleDeletePago(selectedPago.id)}
            />}
      </Dialog>
      <Dialog open={!!selectedClienteId} onOpenChange={(isOpen) => !isOpen && setSelectedClienteId(undefined)}>
        {selectedCliente && <ClienteDetail cliente={selectedCliente} clientes={clientes} onEditRequest={() => handleOpenEditCliente(selectedCliente)} onUpdateCliente={updateCliente} />}
      </Dialog>
      <Dialog open={isClienteFormOpen} onOpenChange={setClienteFormOpen}>
        <ClienteForm 
            cliente={editingCliente} 
            onSubmit={handleEditClienteSubmit} 
            onDelete={handleDeleteCliente}
            setOpen={setClienteFormOpen}
        />
      </Dialog>
      <Dialog open={isPagoFormOpen} onOpenChange={setPagoFormOpen}>
        <PagoForm 
            pago={editingPago}
            clientes={clientes} 
            onSubmit={handleEditPagoSubmit} 
            onDelete={() => handleDeletePago()}
            setOpen={setPagoFormOpen}
        />
      </Dialog>
      <Dialog open={isAgendaDetailOpen} onOpenChange={setAgendaDetailOpen}>
        {selectedLlamada && <AgendaDetail 
          llamada={selectedLlamada}
          onSetStatus={(status) => handleSetLlamadaStatus(selectedLlamada, status)}
        />}
      </Dialog>
    </div>
  );
}
