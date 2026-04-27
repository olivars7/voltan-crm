'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import type { LlamadaAgendada } from '@/lib/types';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';

const formSchema = z.object({
  nombre: z.string().min(2, { message: 'El nombre es requerido.' }),
  telefono: z.string().min(10, { message: 'Número de WhatsApp inválido.' }),
  medio: z.enum(['llamada', 'google-meet', 'zoom'], { required_error: 'El medio es requerido.' }),
  fecha: z.string().min(1, { message: 'La fecha es requerida.' }),
  estado: z.enum(['pronto', 'pendiente', 'realizada', 'cancelada'], { required_error: 'El estado es requerido.' }),
  notas: z.string().optional(),
});

type AgendaFormProps = {
  llamada?: LlamadaAgendada;
  isRescheduling?: boolean;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  onDelete?: () => void;
  setOpen: (open: boolean) => void;
};

export function AgendaForm({ llamada, isRescheduling = false, onSubmit, onDelete, setOpen }: AgendaFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: '',
      telefono: '',
      medio: 'llamada',
      fecha: '',
      estado: 'pronto',
      notas: '',
    },
  });

  useEffect(() => {
    if (llamada) {
      const defaultValues = {
        ...llamada,
        fecha: isRescheduling ? '' : format(new Date(llamada.fecha), "yyyy-MM-dd'T'HH:mm"),
      };
      form.reset(defaultValues);
    } else {
      form.reset({
        nombre: '',
        telefono: '',
        medio: 'llamada',
        fecha: '',
        estado: 'pronto',
        notas: '',
      });
    }
  }, [llamada, isRescheduling, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const submissionValues: any = { 
        ...values,
        fecha: new Date(values.fecha).toISOString()
    };
    onSubmit(submissionValues);
    setOpen(false);
  };

  const inheritedFieldClass = isRescheduling ? "border-primary ring-2 ring-primary/50" : "";

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{isRescheduling ? 'Reagendar Llamada' : (llamada ? 'Editar Llamada' : 'Agendar Llamada')}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="nombre" render={({ field }) => (<FormItem><FormLabel>Nombre Cliente/Interesado</FormLabel><FormControl><Input placeholder="John Doe" {...field} className={cn(inheritedFieldClass)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="telefono" render={({ field }) => (<FormItem><FormLabel>Número WhatsApp</FormLabel><FormControl><Input placeholder="55-1234-5678" {...field} className={cn(inheritedFieldClass)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="medio" render={({ field }) => (
                <FormItem>
                    <FormLabel>Medio</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} >
                        <FormControl><SelectTrigger className={cn(inheritedFieldClass)}><SelectValue placeholder="Selecciona un medio" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="llamada">Llamada</SelectItem>
                            <SelectItem value="google-meet">Google Meet</SelectItem>
                            <SelectItem value="zoom">Zoom</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="fecha" render={({ field }) => (<FormItem><FormLabel>Fecha y Hora</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="estado" render={({ field }) => (
                <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un estado" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="pronto">Pronto</SelectItem>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="realizada">Realizada</SelectItem>
                            <SelectItem value="cancelada">Cancelada</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="notas" render={({ field }) => (<FormItem><FormLabel>Notas (Opcional)</FormLabel><FormControl><Textarea placeholder="Detalles de la llamada..." {...field} className={cn(inheritedFieldClass)} /></FormControl><FormMessage /></FormItem>)}/>
            
            <DialogFooter className="pt-4 flex justify-between items-center">
                <div>
                    {llamada && onDelete && !isRescheduling && (
                        <Button type="button" variant="destructive" onClick={onDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                        </Button>
                    )}
                </div>
                <div className="flex gap-2">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancelar</Button>
                    </DialogClose>
                    <Button type="submit">Guardar</Button>
                </div>
            </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
