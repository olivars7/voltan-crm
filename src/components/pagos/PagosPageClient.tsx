'use client';

import * as React from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';
import { usePagos } from '@/hooks/usePagos';
import { useClientes } from '@/hooks/useClientes';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardDescription, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PagoForm } from './PagoForm';
import { PagoDetail } from './PagoDetail';
import { ClienteDetail } from '../clientes/ClienteDetail';
import { ClienteForm } from '../clientes/ClienteForm';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Pago, Cliente } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { isBefore, parseISO, addMonths, startOfMonth } from 'date-fns';

export function PagosPageClient() {
  const { pagos, addPago, updatePago, deletePago, loading: pagosLoading } = usePagos();
  const { clientes, getClienteById, updateCliente: updateClienteData, loading: clientesLoading } = useClientes();
  const [isPagoFormOpen, setPagoFormOpen] = React.useState(false);
  const [isPagoDetailOpen, setPagoDetailOpen] = React.useState(false);
  const [isClienteFormOpen, setClienteFormOpen] = React.useState(false);

  const [selectedPago, setSelectedPago] = React.useState<Pago | undefined>(undefined);
  const [editingPago, setEditingPago] = React.useState<Pago | undefined>(undefined);
  const [selectedClienteId, setSelectedClienteId] = React.useState<string | undefined>(undefined);
  const [editingCliente, setEditingCliente] = React.useState<Cliente | undefined>(undefined);
  
  const { toast } = useToast();
  const [now, setNow] = React.useState<Date | null>(null);
  
  const [visibleProximos, setVisibleProximos] = React.useState(40);
  const [visibleVencidos, setVisibleVencidos] = React.useState(40);
  const [visibleHistorial, setVisibleHistorial] = React.useState(40);

  React.useEffect(() => {
    setNow(new Date());
  }, []);

  const handleAddSubmit = async (values: any) => {
    await addPago({ ...values, estado: 'pendiente' });
    toast({ title: "Pago registrado", description: "El nuevo pago ha sido guardado." });
    setPagoFormOpen(false);
  };

  const handleEditSubmit = async (values: any) => {
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
  
  const handleDeletePago = async () => {
    if (editingPago && !editingPago.id.startsWith('recurring-')) {
        if(window.confirm(`¿Estás seguro de que quieres eliminar este pago? Esta acción es permanente.`)){
            await deletePago(editingPago.id);
            toast({ title: "Pago eliminado", description: "El pago ha sido eliminado permanentemente." });
            setPagoFormOpen(false);
            setEditingPago(undefined);
            if (selectedPago?.id === editingPago.id) {
                setPagoDetailOpen(false);
                setSelectedPago(undefined);
            }
        }
    }
  };
  
  const handleEditClienteSubmit = async (values: any) => {
    if (editingCliente) {
      const updatedData = { ...editingCliente, ...values };
      await updateClienteData(updatedData);
      toast({ title: "Cliente actualizado", description: "Los datos del cliente han sido actualizados." });
      setClienteFormOpen(false);
      setEditingCliente(undefined);
    }
  };

  const markAsPaid = async (pago: Pago) => {
    const updated = { ...pago, estado: 'pagado' as const, fechaPago: new Date().toISOString() };
    await updatePago(updated);
    toast({ title: "Pago actualizado", description: "El pago ha sido marcado como pagado." });
    if(selectedPago?.id === pago.id) {
      setSelectedPago(updated);
    }
  }

  const markAsPending = async (pago: Pago) => {
    const { fechaPago, ...rest } = pago;
    const updated = { ...rest, estado: 'pendiente' as const };
    await updatePago(updated);
    toast({ title: "Pago actualizado", description: "El pago ha sido marcado como pendiente." });
     if(selectedPago?.id === pago.id) {
      const { fechaPago, ...restSelected } = selectedPago;
      setSelectedPago({ ...restSelected, estado: 'pendiente' });
    }
  }
  
  const handleOpenPagoDetail = (pago: Pago) => {
    setSelectedPago(pago);
    setPagoDetailOpen(true);
  }
  
  const handleToggleStatusFromDetail = (pago: Pago) => {
    if (pago.estado === 'pendiente') {
      markAsPaid(pago);
    } else {
      markAsPending(pago);
    }
    setPagoDetailOpen(false);
  }

  const handleOpenEditPago = (pago: Pago) => {
    setEditingPago(pago);
    setPagoDetailOpen(false);
    setPagoFormOpen(true);
  }
  
  const handleOpenCliente = (clienteId: string) => {
    setSelectedClienteId(clienteId);
    setPagoDetailOpen(false);
  }

  const handleOpenEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setSelectedClienteId(undefined);
    setClienteFormOpen(true);
  }

  const handleOpenNewPagoForm = () => {
    setEditingPago(undefined);
    setPagoFormOpen(true);
  }

  const pagosProximos = React.useMemo(() => {
    if (!now) return [];
    
    let proximos: Pago[] = [];

    pagos.forEach(p => {
        const cliente = getClienteById(p.clienteId);
        if (cliente && cliente.estado === 'activo' && p.estado === 'pendiente' && !isBefore(parseISO(p.fechaLimite), now)) {
            proximos.push(p);
        }
    });

    clientes.forEach(cl => {
        if (cl.estado === 'activo' && cl.diaDePago && cl.cuotaMensual && cl.cuotaMensual > 0) {
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
                  monto: cl.cuotaMensual,
                  concepto: 'Mensualidad',
                  fechaLimite: nextPaymentDate.toISOString(),
                  estado: 'pendiente',
                  notas: 'Pago recurrente autogenerado.',
              };
              if (!isBefore(nextPaymentDate, now)) {
                  proximos.push(syntheticPago);
              }
            }
        }
    });

    return proximos.sort((a,b) => parseISO(a.fechaLimite).getTime() - parseISO(b.fechaLimite).getTime());
  }, [pagos, clientes, now, getClienteById]);


  const pagosVencidos = React.useMemo(() => {
    if (!now) return [];
    
    const vencidos: Pago[] = [];

    pagos.forEach(p => {
      const cliente = getClienteById(p.clienteId);
      if (cliente && cliente.estado === 'activo' && p.estado === 'pendiente' && isBefore(parseISO(p.fechaLimite), now)) {
          vencidos.push(p);
      }
    });

    clientes.forEach(cl => {
      if (cl.estado === 'activo' && cl.diaDePago && cl.cuotaMensual && cl.cuotaMensual > 0) {
        const paymentDay = cl.diaDePago;
        let cursorDate = startOfMonth(parseISO(cl.fechaInicio));

        while (isBefore(cursorDate, now)) {
          const paymentDueDate = new Date(
            cursorDate.getFullYear(),
            cursorDate.getMonth(),
            paymentDay
          );

          if (isBefore(paymentDueDate, now)) {
            const paymentForMonthExists = pagos.some(p =>
                p.clienteId === cl.id &&
                p.concepto === 'Mensualidad' &&
                parseISO(p.fechaLimite).getFullYear() === paymentDueDate.getFullYear() &&
                parseISO(p.fechaLimite).getMonth() === paymentDueDate.getMonth()
            );

            if (!paymentForMonthExists) {
              vencidos.push({
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

    return [...new Map(vencidos.map(item => [item.id, item])).values()]
           .sort((a,b) => parseISO(a.fechaLimite).getTime() - parseISO(b.fechaLimite).getTime());
  }, [pagos, clientes, now, getClienteById]);

  const historialPagos = pagos.filter(p => p.estado === 'pagado').sort((a,b) => {
    const dateA = a.fechaPago ? parseISO(a.fechaPago) : new Date(0);
    const dateB = b.fechaPago ? parseISO(b.fechaPago) : new Date(0);
    return dateB.getTime() - dateA.getTime();
  });
  
  const selectedCliente = selectedClienteId ? clientes.find(c => c.id === selectedClienteId) : undefined;
  
  const isLoading = pagosLoading || clientesLoading;

  const PagosTable = ({ data, tableType, visibleCount }: { data: Pago[], tableType: 'proximos' | 'vencidos' | 'historial', visibleCount: number }) => {
    const isPending = tableType === 'proximos' || tableType === 'vencidos';
    return (
        <>
        {data.length === 0 && !isLoading ? (
            <p className="text-center text-muted-foreground/40 py-8 text-sm font-medium">
                No hay pagos en esta categoría.
            </p>
        ) : (
            <Table>
            <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground/60 text-[10px] uppercase font-bold tracking-wider">Cliente</TableHead>
                <TableHead className="text-muted-foreground/60 text-[10px] uppercase font-bold tracking-wider">Concepto</TableHead>
                <TableHead className="text-right text-muted-foreground/60 text-[10px] uppercase font-bold tracking-wider">Monto</TableHead>
                <TableHead className="text-muted-foreground/60 text-[10px] uppercase font-bold tracking-wider">{isPending ? 'Fecha Límite' : 'Fecha de Pago'}</TableHead>
                <TableHead className="text-muted-foreground/60 text-[10px] uppercase font-bold tracking-wider">Estado</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.slice(0, visibleCount).map((pago) => (
                    <TableRow key={pago.id} onClick={() => handleOpenPagoDetail(pago)} className="cursor-pointer border-border/50 hover:bg-accent/50 group">
                        <TableCell className="font-medium text-xs text-foreground/90">{getClienteById(pago.clienteId)?.nombre}</TableCell>
                        <TableCell className="text-muted-foreground/80 text-xs">{pago.concepto}</TableCell>
                        <TableCell className="text-right font-bold text-xs">{formatCurrency(pago.monto)}</TableCell>
                        <TableCell className="text-xs">
                        <span className={tableType === 'vencidos' ? 'text-status-danger font-bold' : 'text-muted-foreground/80'}>
                            {formatDate(isPending ? pago.fechaLimite : pago.fechaPago!)}
                        </span>
                        </TableCell>
                        <TableCell><StatusBadge status={tableType === 'vencidos' ? 'vencido' : pago.estado} /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
            </Table>
        )}
      </>
    );
  };

  return (
    <>
      <PageHeader
        title="Pagos"
        description="Gestiona los pagos de tus clientes."
      >
        <Button onClick={handleOpenNewPagoForm}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Registrar Pago
        </Button>
      </PageHeader>
      
      {isLoading ? (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : (
      <Tabs defaultValue="proximos">
        <TabsList className="bg-muted/50 border border-border p-1 mb-4 h-auto">
          <TabsTrigger value="proximos" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 text-xs">Próximos ({pagosProximos.length})</TabsTrigger>
          <TabsTrigger value="pendientes" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 text-xs">Vencidos ({pagosVencidos.length})</TabsTrigger>
          <TabsTrigger value="historial" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 text-xs">Historial ({historialPagos.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="proximos">
            <Card className="border-border/50 bg-background/40">
                <CardHeader>
                    <CardTitle className="text-lg">Pagos Próximos</CardTitle>
                    <CardDescription>Pagos programados y recurrentes que aún no han vencido.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PagosTable data={pagosProximos} tableType="proximos" visibleCount={visibleProximos} />
                </CardContent>
                {visibleProximos < pagosProximos.length && (
                  <CardFooter className="justify-center pt-4 border-t border-border/50">
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setVisibleProximos(v => v + 40)}>Cargar más</Button>
                  </CardFooter>
                )}
            </Card>
        </TabsContent>
        <TabsContent value="pendientes">
            <Card className="border-border/50 bg-background/40">
                <CardHeader>
                    <CardTitle className="text-lg">Pagos Vencidos</CardTitle>
                    <CardDescription>Pagos que no se han cubierto y su fecha límite ya pasó.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PagosTable data={pagosVencidos} tableType="vencidos" visibleCount={visibleVencidos} />
                </CardContent>
                 {visibleVencidos < pagosVencidos.length && (
                  <CardFooter className="justify-center pt-4 border-t border-border/50">
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setVisibleVencidos(v => v + 40)}>Cargar más</Button>
                  </CardFooter>
                )}
            </Card>
        </TabsContent>
        <TabsContent value="historial">
            <Card className="border-border/50 bg-background/40">
                <CardHeader>
                    <CardTitle className="text-lg">Historial de Pagos</CardTitle>
                    <CardDescription>Un registro de todos los pagos realizados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PagosTable data={historialPagos} tableType="historial" visibleCount={visibleHistorial} />
                </CardContent>
                {visibleHistorial < historialPagos.length && (
                  <CardFooter className="justify-center pt-4 border-t border-border/50">
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setVisibleHistorial(v => v + 40)}>Cargar más</Button>
                  </CardFooter>
                )}
            </Card>
        </TabsContent>
      </Tabs>
      )}

      <Dialog open={isPagoFormOpen} onOpenChange={setPagoFormOpen}>
        <PagoForm 
            pago={editingPago}
            clientes={clientes} 
            onSubmit={editingPago ? handleEditSubmit : handleAddSubmit} 
            onDelete={handleDeletePago}
            setOpen={setPagoFormOpen}
        />
      </Dialog>
      
      <Dialog open={isPagoDetailOpen} onOpenChange={setPagoDetailOpen}>
        {selectedPago && <PagoDetail 
            pago={selectedPago} 
            onOpenCliente={handleOpenCliente}
            onToggleStatus={() => handleToggleStatusFromDetail(selectedPago)}
            onEditRequest={() => handleOpenEditPago(selectedPago)}
            />}
      </Dialog>
      
      <Dialog open={!!selectedClienteId} onOpenChange={(isOpen) => !isOpen && setSelectedClienteId(undefined)}>
        {selectedCliente && <ClienteDetail cliente={selectedCliente} clientes={clientes} onEditRequest={() => handleOpenEditCliente(selectedCliente)} onUpdateCliente={updateClienteData} />}
      </Dialog>

      <Dialog open={isClienteFormOpen} onOpenChange={setClienteFormOpen}>
        <ClienteForm 
            cliente={editingCliente} 
            onSubmit={handleEditClienteSubmit} 
            setOpen={setClienteFormOpen}
        />
      </Dialog>
    </>
  );
}
