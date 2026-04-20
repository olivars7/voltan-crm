'use client';

import { useCitas } from '@/hooks/useCitas';
import { usePagos } from '@/hooks/usePagos';
import type { Cliente, Cita } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Briefcase, Mail, Phone, Calendar as CalendarIcon, DollarSign, ClipboardCheck, CalendarDays, Pencil } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '@/components/ui/button';

interface ClienteDetailProps {
  cliente: Cliente;
  onCitaClick: (cita: Cita) => void;
  onEditRequest: () => void;
}

export function ClienteDetail({ cliente, onCitaClick, onEditRequest }: ClienteDetailProps) {
  const { getCitasByClienteId } = useCitas();
  const { getPagosByClienteId } = usePagos();

  const citas = getCitasByClienteId(cliente.id);
  const pagos = getPagosByClienteId(cliente.id);

  const totalAdeudo = pagos
    .filter(p => p.estado === 'pendiente')
    .reduce((sum, p) => sum + p.monto, 0);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  }

  return (
    <DialogContent className="sm:max-w-4xl max-h-[90vh]">
      <DialogHeader>
        <div className="flex justify-between items-start">
            <DialogTitle>Expediente del Cliente</DialogTitle>
            <Button variant="outline" size="icon" onClick={onEditRequest}>
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Editar Cliente</span>
            </Button>
        </div>
      </DialogHeader>
      <div className="grid gap-6 py-4 overflow-y-auto pr-4">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="w-24 h-24 text-xl border-2 border-primary/10">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${cliente.nombre.replace(' ', '+')}&background=random`} />
                <AvatarFallback>{getInitials(cliente.nombre)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
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
                    <div className="text-sm text-muted-foreground mt-2 sm:mt-0 sm:text-right">
                        <span>Cliente desde</span>
                        <p className="font-medium">{formatDate(cliente.fechaInicio)}</p>
                    </div>
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
                    {cliente.diaDePago && (
                        <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-muted-foreground" />
                            <span>Día de pago: {cliente.diaDePago} de cada mes</span>
                        </div>
                    )}
                </div>
            </div>
        </div>

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
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarIcon className="w-5 h-5" />
                Historial de Citas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {citas.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {citas.map(cita => (
                      <TableRow key={cita.id} onClick={() => onCitaClick(cita)} className="cursor-pointer">
                        <TableCell>{formatDate(cita.fecha)} a las {cita.hora}</TableCell>
                        <TableCell><StatusBadge status={cita.estado} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No hay citas registradas.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="w-5 h-5" />
                Historial de Pagos
              </CardTitle>
              {totalAdeudo > 0 && (
                 <CardDescription className="text-status-danger">
                   Adeudo total: {formatCurrency(totalAdeudo)}
                 </CardDescription>
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
