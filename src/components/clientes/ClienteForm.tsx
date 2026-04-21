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
import { CalendarDays, ClipboardCheck, DollarSign, User } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useEffect } from 'react';

const formSchema = z.object({
  nombre: z.string().min(2, { message: 'El nombre es requerido.' }),
  empresa: z.string().min(2, { message: 'La empresa es requerida.' }),
  email: z.string().email({ message: 'Email inválido.' }),
  telefono: z.string().min(10, { message: 'Teléfono inválido.' }),
  montoApertura: z.coerce.number().min(0, { message: 'El monto no puede ser negativo.' }).optional(),
  diaDePago: z.preprocess((val) => Number(val), z.number().int().min(1, {message: "El día de pago es requerido."}).max(31)),
  montoRecurrente: z.coerce.number().min(0, { message: 'El monto recurrente no puede ser negativo.' }),
  proyecto: z.object({
    nombre: z.string(),
    descripcion: z.string(),
    fechaEntrega: z.string(),
    estado: z.enum(['en-progreso', 'completado', 'pausado', 'cancelado']),
  }).partial().optional(),
}).refine(data => {
    if (data.proyecto?.nombre && (!data.proyecto.fechaEntrega || !data.proyecto.estado)) {
        return false;
    }
    return true;
}, {
    message: "Si se define un nombre de proyecto, la fecha de entrega y el estado son requeridos.",
    path: ["proyecto.nombre"],
});


type ClienteFormProps = {
  cliente?: Cliente;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  setOpen: (open: boolean) => void;
};

export function ClienteForm({ cliente, onSubmit, setOpen }: ClienteFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        nombre: '',
        empresa: '',
        email: '',
        telefono: '',
        montoApertura: 0,
        diaDePago: 1,
        montoRecurrente: 0,
        proyecto: {
            nombre: '',
            descripcion: '',
            fechaEntrega: '',
            estado: undefined,
        }
    },
  });

  useEffect(() => {
    const defaultValues = {
        nombre: cliente?.nombre || '',
        empresa: cliente?.empresa || '',
        email: cliente?.email || '',
        telefono: cliente?.telefono || '',
        montoApertura: 0, // Not edited after creation
        diaDePago: cliente?.diaDePago || 1,
        montoRecurrente: cliente?.montoRecurrente ?? 0,
        proyecto: cliente?.proyecto ? {
            ...cliente.proyecto,
            fechaEntrega: cliente.proyecto.fechaEntrega.split('T')[0]
        } : {
            nombre: '',
            descripcion: '',
            fechaEntrega: '',
            estado: undefined,
        }
    };
    form.reset(defaultValues);
  }, [cliente, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const submissionValues: any = { ...values };
    if (values.proyecto?.nombre && values.proyecto.fechaEntrega) {
        submissionValues.proyecto.fechaEntrega = new Date(values.proyecto.fechaEntrega).toISOString();
    } else if (!values.proyecto?.nombre) {
        delete submissionValues.proyecto;
    }
    onSubmit(submissionValues);
    setOpen(false);
  };

  return (
    <DialogContent className="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>{cliente ? 'Editar Cliente' : 'Añadir Cliente'}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 py-4 max-h-[80vh] overflow-y-auto pr-4 custom-scrollbar">
            
            {/* Contact Info Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2"><User className="h-5 w-5"/> Información de Contacto</h3>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="nombre" render={({ field }) => (<FormItem><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="empresa" render={({ field }) => (<FormItem><FormLabel>Empresa</FormLabel><FormControl><Input placeholder="ACME Inc." {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="john@acme.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="telefono" render={({ field }) => (<FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input placeholder="55-1234-5678" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
            </div>

            {/* Recurring Payments Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2"><CalendarDays className="h-5 w-5"/> Pagos Recurrentes</h3>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {!cliente && (
                        <FormField control={form.control} name="montoApertura" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Monto de Apertura (MXN)</FormLabel>
                                <FormControl><Input type="number" step="0.01" placeholder="2500.00" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    )}
                     <FormField control={form.control} name="diaDePago" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Día de Pago Mensual</FormLabel>
                            <Select onValueChange={field.onChange} value={String(field.value)}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un día" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (<SelectItem key={day} value={String(day)}>{day}</SelectItem>))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="montoRecurrente" render={({ field }) => (
                        <FormItem className={!cliente ? '' : 'md:col-span-2'}>
                            <FormLabel>Monto Recurrente (MXN)</FormLabel>
                            <FormControl><Input type="number" step="0.01" placeholder="5000.00" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
            </div>

            {/* Project Details Section */}
            <div className="space-y-4">
                 <h3 className="text-lg font-medium flex items-center gap-2"><ClipboardCheck className="h-5 w-5"/> Detalles del Proyecto (Opcional)</h3>
                 <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="proyecto.nombre" render={({ field }) => (<FormItem><FormLabel>Nombre del Proyecto</FormLabel><FormControl><Input placeholder="Ej. Sitio Web Corporativo" {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="proyecto.estado" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Estado del Proyecto</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value ?? ''}>
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
                    <FormField control={form.control} name="proyecto.descripcion" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Descripción del Proyecto</FormLabel><FormControl><Textarea placeholder="Descripción breve del proyecto..." {...field} /></FormControl><FormMessage /></FormItem>)}/>
                </div>
            </div>

            <DialogFooter className="pt-4">
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancelar</Button>
                </DialogClose>
                <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
