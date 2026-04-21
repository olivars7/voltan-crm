'use client';

import * as React from 'react';
import { PlusCircle, Search } from 'lucide-react';
import { useClientes } from '@/hooks/useClientes';
import { usePagos } from '@/hooks/usePagos';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const { clientes, addCliente, updateCliente } = useClientes();
  const { addPago } = usePagos();
  const [isFormOpen, setFormOpen] = React.useState(false);
  const [isDetailOpen, setDetailOpen] = React.useState(false);

  const [selectedCliente, setSelectedCliente] = React.useState<Cliente | undefined>(undefined);
  const [editingCliente, setEditingCliente] = React.useState<Cliente | undefined>(undefined);
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleAddSubmit = (values: any) => {
    const newClient = addCliente(values);
    toast({ title: "Cliente añadido", description: "El nuevo cliente ha sido guardado." });
    
    if (values.montoApertura && values.montoApertura > 0) {
      addPago({
        clienteId: newClient.id,
        monto: values.montoApertura,
        fechaLimite: new Date().toISOString(),
        estado: 'pagado',
        fechaPago: new Date().toISOString(),
        notas: 'Pago de apertura',
      })
      toast({ title: "Pago de apertura registrado", description: "El pago inicial ha sido marcado como pagado." });
    }

    setFormOpen(false);
  };

  const handleEditSubmit = (values: any) => {
    if (editingCliente) {
      const updatedData = { ...editingCliente, ...values };
      updateCliente(updatedData);
      toast({ title: "Cliente actualizado", description: "Los datos del cliente han sido actualizados." });
      // If the detail view was open for the edited client, update its data
      if (selectedCliente?.id === updatedData.id) {
        setSelectedCliente(updatedData);
      }
      setFormOpen(false);
      setEditingCliente(undefined);
    }
  };
  
  const openEditDialog = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setDetailOpen(false);
    setFormOpen(true);
  }

  const openNewDialog = () => {
    setEditingCliente(undefined);
    setFormOpen(true);
  }

  const openDetailDialog = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setFormOpen(false);
    setDetailOpen(true);
  }

  const filteredClientes = clientes.filter(cliente => {
    const search = searchTerm.toLowerCase();
    const monthName = format(parseISO(cliente.fechaInicio), 'MMMM', { locale: es });

    return (
        cliente.nombre.toLowerCase().includes(search) ||
        cliente.empresa.toLowerCase().includes(search) ||
        cliente.telefono.includes(search) ||
        cliente.estado.toLowerCase().includes(search) ||
        monthName.toLowerCase().includes(search)
    );
  });


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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden md:table-cell">Empresa</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead className="hidden sm:table-cell">Fecha de Inicio</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.map((cliente) => (
                <TableRow key={cliente.id} onClick={() => openDetailDialog(cliente)} className="cursor-pointer">
                  <TableCell className="font-medium">
                    {cliente.nombre}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{cliente.empresa}</TableCell>
                  <TableCell>
                    {cliente.telefono}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{formatDate(cliente.fechaInicio)}</TableCell>
                  <TableCell>
                    <StatusBadge status={cliente.estado} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
        <ClienteForm 
            cliente={editingCliente} 
            onSubmit={editingCliente ? handleEditSubmit : handleAddSubmit} 
            setOpen={setFormOpen}
        />
      </Dialog>

      <Dialog open={isDetailOpen} onOpenChange={setDetailOpen}>
        {selectedCliente && <ClienteDetail cliente={selectedCliente} onEditRequest={() => openEditDialog(selectedCliente)} />}
      </Dialog>
    </>
  );
}
