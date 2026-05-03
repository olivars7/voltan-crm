'use client';

import * as React from 'react';
import { PlusCircle, Search, Loader2 } from 'lucide-react';
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
import type { LlamadaAgendada, LlamadaEstado } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { parseISO, isToday, isPast } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AgendaPageClient() {
  const { llamadas, addLlamada, updateLlamada, deleteLlamada, loading } = useAgenda();
  const [isFormOpen, setFormOpen] = React.useState(false);
  const [isDetailOpen, setDetailOpen] = React.useState(false);
  const [isRescheduling, setIsRescheduling] = React.useState(false);
  
  const [selectedLlamada, setSelectedLlamada] = React.useState<LlamadaAgendada | undefined>(undefined);
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const [visibleUpcoming, setVisibleUpcoming] = React.useState(40);
  const [visiblePast, setVisiblePast] = React.useState(40);
  
  const handleAddSubmit = async (values: any) => {
    await addLlamada(values);
    toast({ title: "Llamada agendada", description: "La nueva llamada ha sido guardada." });
    setFormOpen(false);
  }

  const handleEditSubmit = async (values: any) => {
    if(selectedLlamada) {
        if (isRescheduling) {
            // Crear una NUEVA llamada heredando los datos pero sin tocar la original
            await addLlamada(values);
            toast({ 
                title: "Llamada reagendada", 
                description: "Se ha creado una nueva cita a partir de los datos heredados." 
            });
        } else {
            // Actualizar la llamada existente
            const updatedLlamada = { ...selectedLlamada, ...values };
            await updateLlamada(updatedLlamada);
            toast({ title: "Llamada actualizada", description: "La llamada ha sido actualizada." });
        }
        
        setFormOpen(false);
        setSelectedLlamada(undefined);
        setIsRescheduling(false);
    }
  }
  
  const handleDeleteLlamada = async () => {
    if (selectedLlamada) {
      if(window.confirm(`¿Estás seguro de que quieres eliminar la llamada con ${selectedLlamada.nombre}?`)){
          await deleteLlamada(selectedLlamada.id);
          toast({ title: "Llamada eliminada" });
          setFormOpen(false); 
          setDetailOpen(false);
          setSelectedLlamada(undefined);
      }
    }
  };

  const handleSetStatus = async (llamada: LlamadaAgendada, status: 'realizada' | 'cancelada') => {
    const now = new Date().toISOString();
    const updatedLlamada = { 
      ...llamada, 
      estado: status,
      // Actualizamos la fecha al momento real de la acción si se marca como realizada
      fecha: status === 'realizada' ? now : llamada.fecha 
    };
    await updateLlamada(updatedLlamada);
    toast({ title: `Llamada ${status}`, description: "El estado de la llamada ha sido actualizado." });
    setDetailOpen(false);
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

  const getEffectiveStatus = (llamada: LlamadaAgendada): LlamadaEstado => {
    const callDate = parseISO(llamada.fecha);
    if (llamada.estado === 'pronto' && (isToday(callDate) || isPast(callDate))) {
      return 'pendiente';
    }
    return llamada.estado;
  };
  
  const searchFilter = (llamada: LlamadaAgendada) => {
      const search = searchTerm.toLowerCase();
      return (
          llamada.nombre.toLowerCase().includes(search) ||
          llamada.telefono.includes(search) ||
          getEffectiveStatus(llamada).toLowerCase().includes(search)
      );
  };
  
  const llamadasProximas = llamadas
    .filter(l => ['pronto', 'pendiente'].includes(getEffectiveStatus(l)))
    .filter(searchFilter)
    .sort((a, b) => parseISO(a.fecha).getTime() - parseISO(b.fecha).getTime());

  const llamadasPasadas = llamadas
    .filter(l => ['realizada', 'cancelada'].includes(getEffectiveStatus(l)))
    .filter(searchFilter)
    .sort((a, b) => parseISO(b.fecha).getTime() - parseISO(a.fecha).getTime());

  const CallsTable = ({ calls, visibleCount, type }: { calls: LlamadaAgendada[], visibleCount: number, type: 'proximas' | 'pasadas' }) => (
    <>
      {calls.length === 0 && !loading ? (
        <p className="text-center text-muted-foreground/40 py-8">No hay llamadas {type}.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-muted-foreground/60">Cliente/Interesado</TableHead>
              <TableHead className="text-muted-foreground/60">Número</TableHead>
              <TableHead className="text-muted-foreground/60">Fecha y Hora</TableHead>
              <TableHead className="text-muted-foreground/60">Medio</TableHead>
              <TableHead className="text-muted-foreground/60">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {calls.slice(0, visibleCount).map((llamada) => (
              <TableRow key={llamada.id} onClick={() => openDetailDialog(llamada)} className="cursor-pointer border-white/5 hover:bg-white/5">
                <TableCell className="font-medium text-white">{llamada.nombre}</TableCell>
                <TableCell className="text-muted-foreground/80">{llamada.telefono}</TableCell>
                <TableCell className="text-muted-foreground/80">{formatDate(llamada.fecha, "d MMM, yyyy h:mm a")}</TableCell>
                <TableCell className="capitalize text-muted-foreground/80">{llamada.medio.replace('-', ' ')}</TableCell>
                <TableCell><StatusBadge status={getEffectiveStatus(llamada)} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );

  return (
    <>
      <PageHeader
        title="Agenda"
        description="Gestiona tus llamadas agendadas."
      >
        <Button onClick={openNewDialog} className="text-white">
          <PlusCircle className="mr-2 h-4 w-4" />
          Agendar Llamada
        </Button>
      </PageHeader>
      
       <div className="pb-4">
        <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/60" />
            <Input
                type="search"
                placeholder="Buscar por nombre, número o estado..."
                className="w-full pl-8 md:w-1/2 lg:w-1/3 bg-white/5 border-white/10 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
      <Tabs defaultValue="proximas">
        <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="proximas" className="data-[state=active]:bg-white/10 text-zinc-400 data-[state=active]:text-white">Próximas</TabsTrigger>
            <TabsTrigger value="pasadas" className="data-[state=active]:bg-white/10 text-zinc-400 data-[state=active]:text-white">Pasadas</TabsTrigger>
        </TabsList>
        <TabsContent value="proximas">
            <Card className="border-white/5 bg-zinc-950/40">
                <CardHeader>
                  <CardTitle className="text-white">Llamadas Próximas</CardTitle>
                </CardHeader>
                <CardContent>
                    <CallsTable calls={llamadasProximas} visibleCount={visibleUpcoming} type="proximas" />
                </CardContent>
                {visibleUpcoming < llamadasProximas.length && (
                    <CardFooter className="justify-center border-t border-white/5 pt-4">
                        <Button variant="ghost" size="sm" onClick={() => setVisibleUpcoming(v => v + 40)} className="text-zinc-400">Cargar más</Button>
                    </CardFooter>
                )}
            </Card>
        </TabsContent>
        <TabsContent value="pasadas">
            <Card className="border-white/5 bg-zinc-950/40">
                <CardHeader>
                  <CardTitle className="text-white">Llamadas Pasadas</CardTitle>
                </CardHeader>
                <CardContent>
                    <CallsTable calls={llamadasPasadas} visibleCount={visiblePast} type="pasadas" />
                </CardContent>
                 {visiblePast < llamadasPasadas.length && (
                    <CardFooter className="justify-center border-t border-white/5 pt-4">
                        <Button variant="ghost" size="sm" onClick={() => setVisiblePast(v => v + 40)} className="text-zinc-400">Cargar más</Button>
                    </CardFooter>
                )}
            </Card>
        </TabsContent>
      </Tabs>
      )}
      
      <Dialog open={isFormOpen} onOpenChange={(isOpen) => { if(!isOpen) {setSelectedLlamada(undefined); setIsRescheduling(false);} setFormOpen(isOpen);}}>
        <AgendaForm 
            llamada={selectedLlamada} 
            isRescheduling={isRescheduling}
            onSubmit={selectedLlamada ? handleEditSubmit : handleAddSubmit}
            onDelete={selectedLlamada && !isRescheduling ? handleDeleteLlamada : undefined}
            setOpen={setFormOpen}
        />
      </Dialog>

      <Dialog open={isDetailOpen} onOpenChange={(isOpen) => { if(!isOpen) setSelectedLlamada(undefined); setDetailOpen(isOpen); }}>
        {selectedLlamada && <AgendaDetail 
            llamada={selectedLlamada} 
            onEdit={openEditDialog} 
            onReschedule={openRescheduleDialog}
            onSetStatus={(status) => handleSetStatus(selectedLlamada, status)}
             />}
      </Dialog>
    </>
  );
}
