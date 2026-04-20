'use client';
import { useClientes } from '@/hooks/useClientes';
import { useCitas } from '@/hooks/useCitas';
import { usePagos } from '@/hooks/usePagos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { addDays, isBefore, parseISO } from 'date-fns';

export default function DashboardPage() {
  const { clientes, getClienteById } = useClientes();
  const { citas } = useCitas();
  const { pagos } = usePagos();

  const activeClients = clientes.filter((c) => c.estado === 'activo').length;
  const pendingAppointments = citas.filter((c) => c.estado === 'pendiente').length;
  const pendingPayments = pagos.filter((p) => p.estado === 'pendiente');
  const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + p.monto, 0);

  const upcomingAppointments = citas
    .filter(c => c.estado === 'pendiente' && isBefore(parseISO(c.fecha), addDays(new Date(), 8)))
    .sort((a, b) => parseISO(a.fecha).getTime() - parseISO(b.fecha).getTime())
    .slice(0, 5);
    
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas Pendientes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAppointments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-status-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deuda Total</CardTitle>
            <DollarSign className="h-4 w-4 text-status-danger" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPendingAmount)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Citas Próximas</CardTitle>
          </CardHeader>
          <CardContent>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map(cita => (
                    <TableRow key={cita.id}>
                      <TableCell>{getClienteById(cita.clienteId)?.nombre || 'N/A'}</TableCell>
                      <TableCell>{formatDate(cita.fecha)}</TableCell>
                      <TableCell>{cita.hora}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">No hay citas próximas.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pagos Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Fecha Límite</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPayments.length > 0 ? (
                  pendingPayments.slice(0, 5).map(pago => (
                    <TableRow key={pago.id}>
                      <TableCell>{getClienteById(pago.clienteId)?.nombre || 'N/A'}</TableCell>
                      <TableCell>{formatCurrency(pago.monto)}</TableCell>
                      <TableCell>
                        <span className={isBefore(parseISO(pago.fechaLimite), new Date()) ? 'text-status-danger' : ''}>
                          {formatDate(pago.fechaLimite)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">No hay pagos pendientes.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
