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
    toast({ title: "Agendado", description: "La nueva entrada ha sido guardada." });
    setFormOpen(false);
  }

  const handleEditSubmit = async (values: any) => {
    if(selectedLlamada) {
        if (isRescheduling) {
            await addLlamada(values);
            toast({ 
                title: "Reagendado", 
                description: "Se ha creado una nueva entrada a partir de los datos heredados." 
            });
        } else {
            const updatedLlamada = { ...selectedLlamada, ...values };
            await updateLlamada(updatedLlamada);
            toast({ title: "Actualizado", description: "La entrada ha sido actualizada." });
        }
        
        setFormOpen(false);
        setSelectedLlamada(undefined);
        setIsRescheduling(false);
    }
  }
  
  const handleDeleteLlamada = async () => {
    if (selectedLlamada) {
      if(window.confirm(`¿Estás seguro de que quieres eliminar a ${selectedLlamada.nombre}?`)){
          await deleteLlamada(selectedLlamada.id);
          toast({ title: "Eliminado" });
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
      fecha: status === 'realizada' ? now : llamada.fecha 
    };
    await updateLlamada(updatedLlamada);
    toast({ title: `Estado: ${status}`, description: "El estado ha sido actualizado." });
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
          llamada.telefono.toLowerCase().includes(search) ||
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
        <p className="text-center text-muted-foreground/40 py-8 text-sm font-medium">No hay eventos {type}.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/80 text-[10px] uppercase font-bold tracking-wider">Cliente/Interesado</TableHead>
              <TableHead className="text-white/80 text-[10px] uppercase font-bold tracking-wider">Contacto</TableHead>
              <TableHead className="text-white/80 text-[10px] uppercase font-bold tracking-wider">Fecha y Hora</TableHead>
              <TableHead className="text-white/80 text-[10px] uppercase font-bold tracking-wider">Medio</TableHead>
              <TableHead className="text-white/80 text-[10px] uppercase font-bold tracking-wider">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {calls.slice(0, visibleCount).map((llamada) => (
              <TableRow key={llamada.id} onClick={() => openDetailDialog(llamada)} className="cursor-pointer border-white/5 hover:bg-white/10 group">
                <TableCell className="font-medium text-xs text-white">{llamada.nombre}</TableCell>
                <TableCell className="text-zinc-300 text-xs">{llamada.telefono}</TableCell>
                <TableCell className="text-zinc-300 text-xs">{formatDate(llamada.fecha, "d MMM, yyyy h:mm a")}</TableCell>
                <TableCell className="capitalize text-zinc-300 text-xs">{llamada.medio.replace('-', ' ')}</TableCell>
                <TableCell><StatusBadge status={getEffectiveStatus(llamada)} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );

  return (
    <div className="pb-20">
      <PageHeader
        title="Agenda"
        description="Gestiona tus eventos y mensajes programados."
      >
        <Button onClick={openNewDialog} className="bg-white/80 backdrop-blur-xl border-white/10 hover:bg-white/90 text-zinc-950">
          <PlusCircle className="mr-2 h-4 w-4" />
          Agendar
        </Button>
      </PageHeader>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
      <Tabs defaultValue="proximas">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-2">
            <TabsList className="bg-zinc-950/20 border border-white/10 p-1 h-10 backdrop-blur-3xl shrink-0">
                <TabsTrigger value="proximas" className="px-5 py-0 h-full text-xs font-bold transition-all">Próximas ({llamadasProximas.length})</TabsTrigger>
                <TabsTrigger value="pasadas" className="px-5 py-0 h-full text-xs font-bold transition-all">Pasadas ({llamadasPasadas.length})</TabsTrigger>
            </TabsList>
            <div className="relative w-full md:w-72 h-10">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 z-10" />
                <Input
                    type="search"
                    placeholder="Buscar en la agenda..."
                    className="w-full h-full pl-10 bg-zinc-950/20 border-white/10 text-white text-xs backdrop-blur-3xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <TabsContent value="proximas" className="mt-0">
            <Card className="border-white/10 bg-zinc-950/20 backdrop-blur-3xl shadow-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-white">Eventos Próximos</CardTitle>
                </CardHeader>
                <CardContent>
                    <CallsTable calls={llamadasProximas} visibleCount={visibleUpcoming} type="proximas" />
                </CardContent>
                {visibleUpcoming < llamadasProximas.length && (
                    <CardFooter className="justify-center border-t border-white/10 pt-4">
                        <Button variant="ghost" size="sm" onClick={() => setVisibleUpcoming(v => v + 40)} className="text-xs text-zinc-500 hover:text-white">Cargar más</Button>
                    </CardFooter>
                )}
            </Card>
        </TabsContent>
        <TabsContent value="pasadas" className="mt-0">
            <Card className="border-white/10 bg-zinc-950/20 backdrop-blur-3xl shadow-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-white">Registro Histórico</CardTitle>
                </CardHeader>
                <CardContent>
                    <CallsTable calls={llamadasPasadas} visibleCount={visiblePast} type="pasadas" />
                </CardContent>
                 {visiblePast < llamadasPasadas.length && (
                    <CardFooter className="justify-center border-t border-white/10 pt-4">
                        <Button variant="ghost" size="sm" onClick={() => setVisiblePast(v => v + 40)} className="text-xs text-zinc-500 hover:text-white">Cargar más</Button>
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
    </div>
  );
}
