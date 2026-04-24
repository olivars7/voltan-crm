'use client';

import * as React from 'react';
import { PlusCircle, Search } from 'lucide-react';
import { useAgenda } from '@/hooks/useAgenda';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { AgendaForm } from './AgendaForm';
import { AgendaDetail } from './AgendaDetail';
import { formatDate } from '@/lib/utils';
import type { LlamadaAgendada } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { parseISO } from 'date-fns';

export function AgendaPageClient() {
  const { llamadas, addLlamada, updateLlamada } = useAgenda();
  const [isFormOpen, setFormOpen] = React.useState(false);
  const [isDetailOpen, setDetailOpen] = React.useState(false);
  const [isRescheduling, setIsRescheduling] = React.useState(false);
  
  const [selectedLlamada, setSelectedLlamada] = React.useState<LlamadaAgendada | undefined>(undefined);
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const [visibleCount, setVisibleCount] = React.useState(40);

  const handleAddSubmit = (values: any) => {
    addLlamada(values);
    toast({ title: "Llamada agendada", description: "La nueva llamada ha sido guardada." });
    setFormOpen(false);
  }

  const handleEditSubmit = (values: any) => {
    if(selectedLlamada) {
        const updatedLlamada = { ...selectedLlamada, ...values };
        updateLlamada(updatedLlamada);
        toast({ title: "Llamada actualizada", description: "La llamada ha sido actualizada." });
        setFormOpen(false);
        setSelectedLlamada(undefined);
        setIsRescheduling(false);
        if (isDetailOpen) {
            setSelectedLlamada(updatedLlamada);
        }
    }
  }

  const openNewDialog = () => {
    setSelectedLlamada(undefined);
    setIsRescheduling(false);
    setFormOpen(true);
  }
  
  const openDetailDialog = (llamada: LlamadaAgendada) => {
    setSelectedLlamada(llamada);
    setDetailOpen(true);
  }

  const openEditDialog = () => {
    setIsRescheduling(false);
    setDetailOpen(false);
    setFormOpen(true);
  }

  const openRescheduleDialog = () => {
    setIsRescheduling(true);
    setDetailOpen(false);
    setFormOpen(true);
  }


  const sortedLlamadas = [...llamadas].sort((a, b) => parseISO(a.fecha).getTime() - parseISO(b.fecha).getTime());

  const filteredLlamadas = sortedLlamadas.filter(llamada => {
    const search = searchTerm.toLowerCase();
    return (
        llamada.nombre.toLowerCase().includes(search) ||
        llamada.telefono.includes(search) ||
        llamada.estado.toLowerCase().includes(search)
    );
  });

  return (
    <>
      <PageHeader
        title="Agenda"
        description="Gestiona tus llamadas agendadas."
      >
        <Button onClick={openNewDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Agendar Llamada
        </Button>
      </PageHeader>
      
      <Card>
        <CardHeader>
          <CardTitle>Llamadas Agendadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="pb-4">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Buscar por nombre, número o estado..."
                    className="w-full pl-8 md:w-1/2 lg:w-1/3"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente/Interesado</TableHead>
                <TableHead className="hidden md:table-cell">Número</TableHead>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead className="hidden sm:table-cell">Medio</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLlamadas.slice(0, visibleCount).map((llamada) => (
                <TableRow key={llamada.id} onClick={() => openDetailDialog(llamada)} className="cursor-pointer">
                  <TableCell className="font-medium">
                    {llamada.nombre}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{llamada.telefono}</TableCell>
                  <TableCell>{formatDate(llamada.fecha, "d MMM, yyyy h:mm a")}</TableCell>
                  <TableCell className="hidden sm:table-cell capitalize">{llamada.medio.replace('-',' ')}</TableCell>
                  <TableCell>
                    <StatusBadge status={llamada.estado} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {filteredLlamadas.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No hay llamadas agendadas.</p>
           )}
        </CardContent>
        {visibleCount < filteredLlamadas.length && (
          <CardFooter className="justify-center">
            <Button onClick={() => setVisibleCount(v => v + 40)}>Cargar más</Button>
          </CardFooter>
        )}
      </Card>
      
      <Dialog open={isFormOpen} onOpenChange={(isOpen) => { if(!isOpen) {setSelectedLlamada(undefined); setIsRescheduling(false);} setFormOpen(isOpen);}}>
        <AgendaForm 
            llamada={selectedLlamada} 
            isRescheduling={isRescheduling}
            onSubmit={selectedLlamada ? handleEditSubmit : handleAddSubmit} 
            setOpen={setFormOpen}
        />
      </Dialog>

      <Dialog open={isDetailOpen} onOpenChange={(isOpen) => { if(!isOpen) setSelectedLlamada(undefined); setDetailOpen(isOpen); }}>
        {selectedLlamada && <AgendaDetail llamada={selectedLlamada} onEdit={openEditDialog} onReschedule={openRescheduleDialog} />}
      </Dialog>
    </>
  );
}
