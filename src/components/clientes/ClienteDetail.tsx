'use client';
import React from 'react';
import { usePagos } from '@/hooks/usePagos';
import type { Cliente, Pago, ProyectoEstado } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Briefcase, Mail, Phone, DollarSign, ClipboardCheck, CalendarDays, Pencil, CheckCircle } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '@/components/ui/button';
import { isBefore, parseISO, addMonths } from 'date-fns';
import { PagoDetail } from '../pagos/PagoDetail';
import { useToast } from '@/hooks/use-toast';
import { PagoForm } from '../pagos/PagoForm';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ClienteDetailProps {
  cliente: Cliente;
  clientes: Cliente[];
  onEditRequest: () => void;
  onUpdateCliente: (cliente: Cliente) => void;
}

export function ClienteDetail({ cliente, clientes, onEditRequest, onUpdateCliente }: ClienteDetailProps) {
  const { pagos, getPagosByClienteId, updatePago } = usePagos();
  const { toast } = useToast();
  
  const [now, setNow] = React.useState<Date | null>(null);
  const [isPagoDetailOpen, setPagoDetailOpen] = React.useState(false);
  const [selectedPago, setSelectedPago] = React.useState<Pago | undefined>(undefined);
  const [allPagos, setAllPagos] = React.useState<Pago[]>([]);
  const [isPagoFormOpen, setPagoFormOpen] = React.useState(false);
  const [editingPago, setEditingPago] = React.useState<Pago | undefined>(undefined);
  
  React.useEffect(() => {
    setNow(new Date());

    const clientPagos = getPagosByClienteId(cliente.id);
    let combinedPagos = [...clientPagos];
    const today = new Date();

    if (cliente.estado === 'activo' && cliente.diaDePago && cliente.cuotaMensual && cliente.cuotaMensual > 0) {
        const paymentDay = cliente.diaDePago;
        let nextPaymentDate = new Date(today.getFullYear(), today.getMonth(), paymentDay);
        
        if (isBefore(nextPaymentDate, today)) {
            nextPaymentDate = addMonths(nextPaymentDate, 1);
        }

        const existingRecurringPayment = clientPagos.find(p => 
            p.concepto === 'Mensualidad' &&
            parseISO(p.fechaLimite).getFullYear() === nextPaymentDate.getFullYear() &&
            parseISO(p.fechaLimite).getMonth() === nextPaymentDate.getMonth()
        );

        if (!existingRecurringPayment) {
            const syntheticPago: Pago = {
                id: `recurring-${cliente.id}-${nextPaymentDate.toISOString()}`,
                clienteId: cliente.id,
                monto: cliente.cuotaMensual,
                concepto: 'Mensualidad',
                fechaLimite: nextPaymentDate.toISOString(),
                estado: 'pendiente',
                notas: 'Pago recurrente autogenerado.',
            };
            combinedPagos.push(syntheticPago);
        }
    }

    const sorted = combinedPagos.sort((a, b) => {
        const dateA = parseISO(a.estado === 'pagado' && a.fechaPago ? a.fechaPago : a.fechaLimite);
        const dateB = parseISO(b.estado === 'pagado' && b.fechaPago ? b.fechaPago : b.fechaLimite);
        return dateB.getTime() - dateA.getTime();
    });
    
    setAllPagos(sorted);

  }, [cliente, getPagosByClienteId, pagos]);


  const totalAdeudo = allPagos
    .filter(p => p.estado === 'pendiente' && isBefore(parseISO(p.fechaLimite), new Date()))
    .reduce((sum, p) => sum + p.monto, 0);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  }
  
  const handlePagoClick = (pago: Pago) => {
    setSelectedPago(pago);
    setPagoDetailOpen(true);
  }
  
  const handleToggleStatusFromDetail = (pago: Pago) => {
    if (pago.estado === 'pendiente') {
      updatePago({ ...pago, estado: 'pagado', fechaPago: new Date().toISOString() });
      toast({ title: "Pago actualizado", description: `El pago ha sido marcado como pagado.` });
    } else {
       const { fechaPago, ...rest } = pago;
       updatePago({ ...rest, estado: 'pendiente' });
       toast({ title: "Pago actualizado", description: `El pago ha sido marcado como pendiente.` });
    }
    setPagoDetailOpen(false);
  }

  const handleOpenEditPago = (pago: Pago) => {
    setEditingPago(pago);
    setPagoDetailOpen(false);
    setPagoFormOpen(true);
  }

  const handleEditPagoSubmit = (values: any) => {
    if (editingPago) {
      updatePago({ ...editingPago, ...values });
      toast({ title: "Pago actualizado", description: "Los datos del pago han sido actualizados." });
      setPagoFormOpen(false);
      setEditingPago(undefined);
    }
  };

  const handleStatusToggle = (checked: boolean) => {
    const newStatus = checked ? 'activo' : 'inactivo';
    onUpdateCliente({ ...cliente, estado: newStatus });
    toast({ title: "Cliente actualizado", description: `El cliente ha sido marcado como ${newStatus}.` });
  };

  const handleProjectStatusChange = (newStatus: ProyectoEstado) => {
    if (cliente.proyecto) {
        onUpdateCliente({ ...cliente, proyecto: { ...cliente.proyecto, estado: newStatus } });
        toast({ title: "Proyecto actualizado", description: `El estado del proyecto es ahora: ${newStatus}.` });
    }
  };

  const handleConfirmDelivery = () => {
    if (cliente.proyecto) {
        onUpdateCliente({
            ...cliente,
            proyecto: {
                ...cliente.proyecto,
                estado: 'completado',
                fechaEntrega: new Date().toISOString(),
            }
        });
        toast({ title: "¡Entrega Confirmada!", description: "El proyecto ha sido marcado como completado." });
    }
  };

  const getPagoStatus = (pago: Pago): 'pagado' | 'pendiente' | 'vencido' => {
    if (pago.estado === 'pagado') return 'pagado';
    if (now && isBefore(parseISO(pago.fechaLimite), now)) {
      return 'vencido';
    }
    return 'pendiente';
  }

  return (
    <>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Expediente del Cliente</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto custom-scrollbar -mr-6 pr-6">
          <div className="grid gap-6 py-4">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start gap-6">
                <Avatar className="w-24 h-24 text-xl border-2 border-primary/10">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${cliente.nombre.replace(' ', '+')}&background=random`} />
                    <AvatarFallback>{getInitials(cliente.nombre)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-2">
                             <h2 className="text-2xl font-bold flex items-center gap-2">
                                {cliente.nombre}
                                <StatusBadge status={cliente.estado} />
                            </h2>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="client-status"
                                    checked={cliente.estado === 'activo'}
                                    onCheckedChange={handleStatusToggle}
                                />
                                <Label htmlFor="client-status" className="text-sm font-medium">
                                    {cliente.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                </Label>
                            </div>
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
            {(cliente.diaDePago || cliente.cuotaMensual) && (
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
                        {cliente.cuotaMensual && cliente.cuotaMensual > 0 && (
                            <div className="space-y-1">
                                <p className="font-semibold">Cuota Mensual</p>
                                <p className="text-sm text-muted-foreground">{formatCurrency(cliente.cuotaMensual)}</p>
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
                      <div className="space-y-1 md:col-span-3">
                          <p className="font-semibold">{cliente.proyecto.nombre}</p>
                          <p className="text-sm text-muted-foreground">{cliente.proyecto.descripcion}</p>
                      </div>
                      <div className="space-y-1">
                          <p className="font-semibold">Fecha de Entrega</p>
                          <p className="text-sm text-muted-foreground">{formatDate(cliente.proyecto.fechaEntrega)}</p>
                      </div>
                      <div className="space-y-1">
                          <p className="font-semibold">Estado</p>
                           <Select onValueChange={(value: ProyectoEstado) => handleProjectStatusChange(value)} value={cliente.proyecto.estado}>
                              <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Estado del proyecto" />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="en-progreso">En Progreso</SelectItem>
                                  <SelectItem value="completado">Completado</SelectItem>
                                  <SelectItem value="pausado">Pausado</SelectItem>
                                  <SelectItem value="cancelado">Cancelado</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                  </CardContent>
                  {cliente.proyecto.estado !== 'completado' && (
                      <CardFooter>
                          <Button onClick={handleConfirmDelivery}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Confirmar Entrega
                          </Button>
                      </CardFooter>
                  )}
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
                  {allPagos.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Concepto</TableHead>
                          <TableHead>Monto</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allPagos.map(pago => (
                          <TableRow key={pago.id} onClick={() => handlePagoClick(pago)} className="cursor-pointer">
                            <TableCell className="font-medium">{pago.concepto}</TableCell>
                            <TableCell>{formatCurrency(pago.monto)}</TableCell>
                            <TableCell>{formatDate(pago.estado === 'pagado' && pago.fechaPago ? pago.fechaPago : pago.fechaLimite)}</TableCell>
                            <TableCell><StatusBadge status={getPagoStatus(pago)} /></TableCell>
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
        </div>
      </DialogContent>
      
      <Dialog open={isPagoDetailOpen} onOpenChange={setPagoDetailOpen}>
        {selectedPago && <PagoDetail 
            pago={selectedPago}
            onOpenCliente={() => {}} 
            onToggleStatus={() => handleToggleStatusFromDetail(selectedPago)}
            onEditRequest={() => handleOpenEditPago(selectedPago)}
        />}
      </Dialog>
      <Dialog open={isPagoFormOpen} onOpenChange={setPagoFormOpen}>
        <PagoForm 
            pago={editingPago}
            clientes={clientes} 
            onSubmit={handleEditPagoSubmit}
            setOpen={setPagoFormOpen}
        />
      </Dialog>
    </>
  );
}
