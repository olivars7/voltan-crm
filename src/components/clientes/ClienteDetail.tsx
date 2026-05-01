'use client';
import React from 'react';
import { usePagos } from '@/hooks/usePagos';
import type { Cliente, Pago, ProyectoEstado } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { Briefcase, Mail, Phone, DollarSign, ClipboardCheck, CalendarDays, Pencil, CheckCircle, Loader2, ExternalLink, Copy } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '@/components/ui/button';
import { isBefore, parseISO, addMonths, startOfMonth } from 'date-fns';
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
  const { pagos, getPagosByClienteId, updatePago, deletePago, loading: pagosLoading } = usePagos();
  const { toast } = useToast();
  
  const [now, setNow] = React.useState<Date | null>(null);
  const [isPagoDetailOpen, setPagoDetailOpen] = React.useState(false);
  const [selectedPago, setSelectedPago] = React.useState<Pago | undefined>(undefined);
  const [allPagos, setAllPagos] = React.useState<Pago[]>([]);
  const [isPagoFormOpen, setPagoFormOpen] = React.useState(false);
  const [editingPago, setEditingPago] = React.useState<Pago | undefined>(undefined);
  const [visiblePagos, setVisiblePagos] = React.useState(40);
  
  React.useEffect(() => {
    const today = new Date();
    setNow(today);

    const clientPagos = getPagosByClienteId(cliente.id);
    let combinedPagos: Pago[] = [...clientPagos];

    if (cliente.estado === 'activo' && cliente.diaDePago && cliente.cuotaMensual && cliente.cuotaMensual > 0) {
        const paymentDay = cliente.diaDePago;
        let cursorDate = startOfMonth(parseISO(cliente.fechaInicio));

        while (isBefore(cursorDate, addMonths(startOfMonth(today), 1))) {
          const paymentDueDate = new Date(
            cursorDate.getFullYear(),
            cursorDate.getMonth(),
            paymentDay
          );

          if (isBefore(paymentDueDate, addMonths(today, 1))) {
            const existingPayment = pagos.find(
              (p) =>
                p.clienteId === cliente.id &&
                p.concepto === 'Mensualidad' &&
                parseISO(p.fechaLimite).getFullYear() === paymentDueDate.getFullYear() &&
                parseISO(p.fechaLimite).getMonth() === paymentDueDate.getMonth()
            );

            if (!existingPayment) {
              const syntheticPago: Pago = {
                id: `recurring-${cliente.id}-${paymentDueDate.toISOString()}`,
                clienteId: cliente.id,
                monto: cliente.cuotaMensual,
                concepto: 'Mensualidad',
                fechaLimite: paymentDueDate.toISOString(),
                estado: 'pendiente',
                notas: 'Pago recurrente autogenerado.',
              };
              combinedPagos.push(syntheticPago);
            }
          }
          cursorDate = addMonths(cursorDate, 1);
        }
    }

    const sorted = combinedPagos.sort((a, b) => {
        const dateA = parseISO(a.fechaLimite);
        const dateB = parseISO(b.fechaLimite);
        return dateB.getTime() - dateA.getTime();
    });
    
    setAllPagos(sorted);

  }, [cliente, getPagosByClienteId, pagos]);


  const totalAdeudo = allPagos
    .filter(p => p.estado === 'pendiente' && now && isBefore(parseISO(p.fechaLimite), now))
    .reduce((sum, p) => sum + p.monto, 0);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  }
  
  const handlePagoClick = (pago: Pago) => {
    setSelectedPago(pago);
    setPagoDetailOpen(true);
  }
  
  const handleToggleStatusFromDetail = async (pago: Pago) => {
    if (pago.estado === 'pendiente') {
      await updatePago({ ...pago, estado: 'pagado', fechaPago: new Date().toISOString() });
      toast({ title: "Pago actualizado", description: `El pago ha sido marcado como pagado.` });
    } else {
       const { fechaPago, ...rest } = pago;
       await updatePago({ ...rest, estado: 'pendiente' });
       toast({ title: "Pago actualizado", description: `El pago ha sido marcado como pendiente.` });
    }
    setPagoDetailOpen(false);
  }

  const handleOpenEditPago = (pago: Pago) => {
    setEditingPago(pago);
    setPagoDetailOpen(false);
    setPagoFormOpen(true);
  }

  const handleEditPagoSubmit = async (values: any) => {
    if (editingPago) {
      await updatePago({ ...editingPago, ...values });
      toast({ title: "Pago actualizado", description: "Los datos del pago han sido actualizados." });
      setPagoFormOpen(false);
      setEditingPago(undefined);
    }
  };

  const handleDeletePago = async () => {
    if (editingPago && !editingPago.id.startsWith('recurring-')) {
        if(window.confirm(`¿Estás seguro de que quieres eliminar este pago? Esta acción es permanente.`)){
            await deletePago(editingPago.id);
            toast({ title: "Pago eliminado", description: "El pago ha sido eliminado permanentemente." });
            setPagoFormOpen(false);
            setEditingPago(undefined);
            if (selectedPago?.id === editingPago.id) {
                setPagoDetailOpen(false);
                setSelectedPago(undefined);
            }
        }
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: "Copiado al portapapeles",
        description: `${label} copiado exitosamente.`
    });
  };

  const projectStatusSelectStyles: Record<ProyectoEstado, string> = {
    'en-progreso': 'text-status-warning border-status-warning/50 bg-status-warning/10 hover:bg-status-warning/20',
    'completado': 'text-status-success border-status-success/50 bg-status-success/10 hover:bg-status-success/20',
    'pausado': 'text-status-inactive border-status-inactive/50 bg-status-inactive/10 hover:bg-status-inactive/20',
    'cancelado': 'text-status-danger border-status-danger/50 bg-status-danger/10 hover:bg-status-danger/20',
  };

  return (
    <>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col bg-background/80 backdrop-blur-3xl border-border shadow-2xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Expediente del Cliente</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto custom-scrollbar -mr-6 pr-6">
          <div className="grid gap-6 py-4">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start gap-6">
                <Avatar className="w-24 h-24 text-xl border-2 border-border shadow-xl">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${cliente.nombre.replace(' ', '+')}&background=random`} />
                    <AvatarFallback>{getInitials(cliente.nombre)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-2">
                             <h2 
                                className="text-2xl font-bold flex items-center gap-2 cursor-pointer hover:text-primary transition-colors group"
                                onClick={() => copyToClipboard(cliente.nombre, "Nombre")}
                            >
                                {cliente.nombre}
                                <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <StatusBadge status={cliente.estado} />
                            </h2>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="client-status"
                                    checked={cliente.estado === 'activo'}
                                    onCheckedChange={handleStatusToggle}
                                />
                                <Label htmlFor="client-status" className="text-sm font-medium text-muted-foreground/80">
                                    {cliente.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                </Label>
                            </div>
                        </div>
                        <Button variant="outline" size="icon" onClick={onEditRequest} className="bg-muted/50 border-border hover:bg-muted">
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar Cliente</span>
                        </Button>
                    </div>
                    
                    <Separator className="my-4 border-border" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div 
                            className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors group text-muted-foreground"
                            onClick={() => copyToClipboard(cliente.email, "Correo")}
                        >
                            <Mail className="w-4 h-4 text-muted-foreground/60" />
                            <span>{cliente.email}</span>
                            <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div 
                            className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors group text-muted-foreground"
                            onClick={() => copyToClipboard(cliente.telefono, "Teléfono")}
                        >
                            <Phone className="w-4 h-4 text-muted-foreground/60" />
                            <span>{cliente.telefono}</span>
                            <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground/60 mt-4 uppercase tracking-widest font-semibold">
                        <span>Cliente desde: </span>
                        <span className="text-muted-foreground">{formatDate(cliente.fechaInicio)}</span>
                    </div>
                </div>
            </div>
            
            {/* Recurring Payment Details */}
            {(cliente.diaDePago || cliente.cuotaMensual) && (
                <Card className="border-border bg-muted/30 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground/60">
                            <CalendarDays className="w-4 h-4" />
                            Pagos Recurrentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        {cliente.diaDePago && (
                            <div className="space-y-1">
                                <p className="text-sm font-semibold">Día de Pago Mensual</p>
                                <p className="text-xs text-muted-foreground/60">El día {cliente.diaDePago} de cada mes</p>
                            </div>
                        )}
                        {cliente.cuotaMensual && cliente.cuotaMensual > 0 && (
                            <div className="space-y-1">
                                <p className="text-sm font-semibold">Cuota Mensual</p>
                                <p className="text-xs text-muted-foreground/60">{formatCurrency(cliente.cuotaMensual)}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Project Details */}
            {cliente.proyecto && (
              <Card className="border-border bg-muted/30 backdrop-blur-md">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground/60">
                          <ClipboardCheck className="w-4 h-4" />
                          Detalles del Proyecto
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-1 md:col-span-3">
                          <p className="text-base font-bold">{cliente.proyecto.nombre}</p>
                          <p className="text-xs text-muted-foreground/60">{cliente.proyecto.descripcion}</p>
                      </div>
                      <div className="space-y-1">
                          <p className="text-xs font-semibold text-muted-foreground/60 uppercase">Fecha de Entrega</p>
                          <p className="text-sm font-medium">{formatDate(cliente.proyecto.fechaEntrega)}</p>
                      </div>
                      <div className="space-y-1">
                          <p className="text-xs font-semibold text-muted-foreground/60 uppercase">Estado</p>
                           <Select onValueChange={(value: ProyectoEstado) => handleProjectStatusChange(value)} value={cliente.proyecto.estado}>
                              <SelectTrigger className={cn("w-[160px] h-8 bg-background border-border text-xs", projectStatusSelectStyles[cliente.proyecto.estado])}>
                                  <SelectValue placeholder="Estado" />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="en-progreso">En Progreso</SelectItem>
                                  <SelectItem value="completado">Completado</SelectItem>
                                  <SelectItem value="pausado">Pausado</SelectItem>
                                  <SelectItem value="cancelado">Cancelado</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                       {cliente.proyecto.websiteUrl && cliente.proyecto.websiteUrl !== '#' && (
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground/60 uppercase">Página Web</p>
                            <a href={cliente.proyecto.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
                                <span>Visitar sitio</span>
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                      )}
                  </CardContent>
                  {cliente.proyecto.estado !== 'completado' && (
                      <CardFooter>
                          <Button onClick={handleConfirmDelivery} className="w-full bg-status-success hover:bg-status-success/90 shadow-lg shadow-status-success/20">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Confirmar Entrega del Proyecto
                          </Button>
                      </CardFooter>
                  )}
              </Card>
            )}

            {/* History Section */}
            <Card className="border-border bg-muted/30 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground/60">
                  <DollarSign className="w-4 h-4" />
                  Historial de Pagos
                </CardTitle>
                {totalAdeudo > 0 && (
                  <p className="text-xs text-status-danger font-bold bg-status-danger/10 px-2 py-1 rounded-full">
                    Pendiente: {formatCurrency(totalAdeudo)}
                  </p>
                )}
              </CardHeader>
              <CardContent className="p-0 sm:p-6 sm:pt-0">
                {pagosLoading ? (
                   <div className="flex items-center justify-center h-40">
                      <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
                  </div>
                ) : allPagos.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50 hover:bg-transparent">
                          <TableHead className="text-[10px] uppercase font-bold text-muted-foreground/60">Concepto</TableHead>
                          <TableHead className="text-right text-[10px] uppercase font-bold text-muted-foreground/60">Monto</TableHead>
                          <TableHead className="text-[10px] uppercase font-bold text-muted-foreground/60">Fecha</TableHead>
                          <TableHead className="text-[10px] uppercase font-bold text-muted-foreground/60">Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allPagos.slice(0, visiblePagos).map(pago => (
                          <TableRow key={pago.id} onClick={() => handlePagoClick(pago)} className="cursor-pointer border-border/50 hover:bg-accent/50 group">
                            <TableCell className="font-medium text-xs">{pago.concepto}</TableCell>
                            <TableCell className="text-right font-bold text-xs">{formatCurrency(pago.monto)}</TableCell>
                            <TableCell className="text-xs">
                                <span className={getPagoStatus(pago) === 'vencido' ? 'text-status-danger font-bold' : 'text-muted-foreground'}>
                                    {formatDate(pago.estado === 'pagado' && pago.fechaPago ? pago.fechaPago : pago.fechaLimite)}
                                </span>
                            </TableCell>
                            <TableCell><StatusBadge status={getPagoStatus(pago)} /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground/40 text-center py-8">No hay pagos registrados.</p>
                )}
              </CardContent>
              {visiblePagos < allPagos.length && (
                <CardFooter className="justify-center pt-2 border-t border-border/50">
                  <Button variant="ghost" size="sm" className="text-[10px] text-muted-foreground/60" onClick={() => setVisiblePagos(v => v + 40)}>Ver más historial</Button>
                </CardFooter>
              )}
            </Card>
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
            onDelete={handleDeletePago}
            setOpen={setPagoFormOpen}
        />
      </Dialog>
    </>
  );
}
