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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PagoForm } from './PagoForm';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Pago } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { isBefore, parseISO } from 'date-fns';


const formSchema = z.object({
  clienteId: z.string().min(1),
  monto: z.coerce.number().positive(),
  fechaLimite: z.string().min(1),
  notas: z.string().optional(),
});

export function PagosPageClient() {
  const { pagos, addPago, updatePago } = usePagos();
  const { clientes, getClienteById } = useClientes();
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const handleAddSubmit = (values: z.infer<typeof formSchema>) => {
    addPago(values);
    toast({ title: "Pago registrado", description: "El nuevo pago ha sido guardado." });
  };
  
  const markAsPaid = (pago: Pago) => {
    updatePago({ ...pago, estado: 'pagado', fechaPago: new Date().toISOString() });
     toast({ title: "Pago actualizado", description: "El pago ha sido marcado como pagado." });
  }

  const markAsPending = (pago: Pago) => {
    const { fechaPago, ...rest } = pago;
    updatePago({ ...rest, estado: 'pendiente' });
    toast({ title: "Pago actualizado", description: "El pago ha sido marcado como pendiente." });
  }

  const pagosPendientes = pagos.filter((pago) => pago.estado === 'pendiente');
  const historialPagos = pagos.filter((pago) => pago.estado === 'pagado');
  
  const PagosTable = ({ data, isPending = false }: { data: Pago[], isPending?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Monto</TableHead>
          <TableHead>{isPending ? 'Fecha Límite' : 'Fecha de Pago'}</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((pago) => (
          <DropdownMenu key={pago.id}>
            <DropdownMenuTrigger asChild>
              <TableRow className="cursor-pointer">
                <TableCell>{getClienteById(pago.clienteId)?.nombre}</TableCell>
                <TableCell>{formatCurrency(pago.monto)}</TableCell>
                <TableCell>
                  <span className={isPending && isBefore(parseISO(pago.fechaLimite), new Date()) ? 'text-status-danger' : ''}>
                    {formatDate(isPending ? pago.fechaLimite : pago.fechaPago!)}
                  </span>
                </TableCell>
                <TableCell><StatusBadge status={pago.estado} /></TableCell>
              </TableRow>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              {pago.estado === 'pendiente' ? (
                <DropdownMenuItem onSelect={() => markAsPaid(pago)}>Marcar como pagado</DropdownMenuItem>
              ) : (
                <DropdownMenuItem onSelect={() => markAsPending(pago)}>Marcar como pendiente</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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
        <Button onClick={() => setDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Registrar Pago
        </Button>
      </PageHeader>
      
      <Tabs defaultValue="pendientes">
        <TabsList>
          <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>
        <TabsContent value="pendientes">
            <Card>
                <CardHeader>
                    <CardTitle>Pagos Pendientes</CardTitle>
                    <CardDescription>Pagos que aún no han sido cubiertos por los clientes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PagosTable data={pagosPendientes} isPending />
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

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <PagoForm 
            clientes={clientes} 
            onSubmit={handleAddSubmit} 
            setOpen={setDialogOpen}
        />
      </Dialog>
    </>
  );
}
