'use client';
import { useClientes } from '@/hooks/useClientes';
import { usePagos } from '@/hooks/usePagos';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, DollarSign, AlertTriangle, ClipboardCheck, RotateCw } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { isBefore, parseISO, subMonths, startOfMonth, endOfMonth, format, isWithinInterval, addMonths, addWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { type Cliente, type Pago } from '@/lib/types';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PagoDetail } from '@/components/pagos/PagoDetail';
import { ClienteDetail } from '@/components/clientes/ClienteDetail';
import { ClienteForm } from '@/components/clientes/ClienteForm';
import { Button } from '@/components/ui/button';
import { PagoForm } from '@/components/pagos/PagoForm';
import { StatusBadge } from '@/components/shared/StatusBadge';

type TimelineItem = {
  date: Date;
  type: 'pago' | 'entrega';
  subType: 'overdue' | 'upcoming';
  data: any;
  cliente: any;
}

export default function DashboardPage() {
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

  useEffect(() => {
    // This runs only on the client, after hydration
    setNow(new Date());
  }, []);
  
  const handleResetData = () => {
    const isConfirmed = window.confirm(
      '¿Estás seguro de que quieres reiniciar todos los datos a su estado inicial? Esta acción eliminará todos los cambios que hayas hecho.'
    );
    if (isConfirmed) {
      window.localStorage.removeItem('clientes');
      window.localStorage.removeItem('pagos');
      window.location.reload();
    }
  };

  // Handlers for dialogs
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


  const activeClients = clientes.filter((c) => c.estado === 'activo').length;
  
  const overduePayments: Pago[] = [];
  if (now) {
    // 1. Get real overdue payments
    pagos.forEach(p => {
      const cliente = getClienteById(p.clienteId);
      if (cliente && cliente.estado === 'activo' && p.estado === 'pendiente' && isBefore(parseISO(p.fechaLimite), now)) {
        overduePayments.push(p);
      }
    });

    // 2. Get synthetic overdue recurring payments
    clientes.forEach(cl => {
      if (cl.estado === 'activo' && cl.diaDePago && cl.cuotaMensual && cl.cuotaMensual > 0) {
        const paymentDay = cl.diaDePago;
        let cursorDate = startOfMonth(parseISO(cl.fechaInicio));

        while (isBefore(cursorDate, now)) {
          const paymentDueDate = new Date(cursorDate.getFullYear(), cursorDate.getMonth(), paymentDay);

          if (isBefore(paymentDueDate, now)) {
            const paymentForMonthExists = pagos.some(p =>
              p.clienteId === cl.id &&
              p.concepto === 'Mensualidad' &&
              parseISO(p.fechaLimite).getFullYear() === paymentDueDate.getFullYear() &&
              parseISO(p.fechaLimite).getMonth() === paymentDueDate.getMonth()
            );

            if (!paymentForMonthExists) {
              overduePayments.push({
                id: `recurring-${cl.id}-${paymentDueDate.toISOString()}`,
                clienteId: cl.id,
                monto: cl.cuotaMensual,
                concepto: 'Mensualidad',
                fechaLimite: paymentDueDate.toISOString(),
                estado: 'pendiente',
                notas: 'Pago recurrente autogenerado.',
              });
            }
          }
          cursorDate = addMonths(cursorDate, 1);
        }
      }
    });
  }
  
  const pendingPayments = [...new Map(overduePayments.map(item => [item.id, item])).values()];
  const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + p.monto, 0);

  // General Console Data
  const timelineItems: TimelineItem[] = [];
  if (now) {
    // Process real payments
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

    // Process projects and synthetic recurring payments
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

  // Statistics Data
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
      default: return null;
    }
  }
  
  const getPagoStatus = (pago: Pago, itemSubType: TimelineItem['subType']): 'pagado' | 'pendiente' | 'vencido' => {
    if (pago.estado === 'pagado') return 'pagado';
    if (itemSubType === 'overdue') return 'vencido';
    return 'pendiente';
  }


  return (
    <>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{now ? activeClients : '...'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagos Vencidos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-status-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{now ? pendingPayments.length : '...'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deuda Vencida</CardTitle>
              <DollarSign className="h-4 w-4 text-status-danger" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{now ? formatCurrency(totalPendingAmount) : '...'}</div>
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
                      {now && sortedTimeline.map((item, index) => (
                          <div 
                            key={index}
                            onClick={() => handleItemClick(item)} 
                            className="flex items-start gap-4 cursor-pointer hover:bg-muted/50 p-2 -m-2 rounded-lg transition-colors"
                          >
                              <TimelineIcon type={item.type} />
                              <div className="flex-1 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium leading-none">
                                        {item.type === 'pago' && `${item.data.concepto}: ${formatCurrency(item.data.monto)}`}
                                        {item.type === 'entrega' && `Entrega: ${item.data.nombre}`}
                                    </p>
                                    {item.subType === 'overdue' && <StatusBadge status={getPagoStatus(item.data, item.subType)} />}
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
                              <BarChart accessibilityLayer data={monthlyRevenue} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                                  <YAxis tickFormatter={(value) => `$${value/1000}k`} tickLine={false} axisLine={false} fontSize={12} />
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
                              <BarChart accessibilityLayer data={newClientsByMonth} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
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

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Zona de Desarrollador</CardTitle>
          <CardDescription>
            Acciones para ayudar durante el desarrollo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleResetData}>
            <RotateCw className="mr-2 h-4 w-4" />
            Reiniciar Datos de Prueba
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Esto eliminará todos los clientes y pagos guardados y los restaurará a los datos de prueba iniciales.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
