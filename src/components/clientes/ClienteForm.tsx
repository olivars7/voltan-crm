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
    <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col bg-zinc-950/80 backdrop-blur-3xl border-white/10 shadow-2xl rounded-[2.5rem] overflow-hidden">
      <DialogHeader className="p-8 pb-4">
        <DialogTitle className="text-white text-2xl font-bold tracking-tight">{cliente ? 'Editar Cliente' : 'Añadir Cliente'}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex-grow overflow-y-auto custom-scrollbar px-8 pb-8 space-y-6">
            
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-5">
                <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-3 text-primary"><User className="h-4 w-4"/> Datos de Identidad</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="nombre" render={({ field }) => (<FormItem><FormLabel className="text-zinc-400 text-xs">Nombre Completo</FormLabel><FormControl><Input placeholder="Ej. Juan Pérez" {...field} className="bg-white/5 border-white/10 h-12 rounded-2xl" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="empresa" render={({ field }) => (<FormItem><FormLabel className="text-zinc-400 text-xs">Empresa (Opcional)</FormLabel><FormControl><Input placeholder="ACME Inc." {...field} className="bg-white/5 border-white/10 h-12 rounded-2xl" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel className="text-zinc-400 text-xs">Correo Electrónico</FormLabel><FormControl><Input type="email" placeholder="correo@ejemplo.com" {...field} className="bg-white/5 border-white/10 h-12 rounded-2xl" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="telefono" render={({ field }) => (<FormItem><FormLabel className="text-zinc-400 text-xs">WhatsApp / Teléfono</FormLabel><FormControl><Input placeholder="55 1234 5678" {...field} className="bg-white/5 border-white/10 h-12 rounded-2xl" /></FormControl><FormMessage /></FormItem>)} />
                </div>
            </div>

            {!cliente && (
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-5">
                    <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-3 text-status-active"><DollarSign className="h-4 w-4"/> Cobros Iniciales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                             <FormField control={form.control} name="montoApertura" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-zinc-400 text-xs">Monto de Apertura (MXN)</FormLabel>
                                    <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value ?? ''} className="bg-white/5 border-white/10 h-12 rounded-2xl" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="fechaApertura" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-zinc-400 text-xs">Fecha Límite Apertura</FormLabel>
                                    <FormControl><DateTimePicker date={field.value} setDate={field.onChange} showTime={false} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <div className="space-y-4">
                            <FormField control={form.control} name="montoAdelanto" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-zinc-400 text-xs">Monto de Adelanto (MXN)</FormLabel>
                                    <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value ?? ''} className="bg-white/5 border-white/10 h-12 rounded-2xl" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="fechaAdelanto" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-zinc-400 text-xs">Fecha Límite Adelanto</FormLabel>
                                    <FormControl><DateTimePicker date={field.value} setDate={field.onChange} showTime={false} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </div>
                </div>
            )}
            
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-5">
                <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-3 text-status-success"><CalendarDays className="h-4 w-4"/> Plan Recurrente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="cuotaMensual" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-zinc-400 text-xs">Cuota Mensual (MXN)</FormLabel>
                            <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value ?? ''} className="bg-white/5 border-white/10 h-12 rounded-2xl" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="diaDePago" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-zinc-400 text-xs">Día de Pago del Mes</FormLabel>
                            <Select onValueChange={field.onChange} value={String(field.value ?? '')}>
                                <FormControl><SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-2xl"><SelectValue placeholder="Seleccionar día" /></SelectTrigger></FormControl>
                                <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl">
                                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (<SelectItem key={day} value={String(day)}>{day}</SelectItem>))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-5">
                 <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-3 text-status-warning"><ClipboardCheck className="h-4 w-4"/> Estatus de Proyecto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="proyecto.nombre" render={({ field }) => (<FormItem><FormLabel className="text-zinc-400 text-xs">Nombre del Proyecto</FormLabel><FormControl><Input placeholder="Ej. Rediseño Web" {...field} className="bg-white/5 border-white/10 h-12 rounded-2xl" /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="proyecto.estado" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-zinc-400 text-xs">Estado Actual</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value ?? 'en-progreso'}>
                                <FormControl><SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-2xl"><SelectValue placeholder="Estado" /></SelectTrigger></FormControl>
                                <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl">
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
                        <FormLabel className="text-zinc-400 text-xs">Próxima Entrega / Deadline</FormLabel>
                        <FormControl><DateTimePicker date={field.value} setDate={field.onChange} showTime={false} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="proyecto.websiteUrl" render={({ field }) => (<FormItem><FormLabel className="text-zinc-400 text-xs">URL del Sitio</FormLabel><FormControl><Input placeholder="https://..." {...field} value={field.value ?? ''} className="bg-white/5 border-white/10 h-12 rounded-2xl" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="proyecto.descripcion" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel className="text-zinc-400 text-xs">Descripción del Proyecto</FormLabel><FormControl><Textarea placeholder="Breve resumen de objetivos..." {...field} className="bg-white/5 border-white/10 rounded-2xl min-h-[100px]" /></FormControl><FormMessage /></FormItem>)}/>
                </div>
            </div>

            <DialogFooter className="pt-8 flex justify-between items-center bg-transparent border-t border-white/5 mt-4">
                <div>
                    {cliente && onDelete && (
                        <Button type="button" variant="destructive" onClick={onDelete} className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/20 h-11 rounded-2xl px-6">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                        </Button>
                    )}
                </div>
                <div className="flex gap-4">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" className="bg-white/5 border-white/5 hover:bg-white/10 h-11 rounded-2xl px-8">Cancelar</Button>
                    </DialogClose>
                    <Button type="submit" className="bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 text-white h-11 rounded-2xl px-10 font-bold">Guardar Cambios</Button>
                </div>
            </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
