'use client';

import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useClientes } from '@/hooks/useClientes';
import { Cita } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Calendar, Clock, User, Info, Notebook, ExternalLink } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';

interface CitaDetailProps {
  cita: Cita;
  onOpenCliente: (clienteId: string) => void;
}

export function CitaDetail({ cita, onOpenCliente }: CitaDetailProps) {
  const { getClienteById } = useClientes();
  const cliente = getClienteById(cita.clienteId);

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Detalles de la Cita</DialogTitle>
        <DialogDescription>
          Cita con {cliente?.nombre || 'N/A'}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
            <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold">Cliente:</span>
                <span>{cliente?.nombre}</span>
            </div>
            <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold">Fecha:</span>
                <span>{formatDate(cita.fecha)}</span>
            </div>
            <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold">Hora:</span>
                <span>{cita.hora}</span>
            </div>
            <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold">Tipo:</span>
                <span className="capitalize">{cita.tipo}</span>
            </div>
             <div className="flex items-center gap-3">
                <StatusBadge status={cita.estado} />
            </div>
            {cita.notas && (
                <div className="flex items-start gap-3 pt-2">
                    <Notebook className="w-5 h-5 text-muted-foreground mt-1" />
                    <div>
                        <span className="font-semibold">Notas:</span>
                        <p className="text-sm text-muted-foreground">{cita.notas}</p>
                    </div>
                </div>
            )}
        </div>
        
        <Button onClick={() => onOpenCliente(cita.clienteId)}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Ver Expediente del Cliente
        </Button>
      </div>
    </DialogContent>
  )
}
