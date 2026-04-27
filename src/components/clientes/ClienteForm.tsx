'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import type { Cliente } from '@/lib/types';
import { CalendarDays, ClipboardCheck, DollarSign, User, Trash2 } from 'lucide-react';
import { useEffect } from 'react';

const formSchema = z.object({
  nombre: z.string().min(2, { message: 'El nombre es requerido.' }),
  empresa: z.string().optional(),
  email: z.string().email({ message: 'Email inválido.' }),
  telefono: z.string().min(10, { message: 'Teléfono inválido.' }),
  
  // For creation only
  montoAdelanto: z.coerce.number().min(0, "Debe ser 0 o mayor.").optional(),
  fechaAdelanto: z.string().optional(),
  montoApertura: z.coerce.number().min(0, "Debe ser 0 o mayor.").optional(),
  fechaApertura: z.string().optional(),

  // On Cliente model
  cuotaMensual: z.coerce.number().min(0, "Debe ser 0 o mayor.").optional(),
  diaDePago: z.preprocess((val) => Number(val) || undefined, z.number().int().min(1).max(28).optional()),

  proyecto: z.object({
    nombre: z.string().min(1, { message: 'El nombre del proyecto es requerido.' }),
    descripcion: z.string().optional(),
    fechaEntrega: z.string().min(1, { message: 'La fecha de entrega es requerida.' }),
    estado: z.enum(['en-progreso', 'completado', 'pausado', 'cancelado']),
    websiteUrl: z.string().optional(),
    portalUrl: z.string().optional(),
  }),
}).refine(data => !(data.montoAdelanto && data.montoAdelanto > 0) || !!data.fechaAdelanto, {
    message: "La fecha es requerida si hay un monto.",
    path: ["fechaAdelanto"],
}).refine(data => !(data.montoApertura && data.montoApertura > 0) || !!data.fechaApertura, {
    message: "La fecha es requerida si hay un monto.",
    path: ["fechaApertura"],
}).refine(data => !(data.cuotaMensual && data.cuotaMensual > 0) || !!data.diaDePago, {
    message: "El día de pago es requerido si hay una cuota.",
    path: ["diaDePago"],
});


type ClienteFormProps = {
  cliente?: Cliente;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  onDelete?: () => void;
  setOpen: (open: boolean) => void;
};

