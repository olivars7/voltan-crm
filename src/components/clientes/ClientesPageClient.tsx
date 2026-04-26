'use client';

import * as React from 'react';
import { PlusCircle, Search, Loader2 } from 'lucide-react';
import { useClientes } from '@/hooks/useClientes';
import { usePagos } from '@/hooks/usePagos';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ClienteForm } from './ClienteForm';
import { ClienteDetail } from './ClienteDetail';
import { formatDate } from '@/lib/utils';
import type { Cliente } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function ClientesPageClient() {
  const { clientes, addCliente, updateCliente, loading: clientesLoading } = useClientes();
  const { addPago, loading: pagosLoading } = usePagos();
  const [isFormOpen, setFormOpen] = React.useState(false);
  
  const [selectedClienteId, setSelectedClienteId] = React.useState<string | undefined>(undefined);
  const [editingCliente, setEditingCliente] = React.useState<Cliente | undefined>(undefined);
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const [visibleCount, setVisibleCount] = React.useState(40);

  const handleAddSubmit = async (values: any) => {
    const { montoAdelanto, fechaAdelanto, montoApertura, fechaApertura, ...clienteData } = values;

    const finalClienteData = {
        ...clienteData,
        cuotaMensual: values.cuotaMensual ? Number(values.cuotaMensual) : 0,
        diaDePago: values.diaDePago ? Number(values.diaDePago) : undefined,
    };

    const newClient = await addCliente(finalClienteData);
    toast({ title: "Cliente añadido", description: "El nuevo cliente ha sido guardado." });
    
    if (montoAdelanto && montoAdelanto > 0 && fechaAdelanto) {
      await addPago({
        clienteId: newClient.id,
        monto: montoAdelanto,
        fechaLimite: fechaAdelanto,
        estado: 'pendiente',
        concepto: 'Adelanto',
        notas: 'Pago de adelanto inicial.'
      });
      toast({ title: "Pago de adelanto creado", description: "El pago de adelanto ha sido registrado como pendiente." });
    }

    if (montoApertura && montoApertura > 0 && fechaApertura) {
      await addPago({
        clienteId: newClient.id,
        monto: montoApertura,
        fechaLimite: fechaApertura,
        estado: 'pendiente',
        concepto: 'Apertura',
        notas: 'Pago de apertura de proyecto/servicio.'
      });
      toast({ title: "Pago de apertura creado", description: "El pago de apertura ha sido registrado como pendiente." });
    }

    setFormOpen(false);
  };

  const handleEditSubmit = async (values: any) => {
    if (editingCliente) {
      const updatedData = { ...editingCliente, ...values };
      await updateCliente(updatedData);
      toast({ title: "Cliente actualizado", description: "Los datos del cliente han sido actualizados." });
      if (selectedClienteId === updatedData.id) {
        setSelectedClienteId(undefined); 
        setSelectedClienteId(updatedData.id);
      }
      setFormOpen(false);
      setEditingCliente(undefined);
    }
  };
  
  const openEditDialog = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setSelectedClienteId(undefined);
    setFormOpen(true);
  }

  const openNewDialog = () => {
    setEditingCliente(undefined);
    setFormOpen(true);
  }

  const openDetailDialog = (cliente: Cliente) => {
    setSelectedClienteId(cliente.id);
    setFormOpen(false);
  }

  const sortedClientes = [...clientes].sort((a, b) => parseISO(b.fechaInicio).getTime() - parseISO(a.fechaInicio).getTime());

  const filteredClientes = sortedClientes.filter(cliente => {
    const search = searchTerm.toLowerCase();
    
    if (!cliente.fechaInicio) return false;

    const monthName = format(parseISO(cliente.fechaInicio), 'MMMM', { locale: es });

    return (
        cliente.nombre.toLowerCase().includes(search) ||
        (cliente.empresa || '').toLowerCase().includes(search) ||
        cliente.telefono.includes(search) ||
        cliente.estado.toLowerCase().includes(search) ||
        monthName.toLowerCase().includes(search)
    );
  });

  const selectedCliente = selectedClienteId ? clientes.find(c => c.id === selectedClienteId) : undefined;

  const isLoading = clientesLoading || pagosLoading;

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Gestiona tus clientes activos e inactivos."
      >
        <Button onClick={openNewDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Cliente
        </Button>
      </PageHeader>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="pb-4">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Buscar por nombre, empresa, teléfono, estado o mes..."
                    className="w-full pl-8 md:w-1/2 lg:w-1/3"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Fecha de Inicio</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.length === 0 && !isLoading ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No se encontraron clientes.
                    </TableCell>
                </TableRow>
              ) : (
                filteredClientes.slice(0, visibleCount).map((cliente) => (
                  <TableRow key={cliente.id} onClick={() => openDetailDialog(cliente)} className="cursor-pointer">
                    <TableCell className="font-medium">
                      {cliente.nombre}
                    </TableCell>
                    <TableCell>{cliente.empresa}</TableCell>
                    <TableCell>
                      {cliente.telefono}
                    </TableCell>
                    <TableCell>{formatDate(cliente.fechaInicio)}</TableCell>
                    <TableCell>
                      <StatusBadge status={cliente.estado} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
        {visibleCount < filteredClientes.length && (
          <CardFooter className="justify-center">
            <Button onClick={() => setVisibleCount(v => v + 40)}>Cargar más</Button>
          </CardFooter>
        )}
      </Card>
      
      <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
        <ClienteForm 
            cliente={editingCliente} 
            onSubmit={editingCliente ? handleEditSubmit : handleAddSubmit} 
            setOpen={setFormOpen}
        />
      </Dialog>

      <Dialog open={!!selectedClienteId} onOpenChange={(isOpen) => !isOpen && setSelectedClienteId(undefined)}>
        {selectedCliente && <ClienteDetail cliente={selectedCliente} clientes={clientes} onEditRequest={() => openEditDialog(selectedCliente)} onUpdateCliente={updateCliente} />}
      </Dialog>
    </>
  );
}
