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
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Detalles del Lead</DialogTitle>
      </DialogHeader>

      <div className="py-2 space-y-6">
        <div className="text-center">
            <p className="text-2xl font-bold tracking-tighter">{lead.nombre}</p>
            <p className="text-muted-foreground">{lead.telefono}</p>
        </div>

        <div className="space-y-4 rounded-lg border bg-muted/50 p-4 text-sm">
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><Briefcase className="w-4 h-4" /> Nicho</span>
                <span className="font-medium">{lead.nicho}</span>
            </div>
             <div className="flex items-start justify-between">
                <span className="text-muted-foreground flex items-center gap-2 pt-1"><CheckSquare className="w-4 h-4" /> Servicios</span>
                <div className="flex flex-col items-end gap-1 text-right">
                    {lead.servicios.map(servicio => (
                        <span key={servicio} className="font-medium capitalize">{serviceDisplayNames[servicio]}</span>
                    ))}
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><User className="w-4 h-4" /> Estado</span>
                <StatusBadge status={lead.estado} />
            </div>
        </div>
        
        {lead.notas && (
            <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2"><Notebook className="w-4 h-4 text-muted-foreground" /> Notas</h4>
                <p className="text-sm text-muted-foreground pl-4 border-l-2 ml-2">{lead.notas}</p>
            </div>
        )}
         <div className="text-xs text-muted-foreground text-center pt-2">
            Lead creado el {formatDate(lead.fechaCreacion)}
         </div>
      </div>

       {onEdit && (
        <DialogFooter className="pt-4 border-t mt-2">
            <Button onClick={onEdit} className="w-full">
                <Pencil className="mr-2 h-4 w-4" />
                Editar Lead
            </Button>
        </DialogFooter>
       )}
    </DialogContent>
  )
}
