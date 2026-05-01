'use client';

import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import type { LlamadaAgendada } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Calendar, Phone, Video, Info, Notebook, Pencil, CalendarPlus, CheckCircle } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import React from 'react';

interface AgendaDetailProps {
  llamada: LlamadaAgendada;
  onSetStatus: (status: 'realizada' | 'cancelada') => void;
  onEdit?: () => void;
  onReschedule?: () => void;
}

export function AgendaDetail({ llamada, onSetStatus, onEdit, onReschedule }: AgendaDetailProps) {
  
  const MedioIcon = ({ medio }: { medio: LlamadaAgendada['medio'] }) => {
    switch (medio) {
        case 'llamada': return <Phone className="w-4 h-4 text-primary" />;
        case 'google-meet': return <Video className="w-4 h-4 text-primary" />;
        case 'zoom': return <Video className="w-4 h-4 text-primary" />;
        default: return null;
    }
  }
  
  const formattedMedio = llamada.medio.replace('-', ' ');

  return (
    <DialogContent className="sm:max-w-md bg-zinc-950/80 backdrop-blur-3xl border-white/10 shadow-2xl rounded-3xl">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle className="text-xl font-bold tracking-tight">Detalles de la Llamada</DialogTitle>
          {onEdit && (
            <Button variant="outline" size="icon" onClick={onEdit} className="bg-white/5 border-white/10 hover:bg-white/10 h-8 w-8">
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Editar</span>
            </Button>
          )}
        </div>
      </DialogHeader>

      <div className="py-2 space-y-6">
        <div className="text-center py-4 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-2xl font-bold tracking-tighter text-white">{llamada.nombre}</p>
            <p className="text-sm text-muted-foreground mt-1">{llamada.telefono}</p>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/5 bg-white/5 p-5 text-sm">
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Fecha y Hora</span>
                <span className="font-medium text-right text-white">{formatDate(llamada.fecha, "d MMM, yyyy 'a las' h:mm a")}</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><MedioIcon medio={llamada.medio}/> Medio</span>
                <span className="font-medium capitalize text-white">{formattedMedio}</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><Info className="w-4 h-4 text-primary" /> Estado</span>
                <StatusBadge status={llamada.estado} />
            </div>
        </div>
        
        {llamada.notas && (
            <div className="space-y-2 p-4 bg-white/5 rounded-2xl border border-white/5">
                <h4 className="font-medium text-xs uppercase tracking-widest flex items-center gap-2 text-muted-foreground"><Notebook className="w-3 h-3" /> Notas</h4>
                <p className="text-sm text-zinc-300 pl-1">{llamada.notas}</p>
            </div>
        )}
      </div>

       {llamada.estado !== 'realizada' && llamada.estado !== 'cancelada' && (
        <div className="grid grid-cols-2 gap-3 pt-4">
          <Button variant="destructive" onClick={() => onSetStatus('cancelada')} className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/20 h-11">
            Cancelar
          </Button>
          <Button className="bg-status-success hover:bg-status-success/90 h-11 shadow-lg shadow-status-success/20" onClick={() => onSetStatus('realizada')}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Completar
          </Button>
        </div>
      )}

      {onReschedule && (
        <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0 pt-4 border-t border-white/5">
            <Button variant="outline" onClick={onReschedule} className="w-full bg-white/5 border-white/10 hover:bg-white/10">
                <CalendarPlus className="mr-2 h-4 w-4" />
                Reagendar Llamada
            </Button>
        </DialogFooter>
       )}
    </DialogContent>
  )
}
