'use client';

import * as React from 'react';
import { PlusCircle } from 'lucide-react';
import { usePagos } from '@/hooks/usePagos';
import { useClientes } from '@/hooks/useClientes';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { z } from 'zod';
import { isBefore, parseISO, addMonths } from 'date-fns';

const formSchema = z.object({
  clienteId: z.string().min(1),
  monto: z.coerce.number().positive(),
  concepto: z.string().min(1),
  fechaLimite: z.string().min(1),
  notas: z.string().optional(),
});

export function PagosPageClient() {
  const { pagos, addPago, updatePago } = usePagos();
  const { clientes, getClienteById, updateCliente: updateClienteData } = useClientes();
  const [isFormOpen, setFormOpen] = React.useState(false);
  const [isPagoDetailOpen, setPagoDetailOpen] = React.useState(false);
  const [isClienteDetailOpen, setClienteDetailOpen] = React.useState(false);
  const [isClienteFormOpen, setClienteFormOpen] = React.useState(false);

  const [selectedPago, setSelectedPago] = React.useState<Pago | undefined>(undefined);
  const [selectedCliente, setSelectedCliente] = React.useState<Cliente | undefined>(undefined);
  const [editingCliente, setEditingCliente] = React.useState<Cliente | undefined>(undefined);
  
  const { toast } = useToast();
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setNow(new Date());
  }, []);

  const handleAddSubmit = (values: z.infer<typeof formSchema>) => {
    addPago(values);
    toast({ title: "Pago registrado", description: "El nuevo pago ha sido guardado." });
    setFormOpen(false);
  };
  
  const handleEditClienteSubmit = (values: any) => {
    if (editingCliente) {
      const updatedData = { ...editingCliente, ...values };
      updateClienteData(updatedData);
      toast({ title: "Cliente actualizado", description: "Los datos del cliente han sido actualizados." });
      if (selectedCliente?.id === updatedData.id) {
        setSelectedCliente(updatedData);
      }
      setClienteFormOpen(false);
      setEditingCliente(undefined);
    }
  };

  const markAsPaid = (pago: Pago) => {
    updatePago({ ...pago, estado: 'pagado', fechaPago: new Date().toISOString() });
    toast({ title: "Pago actualizado", description: "El pago ha sido marcado como pagado." });
    if(selectedPago?.id === pago.id) {
      setSelectedPago({ ...pago, estado: 'pagado', fechaPago: new Date().toISOString() });
    }
  }

  const markAsPending = (pago: Pago) => {
    const { fechaPago, ...rest } = pago;
    updatePago({ ...rest, estado: 'pendiente' });
    toast({ title: "Pago actualizado", description: "El pago ha sido marcado como pendiente." });
     if(selectedPago?.id === pago.id) {
      const { fechaPago, ...restSelected } = selectedPago;
      setSelectedPago({ ...restSelected, estado: 'pendiente' });
    }
  }
  
  const handleOpenPagoDetail = (pago: Pago) => {
     if (pago.id.startsWith('recurring-')) {
        toast({
            title: "Pago Recurrente",
            description: "Este es un pago recurrente autogenerado. Para gestionarlo, edita el expediente del cliente.",
            variant: "default",
        });
        const cliente = getClienteById(pago.clienteId);
        if (cliente) handleOpenCliente(cliente.id);
        return;
    }
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
  
  const handleOpenCliente = (clienteId: string) => {
    const cliente = getClienteById(clienteId);
    if(cliente) {
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

  const pagosProximos = React.useMemo(() => {
    if (!now) return [];
    
    const proximos: Pago[] = [];

    pagos.forEach(p => {
        if (p.estado === 'pendiente' && !isBefore(parseISO(p.fechaLimite), now)) {
            proximos.push(p);
        }
    });

    clientes.forEach(cl => {
        if (cl.diaDePago && cl.montoRecurrente) {
            const paymentDay = cl.diaDePago;
            let nextPaymentDate = new Date(now.getFullYear(), now.getMonth(), paymentDay);

            if (isBefore(nextPaymentDate, now)) {
                nextPaymentDate = addMonths(nextPaymentDate, 1);
            }
            
            const syntheticPago: Pago = {
                id: `recurring-${cl.id}-${nextPaymentDate.toISOString()}`,
                clienteId: cl.id,
                monto: cl.montoRecurrente,
                concepto: 'Mensualidad',
                fechaLimite: nextPaymentDate.toISOString(),
                estado: 'pendiente',
                notas: 'Pago recurrente autogenerado.',
            };
            proximos.push(syntheticPago);
        }
    });

    return proximos.sort((a,b) => parseISO(a.fechaLimite).getTime() - parseISO(b.fechaLimite).getTime());
  }, [pagos, clientes, now]);


  const pagosVencidos = now ? pagos.filter(p => p.estado === 'pendiente' && isBefore(parseISO(p.fechaLimite), now)).sort((a,b) => parseISO(b.fechaLimite).getTime() - parseISO(a.fechaLimite).getTime()) : [];
  const historialPagos = pagos.filter(p => p.estado === 'pagado').sort((a,b) => parseISO(b.fechaPago!).getTime() - parseISO(a.fechaPago!).getTime());
  
  const PagosTable = ({ data, isPending = false }: { data: Pago[], isPending?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead className="hidden sm:table-cell">Concepto</TableHead>
          <TableHead>Monto</TableHead>
          <TableHead>{isPending ? 'Fecha Límite' : 'Fecha de Pago'}</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((pago) => (
            <TableRow key={pago.id} onClick={() => handleOpenPagoDetail(pago)} className="cursor-pointer">
                <TableCell>{getClienteById(pago.clienteId)?.nombre}</TableCell>
                <TableCell className="hidden sm:table-cell">{pago.concepto}</TableCell>
                <TableCell>{formatCurrency(pago.monto)}</TableCell>
                <TableCell>
                  <span className={isPending && now && isBefore(parseISO(pago.fechaLimite), now) ? 'text-status-danger font-medium' : ''}>
                    {formatDate(isPending ? pago.fechaLimite : pago.fechaPago!)}
                  </span>
                </TableCell>
                <TableCell><StatusBadge status={pago.estado} /></TableCell>
              </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <>
      <PageHeader
        title="Pagos"
        description="Gestiona los pagos de tus clientes."
      >
        <Button onClick={() => setFormOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Registrar Pago
        </Button>
      </PageHeader>
      
      <Tabs defaultValue="proximos">
        <TabsList>
          <TabsTrigger value="proximos">Próximos ({pagosProximos.length})</TabsTrigger>
          <TabsTrigger value="pendientes">Vencidos ({pagosVencidos.length})</TabsTrigger>
          <TabsTrigger value="historial">Historial ({historialPagos.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="proximos">
            <Card>
                <CardHeader>
                    <CardTitle>Pagos Próximos</CardTitle>
                    <CardDescription>Pagos programados y recurrentes que aún no han vencido.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PagosTable data={pagosProximos} isPending />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="pendientes">
            <Card>
                <CardHeader>
                    <CardTitle>Pagos Vencidos</CardTitle>
                    <CardDescription>Pagos que no se han cubierto y su fecha límite ya pasó.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PagosTable data={pagosVencidos} isPending />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="historial">
            <Card>
                <CardHeader>
                    <CardTitle>Historial de Pagos</CardTitle>
                    <CardDescription>Un registro de todos los pagos realizados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PagosTable data={historialPagos} />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
        <PagoForm 
            clientes={clientes} 
            onSubmit={handleAddSubmit} 
            setOpen={setFormOpen}
        />
      </Dialog>
      
      <Dialog open={isPagoDetailOpen} onOpenChange={setPagoDetailOpen}>
        {selectedPago && <PagoDetail 
            pago={selectedPago} 
            onOpenCliente={handleOpenCliente}
            onToggleStatus={() => handleToggleStatusFromDetail(selectedPago)}
            />}
      </Dialog>
      
      <Dialog open={isClienteDetailOpen} onOpenChange={setClienteDetailOpen}>
        {selectedCliente && <ClienteDetail cliente={selectedCliente} onEditRequest={() => handleOpenEditCliente(selectedCliente)} />}
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
