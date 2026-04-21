'use client';

import { usePagos } from '@/hooks/usePagos';
import type { Cliente } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Briefcase, Mail, Phone, DollarSign, ClipboardCheck, CalendarDays, Pencil } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '@/components/ui/button';
import { isBefore, parseISO } from 'date-fns';

interface ClienteDetailProps {
  cliente: Cliente;
  onEditRequest: () => void;
}

export function ClienteDetail({ cliente, onEditRequest }: ClienteDetailProps) {
  const { getPagosByClienteId } = usePagos();

  const pagos = getPagosByClienteId(cliente.id);

  const totalAdeudo = pagos
    .filter(p => p.estado === 'pendiente' && isBefore(parseISO(p.fechaLimite), new Date()))
    .reduce((sum, p) => sum + p.monto, 0);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  }

  return (
    <DialogContent className="sm:max-w-4xl max-h-[90vh]">
      <DialogHeader>
        <DialogTitle>Expediente del Cliente</DialogTitle>
      </DialogHeader>
      <div className="grid gap-6 py-4 overflow-y-auto pr-4 custom-scrollbar">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="w-24 h-24 text-xl border-2 border-primary/10">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${cliente.nombre.replace(' ', '+')}&background=random`} />
                <AvatarFallback>{getInitials(cliente.nombre)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            {cliente.nombre}
                            <StatusBadge status={cliente.estado} />
                        </h2>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            {cliente.empresa}
                        </p>
                    </div>
                    <Button variant="outline" size="icon" onClick={onEditRequest}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar Cliente</span>
                    </Button>
                </div>
                
                <Separator className="my-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{cliente.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{cliente.telefono}</span>
                    </div>
                </div>
                 <div className="text-sm text-muted-foreground mt-4">
                    <span>Cliente desde: </span>
                    <span className="font-medium">{formatDate(cliente.fechaInicio)}</span>
                </div>
            </div>
        </div>
        
        {/* Recurring Payment Details */}
        {(cliente.diaDePago || cliente.montoRecurrente) && (
            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <CalendarDays className="w-5 h-5" />
                        Pagos Recurrentes
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    {cliente.diaDePago && (
                         <div className="space-y-1">
                            <p className="font-semibold">Día de Pago Mensual</p>
                            <p className="text-sm text-muted-foreground">El día {cliente.diaDePago} de cada mes</p>
                        </div>
                    )}
                    {cliente.montoRecurrente && (
                        <div className="space-y-1">
                            <p className="font-semibold">Monto Recurrente</p>
                            <p className="text-sm text-muted-foreground">{formatCurrency(cliente.montoRecurrente)}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        )}

        {/* Project Details */}
        {cliente.proyecto && (
            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <ClipboardCheck className="w-5 h-5" />
                        Detalles del Proyecto
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1">
                        <p className="font-semibold">{cliente.proyecto.nombre}</p>
                        <p className="text-sm text-muted-foreground">{cliente.proyecto.descripcion}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold">Fecha de Entrega</p>
                        <p className="text-sm text-muted-foreground">{formatDate(cliente.proyecto.fechaEntrega)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold">Estado</p>
                        <StatusBadge status={cliente.proyecto.estado} />
                    </div>
                </CardContent>
            </Card>
        )}

        {/* History Section */}
        <div className="grid md:grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="w-5 h-5" />
                Historial de Pagos
              </CardTitle>
              {totalAdeudo > 0 && (
                 <p className="text-sm text-status-danger pt-1">
                   Adeudo total: {formatCurrency(totalAdeudo)}
                 </p>
              )}
            </CardHeader>
            <CardContent>
              {pagos.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Monto</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagos.map(pago => (
                      <TableRow key={pago.id}>
                        <TableCell>{formatCurrency(pago.monto)}</TableCell>
                        <TableCell>{formatDate(pago.estado === 'pagado' ? pago.fechaPago! : pago.fechaLimite)}</TableCell>
                        <TableCell><StatusBadge status={pago.estado} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No hay pagos registrados.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DialogContent>
  );
}
