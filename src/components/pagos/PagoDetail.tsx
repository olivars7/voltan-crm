'use client';

import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useClientes } from '@/hooks/useClientes';
import { Pago } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Calendar, User, DollarSign, Info, Notebook, ExternalLink } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';

interface PagoDetailProps {
  pago: Pago;
  onOpenCliente: (clienteId: string) => void;
  onToggleStatus: () => void;
}

export function PagoDetail({ pago, onOpenCliente, onToggleStatus }: PagoDetailProps) {
  const { getClienteById } = useClientes();
  const cliente = getClienteById(pago.clienteId);

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Detalles del Pago</DialogTitle>
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
          <Button onClick={onToggleStatus}>
            {pago.estado === 'pendiente' ? 'Marcar como Pagado' : 'Marcar como Pendiente'}
          </Button>
          <Button variant="ghost" onClick={() => onOpenCliente(pago.clienteId)}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Ver Expediente del Cliente
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
