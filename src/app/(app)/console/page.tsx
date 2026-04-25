'use client';
import { useClientes } from '@/hooks/useClientes';
import { usePagos } from '@/hooks/usePagos';
import { useAgenda } from '@/hooks/useAgenda';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { DollarSign, ClipboardCheck, CheckCircle, CalendarDays, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { isBefore, parseISO, addMonths, startOfToday, isToday, isPast, startOfMonth } from 'date-fns';
import { useEffect, useState } from 'react';
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

export default function ConsolePage() {
  const { clientes, getClienteById, updateCliente, loading: clientesLoading } = useClientes();
  const { pagos, updatePago, loading: pagosLoading } = usePagos();
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
      case 'pago': return <DollarSign className="h-4 w-4 text-muted-foreground" />;
      case 'entrega': return <ClipboardCheck className="h-4 w-4 text-muted-foreground" />;
      case 'llamada': return <CalendarDays className="h-4 w-4 text-muted-foreground" />;
      default: return null;
    }
  }
  
  const renderTimelineItem = (item: TimelineItem, index: number) => (
      <div 
        key={`${item.type}-${item.data.id}-${index}`}
        onClick={() => handleItemClick(item)} 
        className="flex items-start gap-4 cursor-pointer hover:bg-muted/50 p-2 -m-2 rounded-lg transition-colors"
      >
          <TimelineIcon type={item.type} subType={item.subType} />
          <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium leading-none">
                    {item.type === 'pago' && `${item.data.concepto}: ${formatCurrency(item.data.monto)}`}
                    {item.type === 'entrega' && `Entrega: ${item.data.nombre}`}
                    {item.type === 'llamada' && `Llamada: ${item.data.nombre}`}
                </p>
                {item.subType === 'overdue' && <StatusBadge status="vencido" />}
              </div>
              <p className="text-sm text-muted-foreground">
                  <span className={item.subType === 'overdue' ? 'text-status-danger font-medium' : ''}>
                    {item.subType === 'completed' 
                      ? `Completado ${formatRelativeTime(item.date)}`
                      : formatDate(item.date, "d MMM, yyyy")
                    }
                  </span>
                  {' • '}
                  {item.cliente?.nombre}
              </p>
          </div>
      </div>
  );

  const isLoading = clientesLoading || pagosLoading || llamadasLoading;

  return (
    <>
      <PageHeader
        title="Consola"
        description="Un registro cronológico de todos los eventos importantes."
      />
       {isLoading ? (
            <div className="flex items-center justify-center h-[70vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Cargando eventos...</p>
                </div>
            </div>
        ) : (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
              <CardTitle>Eventos Próximos y Vencidos</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh] custom-scrollbar">
                  <div className="space-y-2 pr-4">
                      {now && sortedUpcoming.slice(0, visibleUpcoming).map(renderTimelineItem)}
                      {(!now || (now && sortedUpcoming.length === 0)) && (
                          <p className="text-sm text-muted-foreground text-center py-10">
                            {now ? 'No hay eventos próximos.' : 'Cargando eventos...'}
                          </p>
                      )}
                  </div>
              </ScrollArea>
            </CardContent>
            {visibleUpcoming < sortedUpcoming.length && (
              <CardFooter className="justify-center pt-4">
                <Button onClick={() => setVisibleUpcoming(v => v + 40)}>Cargar más</Button>
              </CardFooter>
            )}
        </Card>
        <Card>
            <CardHeader>
              <CardTitle>Registro de Actividad</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh] custom-scrollbar">
                  <div className="space-y-2 pr-4">
                      {now && sortedCompleted.slice(0, visibleCompleted).map(renderTimelineItem)}
                      {(!now || (now && sortedCompleted.length === 0)) && (
                          <p className="text-sm text-muted-foreground text-center py-10">
                            {now ? 'No hay eventos completados.' : 'Cargando eventos...'}
                          </p>
                      )}
                  </div>
              </ScrollArea>
            </CardContent>
            {visibleCompleted < sortedCompleted.length && (
              <CardFooter className="justify-center pt-4">
                <Button onClick={() => setVisibleCompleted(v => v + 40)}>Cargar más</Button>
              </CardFooter>
            )}
        </Card>
      </div>
      )}

      {/* Dialogs */}
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
    </>
  );
}
