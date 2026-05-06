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
import { DateTimePicker } from '@/components/ui/date-time-picker';
import type { Cliente } from '@/lib/types';
import { CalendarDays, ClipboardCheck, DollarSign, User, Trash2 } from 'lucide-react';
import { useEffect } from 'react';

const formSchema = z.object({
  nombre: z.string().min(2, { message: 'El nombre es requerido.' }),
  empresa: z.string().optional(),
  email: z.string().email({ message: 'Email inválido.' }),
  telefono: z.string().min(10, { message: 'Teléfono inválido.' }),
  
  montoAdelanto: z.coerce.number().min(0, "Debe ser 0 o mayor.").optional(),
  fechaAdelanto: z.date().optional(),
  montoApertura: z.coerce.number().min(0, "Debe ser 0 o mayor.").optional(),
  fechaApertura: z.date().optional(),

  cuotaMensual: z.coerce.number().min(0, "Debe ser 0 o mayor.").optional(),
  diaDePago: z.preprocess((val) => Number(val) || undefined, z.number().int().min(1).max(28).optional()),

  proyecto: z.object({
    nombre: z.string().min(1, { message: 'El nombre del proyecto es requerido.' }),
    descripcion: z.string().optional(),
    fechaEntrega: z.date({ required_error: 'La fecha de entrega es requerida.' }),
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
  onSubmit: (values: any) => void;
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
        fechaAdelanto: undefined,
        montoApertura: undefined,
        fechaApertura: undefined,
        diaDePago: 1,
        cuotaMensual: undefined,
        proyecto: {
            nombre: '',
            descripcion: '',
            fechaEntrega: new Date(),
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
                fechaEntrega: new Date(cliente.proyecto.fechaEntrega),
                websiteUrl: cliente.proyecto.websiteUrl || '',
                portalUrl: cliente.proyecto.portalUrl || '',
            }
        };
        form.reset(defaultValues as any);
    }
  }, [cliente, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const submissionValues: any = { 
        ...values,
        proyecto: {
            ...values.proyecto,
            fechaEntrega: values.proyecto.fechaEntrega.toISOString()
        }
    };
    if (values.fechaAdelanto) submissionValues.fechaAdelanto = values.fechaAdelanto.toISOString();
    if (values.fechaApertura) submissionValues.fechaApertura = values.fechaApertura.toISOString();
    
    onSubmit(submissionValues);
    setOpen(false);
  };

  return (
    <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col bg-background/80 backdrop-blur-3xl border-border shadow-2xl rounded-3xl">
      <DialogHeader>
        <DialogTitle className="text-white text-xl font-bold">{cliente ? 'Editar Cliente' : 'Añadir Cliente'}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4 flex-grow overflow-y-auto pr-4 custom-scrollbar">
            
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2 text-foreground"><User className="h-5 w-5 text-primary"/> Información de Contacto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="nombre" render={({ field }) => (<FormItem><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="John Doe" {...field} className="bg-white/5 border-white/10" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="empresa" render={({ field }) => (<FormItem><FormLabel>Empresa (Opcional)</FormLabel><FormControl><Input placeholder="ACME Inc." {...field} className="bg-white/5 border-white/10" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="john@acme.com" {...field} className="bg-white/5 border-white/10" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="telefono" render={({ field }) => (<FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input placeholder="55-1234-5678" {...field} className="bg-white/5 border-white/10" /></FormControl><FormMessage /></FormItem>)} />
                </div>
            </div>

            {!cliente && (
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2 text-foreground"><DollarSign className="h-5 w-5 text-primary"/> Pagos Iniciales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <FormField control={form.control} name="montoApertura" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Monto de Apertura (MXN)</FormLabel>
                                <FormControl><Input type="number" step="0.01" placeholder="2500.00" {...field} value={field.value ?? ''} className="bg-white/5 border-white/10" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="fechaApertura" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha Límite de Apertura</FormLabel>
                                <FormControl><DateTimePicker date={field.value} setDate={field.onChange} showTime={false} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="montoAdelanto" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Monto de Adelanto (MXN)</FormLabel>
                                <FormControl><Input type="number" step="0.01" placeholder="1000.00" {...field} value={field.value ?? ''} className="bg-white/5 border-white/10" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="fechaAdelanto" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha Límite de Adelanto</FormLabel>
                                <FormControl><DateTimePicker date={field.value} setDate={field.onChange} showTime={false} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                </div>
            )}
            
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2 text-foreground"><CalendarDays className="h-5 w-5 text-primary"/> Pagos Recurrentes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="cuotaMensual" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cuota Mensual (MXN)</FormLabel>
                            <FormControl><Input type="number" step="0.01" placeholder="5000.00" {...field} value={field.value ?? ''} className="bg-white/5 border-white/10" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="diaDePago" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Día de Pago Mensual</FormLabel>
                            <Select onValueChange={field.onChange} value={String(field.value ?? '')}>
                                <FormControl><SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Día" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (<SelectItem key={day} value={String(day)}>{day}</SelectItem>))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                 <h3 className="text-lg font-medium flex items-center gap-2 text-foreground"><ClipboardCheck className="h-5 w-5 text-primary"/> Detalles del Proyecto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="proyecto.nombre" render={({ field }) => (<FormItem><FormLabel>Nombre del Proyecto</FormLabel><FormControl><Input placeholder="Ej. Sitio Web Corporativo" {...field} className="bg-white/5 border-white/10" /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="proyecto.estado" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Estado del Proyecto</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value ?? 'en-progreso'}>
                                <FormControl><SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Selecciona un estado" /></SelectTrigger></FormControl>
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
                    <FormField control={form.control} name="proyecto.fechaEntrega" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Entrega</FormLabel>
                        <FormControl><DateTimePicker date={field.value} setDate={field.onChange} showTime={false} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="proyecto.websiteUrl" render={({ field }) => (<FormItem><FormLabel>Link a la Página</FormLabel><FormControl><Input placeholder="https://ejemplo.com" {...field} value={field.value ?? ''} className="bg-white/5 border-white/10" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="proyecto.portalUrl" render={({ field }) => (<FormItem><FormLabel>Link al Portal</FormLabel><FormControl><Input placeholder="https://admin.ejemplo.com" {...field} value={field.value ?? ''} className="bg-white/5 border-white/10" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="proyecto.descripcion" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Descripción (Opcional)</FormLabel><FormControl><Textarea placeholder="Descripción breve..." {...field} className="bg-white/5 border-white/10" /></FormControl><FormMessage /></FormItem>)}/>
                </div>
            </div>

            <DialogFooter className="pt-4 flex justify-between items-center bg-transparent border-t border-border mt-4">
                <div>
                    {cliente && onDelete && (
                        <Button type="button" variant="destructive" onClick={onDelete} className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/20">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                        </Button>
                    )}
                </div>
                <div className="flex gap-2">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" className="bg-white/5 border-white/5 hover:bg-white/10">Cancelar</Button>
                    </DialogClose>
                    <Button type="submit" className="bg-primary shadow-lg shadow-primary/20 text-white">Guardar</Button>
                </div>
            </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
