'use client';

import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useClientes } from '@/hooks/useClientes';
import { useToast } from '@/hooks/use-toast';
import { Pago } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { differenceInDays, formatDistanceStrict, isAfter, isPast, isToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, User, Info, Notebook, ExternalLink, Copy, Pencil, CheckCircle } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';

interface PagoDetailProps {
  pago: Pago;
  onOpenCliente: (clienteId: string) => void;
  onToggleStatus: () => void;
  onEditRequest: () => void;
}

export function PagoDetail({ pago, onOpenCliente, onToggleStatus, onEditRequest }: PagoDetailProps) {
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

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <div className="flex items-center justify-start gap-4">
          <DialogTitle>Detalles del Pago</DialogTitle>
          <Button variant="outline" size="icon" onClick={onEditRequest}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Editar Pago</span>
          </Button>
        </div>
      </DialogHeader>

      <div className="py-2 space-y-6">
        <div className="text-center">
            <p className="text-4xl font-bold tracking-tighter">{formatCurrency(pago.monto)}</p>
            <p className="text-muted-foreground">{pago.concepto}</p>
        </div>

        <div className="space-y-4 rounded-lg border bg-muted/50 p-4 text-sm">
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><User className="w-4 h-4" /> Cliente</span>
                <span className="font-medium text-right">{cliente?.nombre}</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4" /> Fecha Límite</span>
                <span className={`font-medium ${getPagoStatus(pago) === 'vencido' ? 'text-status-danger' : ''}`}>{formatDate(pago.fechaLimite)}</span>
            </div>
            {pago.estado === 'pagado' && pago.fechaPago && (
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Fecha de Pago</span>
                    <span className={`font-medium ${wasPaidLate ? 'text-status-danger' : 'text-status-success'}`}>{formatDate(pago.fechaPago)}</span>
                </div>
            )}
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><Info className="w-4 h-4" /> Estado</span>
                <StatusBadge status={getPagoStatus(pago)} />
            </div>
        </div>
        
        {pago.notas && (
            <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2"><Notebook className="w-4 h-4 text-muted-foreground" /> Notas</h4>
                <p className="text-sm text-muted-foreground pl-4 border-l-2 ml-2">{pago.notas}</p>
            </div>
        )}
      </div>

      <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
          <Button onClick={onToggleStatus} size="lg" className="w-full">
            {pago.estado === 'pendiente' ? 'Marcar como Pagado' : 'Marcar como Pendiente'}
          </Button>
          <Button variant="outline" onClick={handleCopyReminder} disabled={pago.estado === 'pagado'} className="w-full">
              <Copy className="mr-2 h-4 w-4" />
              Copiar Recordatorio
          </Button>
          <Button variant="ghost" onClick={() => onOpenCliente(pago.clienteId)} className="w-full">
            <ExternalLink className="mr-2 h-4 w-4" />
            Ver Expediente del Cliente
          </Button>
      </DialogFooter>
    </DialogContent>
  )
}
