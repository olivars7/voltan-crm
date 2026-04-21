'use client';

import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useClientes } from '@/hooks/useClientes';
import { useToast } from '@/hooks/use-toast';
import { Pago } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { differenceInDays, formatDistanceStrict, isPast, isToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, User, DollarSign, Info, Notebook, ExternalLink, Copy } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';

interface PagoDetailProps {
  pago: Pago;
  onOpenCliente: (clienteId: string) => void;
  onToggleStatus: () => void;
}

export function PagoDetail({ pago, onOpenCliente, onToggleStatus }: PagoDetailProps) {
  const { getClienteById } = useClientes();
  const cliente = getClienteById(pago.clienteId);
  const { toast } = useToast();
  const isRecurring = String(pago.id).startsWith('recurring-');

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


  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Detalles del Pago - {pago.concepto}</DialogTitle>
        <DialogDescription>
          Pago de {cliente?.nombre || 'N/A'} por un monto de {formatCurrency(pago.monto)}.
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
                <Info className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold">Concepto:</span>
                <span>{pago.concepto}</span>
            </div>
            <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold">Monto:</span>
                <span>{formatCurrency(pago.monto)}</span>
            </div>
            <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold">{pago.estado === 'pagado' ? 'Fecha de Pago:' : 'Fecha Límite:'}</span>
                <span>{formatDate(pago.estado === 'pagado' ? pago.fechaPago! : pago.fechaLimite)}</span>
            </div>
             <div className="flex items-center gap-3">
                <StatusBadge status={pago.estado} />
            </div>
            {pago.notas && (
                <div className="flex items-start gap-3 pt-2">
                    <Notebook className="w-5 h-5 text-muted-foreground mt-1" />
                    <div>
                        <span className="font-semibold">Notas:</span>
                        <p className="text-sm text-muted-foreground">{pago.notas}</p>
                    </div>
                </div>
            )}
        </div>
      </div>
      <DialogFooter className="flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={handleCopyReminder} disabled={pago.estado === 'pagado'}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar Recordatorio
          </Button>

          {isRecurring ? (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span tabIndex={0}>
                            <Button disabled>
                                {pago.estado === 'pendiente' ? 'Marcar como Pagado' : 'Marcar como Pendiente'}
                            </Button>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Esta acción no está disponible para pagos recurrentes.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
          ) : (
             <Button onClick={onToggleStatus}>
                {pago.estado === 'pendiente' ? 'Marcar como Pagado' : 'Marcar como Pendiente'}
            </Button>
          )}

          <Button variant="ghost" onClick={() => onOpenCliente(pago.clienteId)}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Ver Expediente del Cliente
          </Button>
      </DialogFooter>
    </DialogContent>
  )
}
