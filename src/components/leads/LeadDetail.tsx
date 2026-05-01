'use client';

import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import type { Lead } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { User, Phone, Briefcase, Notebook, Pencil, CheckSquare } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import { serviceDisplayNames } from './ServiciosCheckboxes';

interface LeadDetailProps {
  lead: Lead;
  onEdit?: () => void;
}

export function LeadDetail({ lead, onEdit }: LeadDetailProps) {
  
  return (
    <DialogContent className="sm:max-w-md bg-zinc-950/80 backdrop-blur-3xl border-white/10 shadow-2xl rounded-3xl">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold tracking-tight">Detalles del Lead</DialogTitle>
      </DialogHeader>

      <div className="py-2 space-y-6">
        <div className="text-center py-4 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-2xl font-bold tracking-tighter text-white">{lead.nombre}</p>
            <p className="text-sm text-muted-foreground mt-1">{lead.telefono}</p>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/5 bg-white/5 p-5 text-sm">
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary" /> Nicho</span>
                <span className="font-medium text-white">{lead.nicho}</span>
            </div>
             <div className="flex items-start justify-between">
                <span className="text-muted-foreground flex items-center gap-2 pt-1"><CheckSquare className="w-4 h-4 text-primary" /> Servicios</span>
                <div className="flex flex-col items-end gap-1 text-right">
                    {lead.servicios.map(servicio => (
                        <span key={servicio} className="font-medium capitalize text-zinc-300">{serviceDisplayNames[servicio]}</span>
                    ))}
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Estado</span>
                <StatusBadge status={lead.estado} />
            </div>
        </div>
        
        {lead.notas && (
            <div className="space-y-2 p-4 bg-white/5 rounded-2xl border border-white/5">
                <h4 className="font-medium text-xs uppercase tracking-widest flex items-center gap-2 text-muted-foreground"><Notebook className="w-3 h-3" /> Notas</h4>
                <p className="text-sm text-zinc-300 pl-1">{lead.notas}</p>
            </div>
        )}
         <div className="text-[10px] text-muted-foreground/40 text-center pt-2 uppercase tracking-widest font-semibold">
            Lead creado el {formatDate(lead.fechaCreacion)}
         </div>
      </div>

       {onEdit && (
        <DialogFooter className="pt-4 border-t border-white/5 mt-2">
            <Button onClick={onEdit} className="w-full bg-primary shadow-lg shadow-primary/20 h-11">
                <Pencil className="mr-2 h-4 w-4" />
                Editar Lead
            </Button>
        </DialogFooter>
       )}
    </DialogContent>
  )
}
