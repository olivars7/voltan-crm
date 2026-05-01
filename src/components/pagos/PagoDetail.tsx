'use client';

import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useClientes } from '@/hooks/useClientes';
import { useToast } from '@/hooks/use-toast';
import { Pago } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { differenceInDays, formatDistanceStrict, isAfter, isPast, isToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, User, Info, Notebook, ExternalLink, Copy, Pencil, CheckCircle, Trash2 } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';

interface PagoDetailProps {
  pago: Pago;
  onOpenCliente: (clienteId: string) => void;
  onToggleStatus: () => void;
  onEditRequest: () => void;
  onDeleteRequest?: () => void;
}

export function PagoDetail({ pago, onOpenCliente, onToggleStatus, onEditRequest, onDeleteRequest }: PagoDetailProps) {
  const { getClienteById } = useClientes();
  const cliente = getClienteById(pago.clienteId);
  const { toast } = useToast();

  const handleCopyReminder = () => {
    if (!cliente) return;

    const dueDate = parseISO(pago.fechaLimite);
    const clientName = cliente.nombre;
    const amount = formatCurrency(pago.monto);
    const concept = pago.concepto;
    let reminderText = '';
    const now = new Date();

    if (isPast(dueDate) && !isToday(dueDate)) {
        const daysText = formatDistanceStrict(dueDate, now, { unit: 'day', locale: es, addSuffix: false });
        const daysOverdue = differenceInDays(now, dueDate);
        if (daysOverdue > 15) {
            reminderText = `Hola ${clientName}, te informamos que tu pago de ${amount} por concepto de '${concept}' tiene un atraso de ${daysText}. Para evitar la suspensión de tu servicio, te pedimos regularizar tu situación a la brevedad.`;
        } else {
            reminderText = `Hola ${clientName}, te informamos que tu pago de ${amount} por concepto de '${concept}' tiene un atraso de ${daysText}. Te pedimos realizarlo a la brevedad.`;
        }
    } else if (isToday(dueDate)) {
        reminderText = `Hola ${clientName}, te recordamos que tu pago de ${amount} por concepto de '${concept}' vence el día de hoy.`;
    } else {
        const daysText = formatDistanceStrict(now, dueDate, { unit: 'day', locale: es, addSuffix: false });
        reminderText = `Hola ${clientName}, te recordamos que tu pago de ${amount} por concepto de '${concept}' vence en ${daysText}.`;
    }

    navigator.clipboard.writeText(reminderText).then(() => {
        toast({
            title: "Recordatorio copiado",
            description: "El mensaje de recordatorio se ha copiado al portapapeles.",
        });
    });
  };
  
  const wasPaidLate = pago.fechaPago && isAfter(parseISO(pago.fechaPago), parseISO(pago.fechaLimite));
  const getPagoStatus = (pago: Pago): 'pagado' | 'pendiente' | 'vencido' => {
    if (pago.estado === 'pagado') return 'pagado';
    if (isPast(parseISO(pago.fechaLimite)) && !isToday(parseISO(pago.fechaLimite))) {
      return 'vencido';
    }
    return 'pendiente';
  }

  const isSynthetic = pago.id.startsWith('recurring-');

  return (
    <DialogContent className="sm:max-w-md bg-zinc-950/80 backdrop-blur-3xl border-white/10 shadow-2xl rounded-3xl text-white">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle className="text-xl font-bold tracking-tight text-white">Detalles del Pago</DialogTitle>
          <div className="flex gap-2">
            {!isSynthetic && onDeleteRequest && (
              <Button 
                variant="outline" 
                size="icon" 
                onClick={onDeleteRequest} 
                className="bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20 text-rose-500 h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Eliminar Pago</span>
              </Button>
            )}
            <Button variant="outline" size="icon" onClick={onEditRequest} className="bg-white/5 border-white/10 hover:bg-white/10 text-white h-8 w-8">
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Editar Pago</span>
            </Button>
          </div>
        </div>
      </DialogHeader>

      <div className="py-2 space-y-6">
        <div className="text-center py-6 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-4xl font-bold tracking-tighter text-white">{formatCurrency(pago.monto)}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1 font-bold">{pago.concepto}</p>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm">
            <div className="flex items-center justify-between">
                <span className="text-zinc-400 flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Cliente</span>
                <span className="font-semibold text-right text-white">{cliente?.nombre}</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-zinc-400 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Fecha Límite</span>
                <span className={`font-semibold ${getPagoStatus(pago) === 'vencido' ? 'text-status-danger' : 'text-white'}`}>{formatDate(pago.fechaLimite)}</span>
            </div>
            {pago.estado === 'pagado' && pago.fechaPago && (
                <div className="flex items-center justify-between">
                    <span className="text-zinc-400 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-status-success" /> Fecha de Pago</span>
                    <span className={`font-semibold ${wasPaidLate ? 'text-status-danger' : 'text-status-success'}`}>{formatDate(pago.fechaPago)}</span>
                </div>
            )}
            <div className="flex items-center justify-between">
                <span className="text-zinc-400 flex items-center gap-2"><Info className="w-4 h-4 text-primary" /> Estado</span>
                <StatusBadge status={getPagoStatus(pago)} />
            </div>
        </div>
        
        {pago.notas && (
            <div className="space-y-2 p-4 bg-white/5 rounded-2xl border border-white/10">
                <h4 className="font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 text-zinc-400"><Notebook className="w-3 h-3" /> Notas</h4>
                <p className="text-xs text-zinc-300 pl-1 leading-relaxed">{pago.notas}</p>
            </div>
        )}
      </div>

      <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0 pt-4 border-t border-white/10 mt-2">
          <Button onClick={onToggleStatus} size="lg" className="w-full bg-primary shadow-lg shadow-primary/20 h-11 text-white hover:bg-primary/90">
            {pago.estado === 'pendiente' ? 'Marcar como Pagado' : 'Marcar como Pendiente'}
          </Button>
          <Button variant="outline" onClick={handleCopyReminder} disabled={pago.estado === 'pagado'} className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white h-11">
              <Copy className="mr-2 h-4 w-4" />
              Copiar Recordatorio
          </Button>
          <Button variant="ghost" onClick={() => onOpenCliente(pago.clienteId)} className="w-full h-8 text-[10px] text-zinc-500 hover:text-white">
            <ExternalLink className="mr-2 h-3 w-3" />
            Ver Expediente del Cliente
          </Button>
      </DialogFooter>
    </DialogContent>
  )
}
