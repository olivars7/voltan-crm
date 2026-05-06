'use client';

import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Lead } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { User, Phone, Briefcase, Notebook, Pencil, CheckSquare, History, MessageSquare, Copy } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import { serviceDisplayNames } from './ServiciosCheckboxes';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface LeadDetailProps {
  lead: Lead;
  onEdit?: () => void;
}

export function LeadDetail({ lead, onEdit }: LeadDetailProps) {
  const { toast } = useToast();
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleCopyContact = (contact: string) => {
    navigator.clipboard.writeText(contact);
    toast({
      title: "Copiado",
      description: `${contact} ha sido copiado al portapapeles.`
    });
  };

  const getEntryStyles = (estado: string, isLast: boolean) => {
    if (!isLast) return "bg-white/5 text-zinc-500 border-white/5 opacity-60";
    
    switch (estado) {
        case 'convertido': return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        case 'no-interesado': return "bg-rose-500/10 text-rose-400 border-rose-500/20";
        case 'demo-agendada': return "bg-amber-500/10 text-amber-400 border-amber-500/20";
        default: return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const getDotStyles = (estado: string, isLast: boolean) => {
    if (!isLast) return "bg-zinc-700";
    
    switch (estado) {
        case 'convertido': return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
        case 'no-interesado': return "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]";
        case 'demo-agendada': return "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]";
        default: return "bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]";
    }
  };

  return (
    <DialogContent className="sm:max-w-lg bg-zinc-950/90 backdrop-blur-3xl border-white/10 shadow-2xl rounded-[2.5rem] overflow-hidden p-0 gap-0">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      
      <DialogHeader className="p-8 pb-4 relative z-10">
        <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="w-20 h-20 border-2 border-white/10 shadow-2xl">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${lead.nombre.replace(/ /g, '+')}&background=random&color=fff`} />
                <AvatarFallback className="bg-zinc-800 text-xl font-bold">{getInitials(lead.nombre)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
                <DialogTitle className="text-2xl font-bold tracking-tighter text-white">{lead.nombre}</DialogTitle>
                <div 
                  className="flex items-center justify-center gap-2 text-zinc-400 text-sm cursor-pointer hover:text-primary transition-colors group py-1 px-3 rounded-full hover:bg-white/5"
                  onClick={() => handleCopyContact(lead.telefono)}
                >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{lead.telefono}</span>
                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100" />
                </div>
            </div>
        </div>
      </DialogHeader>

      <div className="px-8 pb-8 space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar relative z-10">
        
        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                    <Briefcase className="w-3 h-3" /> Nicho
                </p>
                <p className="text-sm font-semibold text-white truncate">{lead.nicho}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                    <User className="w-3 h-3" /> Estado Actual
                </p>
                <div className="flex">
                    <StatusBadge status={lead.estado} />
                </div>
            </div>
        </div>

        {/* Services Chips */}
        <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                <CheckSquare className="w-3.5 h-3.5" /> Servicios de Interés
            </h4>
            <div className="flex flex-wrap gap-2">
                {lead.servicios.map(servicio => (
                    <div key={servicio} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-white/10">
                        {serviceDisplayNames[servicio]}
                    </div>
                ))}
            </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                <History className="w-3.5 h-3.5" /> Línea de Tiempo
            </h4>
            <div className="relative pl-2 space-y-6 before:absolute before:inset-0 before:left-[11px] before:w-px before:bg-white/10 before:my-2">
                {lead.historial && [...lead.historial].reverse().map((entry, idx) => {
                    const isLast = idx === 0;
                    return (
                        <div key={idx} className="relative pl-8 group">
                            <div className={cn(
                                "absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full z-10 transition-transform duration-300 group-hover:scale-125", 
                                getDotStyles(entry.estado, isLast)
                            )} />
                            <div className={cn(
                                "p-3 rounded-2xl border text-xs transition-all duration-300", 
                                getEntryStyles(entry.estado, isLast)
                            )}>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold capitalize">{entry.estado.replace(/-/g, ' ')}</span>
                                    <span className="text-[10px] opacity-60 font-medium">{formatDate(entry.fecha, "d MMM, h:mm a")}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
        
        {/* Notes */}
        {lead.notas && (
            <div className="space-y-3 p-5 bg-white/5 rounded-3xl border border-white/5 relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] transition-transform duration-500 group-hover:scale-110">
                    <MessageSquare className="w-20 h-20 text-white" />
                </div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                    <Notebook className="w-3.5 h-3.5" /> Observaciones
                </h4>
                <p className="text-sm text-zinc-300 leading-relaxed italic pr-2 border-l-2 border-primary/20 pl-4">
                    "{lead.notas}"
                </p>
            </div>
        )}

         <div className="text-[9px] text-muted-foreground/30 text-center pt-4 uppercase tracking-[0.3em] font-bold">
            Expediente creado el {formatDate(lead.fechaCreacion)}
         </div>
      </div>

       {onEdit && (
        <DialogFooter className="p-6 border-t border-white/5 bg-zinc-950/50">
            <Button onClick={onEdit} className="w-full bg-primary hover:bg-primary/90 text-white font-bold shadow-xl shadow-primary/20 h-12 rounded-2xl transition-all active:scale-[0.98]">
                <Pencil className="mr-2 h-4 w-4" />
                Editar Información del Lead
            </Button>
        </DialogFooter>
       )}
    </DialogContent>
  )
}
