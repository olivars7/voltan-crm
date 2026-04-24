'use client';
import { useClientes } from '@/hooks/useClientes';
import { usePagos } from '@/hooks/usePagos';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { DollarSign, ClipboardCheck, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { isBefore, parseISO, addMonths, isWithinInterval, startOfToday, startOfMonth } from 'date-fns';
import { useEffect, useState } from 'react';
import { type Cliente, type Pago } from '@/lib/types';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PagoDetail } from '@/components/pagos/PagoDetail';
import { ClienteDetail } from '@/components/clientes/ClienteDetail';
import { PageHeader } from '@/components/shared/PageHeader';
import { ClienteForm } from '@/components/clientes/ClienteForm';
import { PagoForm } from '@/components/pagos/PagoForm';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';

type TimelineItem = {
  date: Date;
  type: 'pago' | 'entrega';
  subType: 'upcoming' | 'overdue' | 'completed';
  data: any;
  cliente: any;
}

export default function ConsolePage() {
  const { clientes, getClienteById, updateCliente } = useClientes();
  const { pagos, updatePago } = usePagos();
  const [now, setNow] = useState<Date | null>(null);
  
  const { toast } = useToast();
  
  // State for dialogs
  const [isPagoDetailOpen, setPagoDetailOpen] = useState(false);
  const [isClienteFormOpen, setClienteFormOpen] = useState(false);
  const [isPagoFormOpen, setPagoFormOpen] = useState(false);

  const [selectedPago, setSelectedPago] = useState<Pago | undefined>(undefined);
  const [selectedClienteId, setSelectedClienteId] = useState<string | undefined>(undefined);
  const [editingCliente, setEditingCliente] = useState<Cliente | undefined>(undefined);
  const [editingPago, setEditingPago] = useState<Pago | undefined>(undefined);
  
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

  const handleOpenClienteDetail = (clienteId: string) => {
    setSelectedClienteId(clienteId);
  }

  const handleToggleStatusFromDetail = (pago: Pago) => {
    if (pago.estado === 'pendiente') {
      const updatedPago = { ...pago, estado: 'pagado' as const, fechaPago: new Date().toISOString() };
      updatePago(updatedPago);
      toast({ title: "Pago actualizado", description: "El pago ha sido marcado como pagado." });
      setSelectedPago(updatedPago);
    } else {
      const { fechaPago, ...rest } = pago;
      const updatedPago = { ...rest, estado: 'pendiente' as const };
      updatePago(updatedPago);
      toast({ title: "Pago actualizado", description: "El pago ha sido marcado como pendiente." });
      setSelectedPago(updatedPago);
    }
    setPagoDetailOpen(false);
  }

  const handleOpenClienteFromPago = (clienteId: string) => {
    setSelectedClienteId(clienteId);
    setPagoDetailOpen(false);
  }

  const handleOpenEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setSelectedClienteId(undefined);
    setClienteFormOpen(true);
  }

  const handleEditClienteSubmit = (values: any) => {
    if (editingCliente) {
      const updatedData = { ...editingCliente, ...values };
      updateCliente(updatedData);
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

  const handleEditPagoSubmit = (values: any) => {
    if (editingPago) {
      const updatedData = { ...editingPago, ...values };
      updatePago(updatedData);
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
    }
  };

  const upcomingItems: TimelineItem[] = [];
  const completedItems: TimelineItem[] = [];

  if (now) {
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

        // Loop through each month from client start until today to generate historic overdue and upcoming payments
        while (isBefore(cursorDate, addMonths(startOfMonth(now), 1))) {
          const paymentDueDate = new Date(
            cursorDate.getFullYear(),
            cursorDate.getMonth(),
            paymentDay
          );

          // Only consider due dates up to the next payment cycle
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
      default: return null;
    }
  }
  
  const getPagoStatus = (pago: Pago, itemSubType: TimelineItem['subType']): 'pagado' | 'pendiente' | 'vencido' => {
    if (pago.estado === 'pagado') return 'pagado';
    if (itemSubType === 'overdue') return 'vencido';
    return 'pendiente';
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

  return (
    <>
      <PageHeader
        title="Consola"
        description="Un registro cronológico de todos los eventos importantes."
      />
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
    </>
  );
}
