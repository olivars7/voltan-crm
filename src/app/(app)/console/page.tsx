'use client';
import { useClientes } from '@/hooks/useClientes';
import { usePagos } from '@/hooks/usePagos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ClipboardCheck, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { isBefore, parseISO, addMonths, isWithinInterval, startOfToday } from 'date-fns';
import { useEffect, useState } from 'react';
import { type Cliente, type Pago } from '@/lib/types';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PagoDetail } from '@/components/pagos/PagoDetail';
import { ClienteDetail } from '@/components/clientes/ClienteDetail';
import { PageHeader } from '@/components/shared/PageHeader';
import { ClienteForm } from '@/components/clientes/ClienteForm';
import { PagoForm } from '@/components/pagos/PagoForm';

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
  const [isClienteDetailOpen, setClienteDetailOpen] = useState(false);
  const [isClienteFormOpen, setClienteFormOpen] = useState(false);
  const [isPagoFormOpen, setPagoFormOpen] = useState(false);

  const [selectedPago, setSelectedPago] = useState<Pago | undefined>(undefined);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | undefined>(undefined);
  const [editingCliente, setEditingCliente] = useState<Cliente | undefined>(undefined);
  const [editingPago, setEditingPago] = useState<Pago | undefined>(undefined);

  useEffect(() => {
    setNow(startOfToday());
  }, []);

  // Dialog handlers
  const handleOpenPagoDetail = (pago: Pago) => {
    setSelectedPago(pago);
    setPagoDetailOpen(true);
  }

  const handleOpenClienteDetail = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setClienteDetailOpen(true);
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
    const cliente = getClienteById(clienteId);
    if (cliente) {
      setSelectedCliente(cliente);
      setPagoDetailOpen(false);
      setClienteDetailOpen(true);
    }
  }

  const handleOpenEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setClienteDetailOpen(false);
    setClienteFormOpen(true);
  }

  const handleEditClienteSubmit = (values: any) => {
    if (editingCliente) {
      const updatedData = { ...editingCliente, ...values };
      updateCliente(updatedData);
      toast({ title: "Cliente actualizado", description: "Los datos del cliente han sido actualizados." });
      if (selectedCliente?.id === updatedData.id) {
        setSelectedCliente(updatedData);
      }
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
      handleOpenClienteDetail(item.cliente);
    }
  };

  const upcomingItems: TimelineItem[] = [];
  const completedItems: TimelineItem[] = [];

  if (now) {
    // Process real payments
    pagos.forEach(p => {
      const cliente = getClienteById(p.clienteId);
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
    });

    // Process projects and synthetic recurring payments
    clientes.forEach(cl => {
      if (cl.proyecto) {
        if (cl.proyecto.estado === 'en-progreso') {
          upcomingItems.push({
            date: parseISO(cl.proyecto.fechaEntrega),
            type: 'entrega',
            subType: isBefore(parseISO(cl.proyecto.fechaEntrega), now) ? 'overdue' : 'upcoming',
            data: cl.proyecto,
            cliente: cl
          });
        } else if (cl.proyecto.estado === 'completado') {
          completedItems.push({
            date: parseISO(cl.proyecto.fechaEntrega), 
            type: 'entrega',
            subType: 'completed',
            data: cl.proyecto,
            cliente: cl
          });
        }
      }

      if (cl.diaDePago && cl.montoRecurrente) {
          const paymentDay = cl.diaDePago;
          let nextPaymentDate = new Date(now.getFullYear(), now.getMonth(), paymentDay);
          if (isBefore(nextPaymentDate, now)) {
              nextPaymentDate = addMonths(nextPaymentDate, 1);
          }

          const existingRecurringPayment = pagos.find(p => 
              p.clienteId === cl.id &&
              p.concepto === 'Mensualidad' &&
              parseISO(p.fechaLimite).getFullYear() === nextPaymentDate.getFullYear() &&
              parseISO(p.fechaLimite).getMonth() === nextPaymentDate.getMonth()
          );
          if (!existingRecurringPayment) {
              const syntheticPago: Pago = {
                id: `recurring-${cl.id}-${nextPaymentDate.toISOString()}`,
                clienteId: cl.id,
                monto: cl.montoRecurrente,
                concepto: 'Mensualidad',
                fechaLimite: nextPaymentDate.toISOString(),
                estado: 'pendiente',
                notas: 'Pago recurrente autogenerado.',
              };
              upcomingItems.push({
                  date: nextPaymentDate,
                  type: 'pago',
                  subType: 'upcoming',
                  data: syntheticPago,
                  cliente: cl,
              });
          }
      }
    });
  }

  const sortedUpcoming = upcomingItems.sort((a, b) => a.date.getTime() - b.date.getTime());
  const sortedCompleted = completedItems.sort((a, b) => b.date.getTime() - a.date.getTime());
  
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
  
  const renderTimelineItem = (item: TimelineItem, index: number) => (
      <div 
        key={`${item.type}-${item.data.id}-${index}`}
        onClick={() => handleItemClick(item)} 
        className="flex items-start gap-4 cursor-pointer hover:bg-muted/50 p-2 -m-2 rounded-lg transition-colors"
      >
          <TimelineIcon type={item.type} subType={item.subType} />
          <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                  {item.type === 'pago' && `${item.data.concepto}: ${formatCurrency(item.data.monto)}`}
                  {item.type === 'entrega' && `Entrega: ${item.data.nombre}`}
              </p>
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
                      {now && sortedUpcoming.map(renderTimelineItem)}
                      {(!now || (now && sortedUpcoming.length === 0)) && (
                          <p className="text-sm text-muted-foreground text-center py-10">
                            {now ? 'No hay eventos próximos.' : 'Cargando eventos...'}
                          </p>
                      )}
                  </div>
              </ScrollArea>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
              <CardTitle>Registro de Actividad</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh] custom-scrollbar">
                  <div className="space-y-2 pr-4">
                      {now && sortedCompleted.map(renderTimelineItem)}
                      {(!now || (now && sortedCompleted.length === 0)) && (
                          <p className="text-sm text-muted-foreground text-center py-10">
                            {now ? 'No hay eventos completados.' : 'Cargando eventos...'}
                          </p>
                      )}
                  </div>
              </ScrollArea>
            </CardContent>
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
      <Dialog open={isClienteDetailOpen} onOpenChange={setClienteDetailOpen}>
        {selectedCliente && <ClienteDetail cliente={selectedCliente} clientes={clientes} onEditRequest={() => handleOpenEditCliente(selectedCliente)} />}
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