export function ClienteForm({ cliente, onSubmit, onDelete, setOpen }: ClienteFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        nombre: '',
        empresa: '',
        email: '',
        telefono: '',
        montoAdelanto: undefined,
        fechaAdelanto: '',
        montoApertura: undefined,
        fechaApertura: '',
        diaDePago: 1,
        cuotaMensual: undefined,
        proyecto: {
            nombre: '',
            descripcion: '',
            fechaEntrega: '',
            estado: 'en-progreso',
            websiteUrl: '',
            portalUrl: '',
        }
    },
  });

  useEffect(() => {
    if (cliente) {
        const defaultValues = {
            ...cliente,
            cuotaMensual: cliente.cuotaMensual || undefined,
            diaDePago: cliente.diaDePago || 1,
            montoApertura: undefined,
            montoAdelanto: undefined,
            fechaAdelanto: undefined,
            fechaApertura: undefined,
            proyecto: {
                ...cliente.proyecto,
                fechaEntrega: cliente.proyecto.fechaEntrega.split('T')[0],
                websiteUrl: cliente.proyecto.websiteUrl || '',
                portalUrl: cliente.proyecto.portalUrl || '',
            }
        };
        form.reset(defaultValues);
    } else {
        form.reset({
            nombre: '',
            empresa: '',
            email: '',
            telefono: '',
            montoAdelanto: undefined,
            fechaAdelanto: '',
            montoApertura: undefined,
            fechaApertura: '',
            diaDePago: 1,
            cuotaMensual: undefined,
            proyecto: {
                nombre: '',
                descripcion: '',
                fechaEntrega: '',
                estado: 'en-progreso',
                websiteUrl: '',
                portalUrl: '',
            }
        });
    }
  }, [cliente, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const submissionValues: any = { ...values };
    if (values.proyecto?.fechaEntrega) {
        // Ensure time is included for proper ISO conversion
        const dateValue = values.proyecto.fechaEntrega.includes('T')
            ? values.proyecto.fechaEntrega
            : `${values.proyecto.fechaEntrega}T00:00:00`;
        submissionValues.proyecto.fechaEntrega = new Date(dateValue).toISOString();
    }
    if (values.fechaAdelanto) {
        submissionValues.fechaAdelanto = `${values.fechaAdelanto}T00:00:00`;
    }
    if (values.fechaApertura) {
        submissionValues.fechaApertura = `${values.fechaApertura}T00:00:00`;
    }
    onSubmit(submissionValues);
    setOpen(false);
  };

  return (
    <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
      <DialogHeader>
        <DialogTitle>{cliente ? 'Editar Cliente' : 'Añadir Cliente'}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4 flex-grow overflow-y-auto pr-4 custom-scrollbar">
            
            <div className="p-6 rounded-lg bg-muted/50 space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2 text-foreground"><User className="h-5 w-5"/> Información de Contacto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="nombre" render={({ field }) => (<FormItem><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="empresa" render={({ field }) => (<FormItem><FormLabel>Empresa (Opcional)</FormLabel><FormControl><Input placeholder="ACME Inc." {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="john@acme.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="telefono" render={({ field }) => (<FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input placeholder="55-1234-5678" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
            </div>

            {!cliente && (
                <div className="p-6 rounded-lg bg-muted/50 space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2 text-foreground"><DollarSign className="h-5 w-5"/> Pagos Iniciales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <FormField control={form.control} name="montoApertura" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Monto de Apertura (MXN)</FormLabel>
                                <FormControl><Input type="number" step="0.01" placeholder="2500.00" {...field} value={field.value ?? ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="fechaApertura" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha Límite de Apertura</FormLabel>
                                <FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="montoAdelanto" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Monto de Adelanto (MXN)</FormLabel>
                                <FormControl><Input type="number" step="0.01" placeholder="1000.00" {...field} value={field.value ?? ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="fechaAdelanto" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha Límite de Adelanto</FormLabel>
                                <FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                </div>
            )}
            
            <div className="p-6 rounded-lg bg-muted/50 space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2 text-foreground"><CalendarDays className="h-5 w-5"/> Pagos Recurrentes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="cuotaMensual" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cuota Mensual (MXN)</FormLabel>
                            <FormControl><Input type="number" step="0.01" placeholder="5000.00" {...field} value={field.value ?? ''} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="diaDePago" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Día de Pago Mensual</FormLabel>
                            <Select onValueChange={field.onChange} value={String(field.value ?? '')}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un día" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (<SelectItem key={day} value={String(day)}>{day}</SelectItem>))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
            </div>

            <div className="p-6 rounded-lg bg-muted/50 space-y-4">
                 <h3 className="text-lg font-medium flex items-center gap-2 text-foreground"><ClipboardCheck className="h-5 w-5"/> Detalles del Proyecto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="proyecto.nombre" render={({ field }) => (<FormItem><FormLabel>Nombre del Proyecto</FormLabel><FormControl><Input placeholder="Ej. Sitio Web Corporativo" {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="proyecto.estado" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Estado del Proyecto</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value ?? 'en-progreso'}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un estado" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="en-progreso">En Progreso</SelectItem>
                                    <SelectItem value="completado">Completado</SelectItem>
                                    <SelectItem value="pausado">Pausado</SelectItem>
                                    <SelectItem value="cancelado">Cancelado</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField control={form.control} name="proyecto.fechaEntrega" render={({ field }) => (<FormItem><FormLabel>Fecha de Entrega</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="proyecto.websiteUrl" render={({ field }) => (<FormItem><FormLabel>Link a la Página</FormLabel><FormControl><Input placeholder="https://ejemplo.com" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="proyecto.portalUrl" render={({ field }) => (<FormItem><FormLabel>Link al Portal del Cliente</FormLabel><FormControl><Input placeholder="https://admin.ejemplo.com" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="proyecto.descripcion" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Descripción del Proyecto (Opcional)</FormLabel><FormControl><Textarea placeholder="Descripción breve del proyecto..." {...field} /></FormControl><FormMessage /></FormItem>)}/>
                </div>
            </div>

            <DialogFooter className="pt-4 bg-background sticky bottom-0 flex justify-between items-center">
                <div>
                    {cliente && onDelete && (
                        <Button type="button" variant="destructive" onClick={onDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar Cliente
                        </Button>
                    )}
                </div>
                <div className="flex gap-2">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancelar</Button>
                    </DialogClose>
                    <Button type="submit">Guardar Cambios</Button>
                </div>
            </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
