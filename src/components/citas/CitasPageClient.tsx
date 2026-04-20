'use client';

import * as React from 'react';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { useCitas } from '@/hooks/useCitas';
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
import { CitaForm } from './CitaForm';
import { CitaDetail } from './CitaDetail';
import { ClienteDetail } from '../clientes/ClienteDetail';
import { formatDate } from '@/lib/utils';
import type { Cita, Cliente } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const formSchema = z.object({
  clienteId: z.string().min(1),
  fecha: z.string().min(1),
  hora: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  tipo: z.enum(['whatsapp', 'meet']),
  notas: z.string().optional(),
});


export function CitasPageClient() {
  const { citas, addCita, updateCita } = useCitas();
  const { clientes, getClienteById } = useClientes();
  
  const [isFormOpen, setFormOpen] = React.useState(false);
  const [isCitaDetailOpen, setCitaDetailOpen] = React.useState(false);
  const [isClienteDetailOpen, setClienteDetailOpen] = React.useState(false);

  const [selectedCita, setSelectedCita] = React.useState<Cita | undefined>(undefined);
  const [editingCita, setEditingCita] = React.useState<Cita | undefined>(undefined);
  const [selectedCliente, setSelectedCliente] = React.useState<Cliente | undefined>(undefined);
  const { toast } = useToast();

  const handleAddSubmit = (values: z.infer<typeof formSchema>) => {
    addCita(values);
    toast({ title: "Cita agendada", description: "La nueva cita ha sido guardada." });
    setFormOpen(false);
  };
  
  const handleEditSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingCita) {
      updateCita({ ...editingCita, ...values });
      toast({ title: "Cita actualizada", description: "La cita ha sido actualizada." });
      setFormOpen(false);
      setEditingCita(undefined);
    }
  };

  const openEditDialog = (cita: Cita) => {
    setEditingCita(cita);
    setFormOpen(true);
  };

  const openNewDialog = () => {
    setEditingCita(undefined);
    setFormOpen(true);
  };

  const markAsCompleted = (cita: Cita) => {
    updateCita({ ...cita, estado: 'completada' });
    toast({ title: "Cita completada", description: "La cita ha sido marcada como completada." });
  }

  const markAsPending = (cita: Cita) => {
    updateCita({ ...cita, estado: 'pendiente' });
    toast({ title: "Cita actualizada", description: "La cita ha sido marcada como pendiente." });
  }

  const openCitaDetailDialog = (cita: Cita) => {
    setSelectedCita(cita);
    setFormOpen(false);
    setClienteDetailOpen(false);
    setCitaDetailOpen(true);
  }

  const handleOpenCliente = (clienteId: string) => {
    const cliente = getClienteById(clienteId);
    if(cliente) {
      setSelectedCliente(cliente);
      setCitaDetailOpen(false);
      setClienteDetailOpen(true);
    }
  }

  const handleCitaClickFromCliente = (cita: Cita) => {
    setSelectedCita(cita);
    setClienteDetailOpen(false);
    setCitaDetailOpen(true);
  }


  const citasPendientes = citas.filter((cita) => cita.estado === 'pendiente');
  const historialCitas = citas.filter((cita) => cita.estado === 'completada');
  
  const CitasTable = ({ data }: { data: Cita[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Hora</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead><span className="sr-only">Acciones</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((cita) => (
          <TableRow key={cita.id} onClick={() => openCitaDetailDialog(cita)} className="cursor-pointer">
            <TableCell>{getClienteById(cita.clienteId)?.nombre}</TableCell>
            <TableCell>{formatDate(cita.fecha)}</TableCell>
            <TableCell>{cita.hora}</TableCell>
            <TableCell className="capitalize">{cita.tipo}</TableCell>
            <TableCell><StatusBadge status={cita.estado} /></TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button aria-haspopup="true" size="icon" variant="ghost">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => openEditDialog(cita)}>Editar</DropdownMenuItem>
                {cita.estado === 'pendiente' ? (
                  <DropdownMenuItem onSelect={() => markAsCompleted(cita)}>Marcar como completada</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onSelect={() => markAsPending(cita)}>Marcar como pendiente</DropdownMenuItem>
                )}
                <DropdownMenuItem onSelect={() => openCitaDetailDialog(cita)}>Ver detalles</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <>
      <PageHeader
        title="Citas"
        description="Agenda y gestiona tus citas con clientes."
      >
        <Button onClick={openNewDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Agendar Cita
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
                    <CardTitle>Citas Pendientes</CardTitle>
                    <CardDescription>Estas son las próximas reuniones y llamadas agendadas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CitasTable data={citasPendientes} />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="historial">
            <Card>
                <CardHeader>
                    <CardTitle>Historial de Citas</CardTitle>
                    <CardDescription>Un registro de todas las citas completadas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CitasTable data={historialCitas} />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
        <CitaForm 
            cita={editingCita}
            clientes={clientes} 
            onSubmit={editingCita ? handleEditSubmit : handleAddSubmit} 
            setOpen={setFormOpen}
        />
      </Dialog>
      
      <Dialog open={isCitaDetailOpen} onOpenChange={setCitaDetailOpen}>
        {selectedCita && <CitaDetail cita={selectedCita} onOpenCliente={handleOpenCliente} />}
      </Dialog>

      <Dialog open={isClienteDetailOpen} onOpenChange={setClienteDetailOpen}>
        {selectedCliente && <ClienteDetail cliente={selectedCliente} onCitaClick={handleCitaClickFromCliente} onEditRequest={() => {}} />}
      </Dialog>
    </>
  );
}
