'use client';

import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import type { Lead } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { User, Phone, Briefcase, Notebook, Pencil, CheckSquare, History } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import { serviceDisplayNames } from './ServiciosCheckboxes';
import { cn } from '@/lib/utils';

interface LeadDetailProps {
  lead: Lead;
  onEdit?: () => void;
}

export function LeadDetail({ lead, onEdit }: LeadDetailProps) {
  
  const getEntryColor = (estado: string, isLast: boolean) => {
    if (!isLast) return "bg-zinc-800 text-zinc-500 border-zinc-700";
    if (estado === 'convertido') return "bg-status-success/20 text-status-success border-status-success/30";
    if (estado === 'no-interesado') return "bg-status-danger/20 text-status-danger border-status-danger/30";
    return "bg-status-warning/20 text-status-warning border-status-warning/30";
  };

  const getDotColor = (estado: string, isLast: boolean) => {
    if (!isLast) return "bg-zinc-600";
    if (estado === 'convertido') return "bg-status-success shadow-[0_0_8px_rgba(34,197,94,0.6)]";
    if (estado === 'no-interesado') return "bg-status-danger shadow-[0_0_8px_rgba(239,68,68,0.6)]";
    return "bg-status-warning shadow-[0_0_8px_rgba(234,179,8,0.6)]";
  };

  return (
    <DialogContent className="sm:max-w-md bg-zinc-950/80 backdrop-blur-3xl border-white/10 shadow-2xl rounded-3xl">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold tracking-tight">Detalles del Lead</DialogTitle>
      </DialogHeader>

      <div className="py-2 space-y-6 overflow-y-auto max-h-[70vh] no-scrollbar">
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

        {/* Historial de Estados */}
        <div className="space-y-4 p-5 bg-white/5 rounded-2xl border border-white/5">
            <h4 className="font-bold text-xs uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                <History className="w-3.5 h-3.5" /> Historial de Progreso
            </h4>
            <div className="space-y-4 relative before:absolute before:inset-0 before:left-2 before:w-px before:bg-white/10 before:my-2">
                {lead.historial && lead.historial.map((entry, idx) => {
                    const isLast = idx === lead.historial.length - 1;
                    return (
                        <div key={idx} className="relative pl-8 animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                            <div className={cn("absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-zinc-950 z-10", getDotColor(entry.estado, isLast))} />
                            <div className={cn("p-2 rounded-xl border text-[11px] font-medium transition-all", getEntryColor(entry.estado, isLast))}>
                                <div className="flex justify-between items-center mb-0.5">
                                    <span className="capitalize">{entry.estado.replace(/-/g, ' ')}</span>
                                    <span className="opacity-60">{formatDate(entry.fecha, "d MMM, h:mm a")}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
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
