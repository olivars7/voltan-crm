'use client';

import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import type { LlamadaAgendada } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Calendar, Phone, Video, Info, Notebook, Pencil, CalendarPlus } from 'lucide-react';
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
        case 'llamada': return <Phone className="w-4 h-4 text-muted-foreground" />;
        case 'google-meet': return <Video className="w-4 h-4 text-muted-foreground" />;
        case 'zoom': return <Video className="w-4 h-4 text-muted-foreground" />;
        default: return null;
    }
  }
  
  const formattedMedio = llamada.medio.replace('-', ' ');

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Detalles de la Llamada</DialogTitle>
      </DialogHeader>

      <div className="py-2 space-y-6">
        <div className="text-center">
            <p className="text-2xl font-bold tracking-tighter">{llamada.nombre}</p>
            <p className="text-muted-foreground">{llamada.telefono}</p>
        </div>

        <div className="space-y-4 rounded-lg border bg-muted/50 p-4 text-sm">
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4" /> Fecha y Hora</span>
                <span className="font-medium">{formatDate(llamada.fecha, "d MMM, yyyy 'a las' h:mm a")}</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><MedioIcon medio={llamada.medio}/> Medio</span>
                <span className="font-medium capitalize">{formattedMedio}</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><Info className="w-4 h-4" /> Estado</span>
                <StatusBadge status={llamada.estado} />
            </div>
        </div>
        
        {llamada.notas && (
            <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2"><Notebook className="w-4 h-4 text-muted-foreground" /> Notas</h4>
                <p className="text-sm text-muted-foreground pl-4 border-l-2 ml-2">{llamada.notas}</p>
            </div>
        )}
      </div>

       {llamada.estado !== 'realizada' && llamada.estado !== 'cancelada' && (
        <div className="grid grid-cols-2 gap-2 pt-4">
          <Button variant="destructive" onClick={() => onSetStatus('cancelada')}>
            Cancelar
          </Button>
          <Button className="bg-status-success hover:bg-status-success/90" onClick={() => onSetStatus('realizada')}>
            Confirmar
          </Button>
        </div>
      )}

      {onReschedule && onEdit && (
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end pt-4 border-t mt-4">
            <Button variant="outline" onClick={onReschedule} >
                <CalendarPlus className="mr-2 h-4 w-4" />
                Reagendar
            </Button>
            <Button onClick={onEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
            </Button>
        </DialogFooter>
       )}
    </DialogContent>
  )
}
