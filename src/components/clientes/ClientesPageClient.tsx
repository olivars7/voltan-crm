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
  const { clientes, addCliente, updateCliente, deleteCliente, loading: clientesLoading } = useClientes();
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
        diaDePago: values.diaDePago ? Number(values.diaDePago) : null,
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
      const { montoAdelanto, fechaAdelanto, montoApertura, fechaApertura, ...clienteData } = values;
      const updatedData = { 
        ...editingCliente, 
        ...clienteData,
        cuotaMensual: clienteData.cuotaMensual ? Number(clienteData.cuotaMensual) : 0,
        diaDePago: clienteData.diaDePago ? Number(clienteData.diaDePago) : null,
      };
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
  
  const handleDeleteCliente = async () => {
    if (editingCliente) {
      if(window.confirm(`¿Estás seguro de que quieres eliminar a ${editingCliente.nombre}? Esto eliminará también todos sus pagos asociados de forma permanente.`)){
        await deleteCliente(editingCliente.id);
        toast({ title: "Cliente eliminado", description: "El cliente y todos sus datos han sido eliminados." });
        setFormOpen(false);
        setEditingCliente(undefined);
        if(selectedClienteId === editingCliente.id) {
            setSelectedClienteId(undefined);
        }
      }
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
    <div className="pb-20">
      <PageHeader
        title="Clientes"
        description="Gestiona tus clientes activos e inactivos."
      >
        <Button onClick={openNewDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Cliente
        </Button>
      </PageHeader>
      
      <Card className="border-white/10 bg-zinc-950/20 backdrop-blur-3xl shadow-2xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
          <CardTitle className="text-lg text-white">Lista de Clientes</CardTitle>
          <div className="relative w-full max-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60 z-10" />
              <Input
                  type="search"
                  placeholder="Buscar clientes..."
                  className="w-full h-9 pl-9 bg-white/5 border-white/10 text-white text-xs backdrop-blur-xl focus:bg-white/10 transition-all placeholder:text-muted-foreground/40"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-white/80 text-[10px] uppercase font-bold tracking-wider">Nombre</TableHead>
                <TableHead className="text-white/80 text-[10px] uppercase font-bold tracking-wider">Empresa</TableHead>
                <TableHead className="text-white/80 text-[10px] uppercase font-bold tracking-wider">Teléfono</TableHead>
                <TableHead className="text-white/80 text-[10px] uppercase font-bold tracking-wider">Fecha de Inicio</TableHead>
                <TableHead className="text-white/80 text-[10px] uppercase font-bold tracking-wider">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.length === 0 && !isLoading ? (
                <TableRow className="hover:bg-transparent border-white/5">
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground/40">
                        No se encontraron clientes.
                    </TableCell>
                </TableRow>
              ) : (
                filteredClientes.slice(0, visibleCount).map((cliente) => (
                  <TableRow key={cliente.id} onClick={() => openDetailDialog(cliente)} className="cursor-pointer border-white/5 hover:bg-white/5">
                    <TableCell className="font-medium text-xs text-white">
                      {cliente.nombre}
                    </TableCell>
                    <TableCell className="text-zinc-300 text-xs">{cliente.empresa}</TableCell>
                    <TableCell className="text-zinc-300 text-xs">
                      {cliente.telefono}
                    </TableCell>
                    <TableCell className="text-zinc-300 text-xs">{formatDate(cliente.fechaInicio)}</TableCell>
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
          <CardFooter className="justify-center border-t border-white/5 pt-4">
            <Button variant="ghost" size="sm" onClick={() => setVisibleCount(v => v + 40)} className="text-xs text-zinc-500 hover:text-white">Cargar más</Button>
          </CardFooter>
        )}
      </Card>
      
      <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
        <ClienteForm 
            cliente={editingCliente} 
            onSubmit={editingCliente ? handleEditSubmit : handleAddSubmit} 
            onDelete={editingCliente ? handleDeleteCliente : undefined}
            setOpen={setFormOpen}
        />
      </Dialog>

      <Dialog open={!!selectedClienteId} onOpenChange={(isOpen) => !isOpen && setSelectedClienteId(undefined)}>
        {selectedCliente && <ClienteDetail cliente={selectedCliente} clientes={clientes} onEditRequest={() => openEditDialog(selectedCliente)} onUpdateCliente={updateCliente} />}
      </Dialog>
    </div>
  );
}