'use client';

import * as React from 'react';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { useClientes } from '@/hooks/useClientes';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ClienteForm } from './ClienteForm';
import { formatDate } from '@/lib/utils';
import type { Cliente } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const formSchema = z.object({
  nombre: z.string().min(2),
  empresa: z.string().min(2),
  email: z.string().email(),
  telefono: z.string().min(10),
});

export function ClientesPageClient() {
  const { clientes, addCliente, updateCliente } = useClientes();
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const [editingCliente, setEditingCliente] = React.useState<Cliente | undefined>(undefined);
  const { toast } = useToast();

  const handleAddSubmit = (values: z.infer<typeof formSchema>) => {
    addCliente(values);
    toast({ title: "Cliente añadido", description: "El nuevo cliente ha sido guardado." });
  };

  const handleEditSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingCliente) {
      updateCliente({ ...editingCliente, ...values });
      toast({ title: "Cliente actualizado", description: "Los datos del cliente han sido actualizados." });
    }
  };
  
  const openEditDialog = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setDialogOpen(true);
  }

  const openNewDialog = () => {
    setEditingCliente(undefined);
    setDialogOpen(true);
  }

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden md:table-cell">Empresa</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden sm:table-cell">Fecha de Inicio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">{cliente.nombre}</TableCell>
                  <TableCell className="hidden md:table-cell">{cliente.empresa}</TableCell>
                  <TableCell>{cliente.email}</TableCell>
                  <TableCell className="hidden sm:table-cell">{formatDate(cliente.fechaInicio)}</TableCell>
                  <TableCell>
                    <StatusBadge status={cliente.estado} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => openEditDialog(cliente)}>Editar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <ClienteForm 
            cliente={editingCliente} 
            onSubmit={editingCliente ? handleEditSubmit : handleAddSubmit} 
            setOpen={setDialogOpen}
        />
      </Dialog>
    </>
  );
}
