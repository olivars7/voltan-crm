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
import { DateTimePicker } from '@/components/ui/date-time-picker';
import type { LlamadaAgendada } from '@/lib/types';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Trash2, User, Phone, Globe, Info, MessageSquare } from 'lucide-react';

const formSchema = z.object({
  nombre: z.string().min(2, { message: 'El nombre es requerido.' }),
  telefono: z.string().min(1, { message: 'El contacto es requerido.' }),
  medio: z.enum(['llamada', 'google-meet', 'zoom', 'whatsapp', 'instagram'], { required_error: 'El medio es requerido.' }),
  fecha: z.date({ required_error: 'La fecha es requerida.' }),
  estado: z.enum(['pronto', 'pendiente', 'realizada', 'cancelada'], { required_error: 'El estado es requerido.' }),
  notas: z.string().optional(),
});

type AgendaFormProps = {
  llamada?: LlamadaAgendada;
  isRescheduling?: boolean;
  onSubmit: (values: any) => void;
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
      fecha: new Date(),
      estado: 'pronto',
      notas: '',
    },
  });

  useEffect(() => {
    if (llamada) {
      const defaultValues = {
        ...llamada,
        fecha: isRescheduling ? new Date() : new Date(llamada.fecha),
        estado: isRescheduling ? ('pronto' as const) : llamada.estado,
      };
      form.reset(defaultValues);
    }
  }, [llamada, isRescheduling, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const submissionValues: any = { 
        ...values,
        fecha: values.fecha.toISOString()
    };
    onSubmit(submissionValues);
    setOpen(false);
  };

  return (
    <DialogContent className="sm:max-w-xl bg-zinc-950/80 backdrop-blur-3xl border-white/10 shadow-2xl rounded-[2rem] overflow-hidden">
      <DialogHeader className="p-6 pb-0">
        <DialogTitle className="text-2xl font-bold tracking-tight text-white">
          {llamada ? 'Editar Entrada' : 'Agendar'}
        </DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField control={form.control} name="nombre" render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2"><User className="w-3 h-3"/> Nombre</FormLabel>
                    <FormControl><Input placeholder="Nombre del contacto..." {...field} className="bg-white/5 border-white/10 text-white h-12 rounded-2xl focus:bg-white/10 transition-all" /></FormControl>
                    <FormMessage />
                </FormItem>
                )} />
                <FormField control={form.control} name="telefono" render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2"><Phone className="w-3 h-3"/> Contacto</FormLabel>
                    <FormControl><Input placeholder="Teléfono o usuario..." {...field} className="bg-white/5 border-white/10 text-white h-12 rounded-2xl focus:bg-white/10 transition-all" /></FormControl>
                    <FormMessage />
                </FormItem>
                )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField control={form.control} name="medio" render={({ field }) => (
                  <FormItem>
                      <FormLabel className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2"><Globe className="w-3 h-3"/> Medio</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} >
                          <FormControl><SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-2xl"><SelectValue placeholder="Selecciona" /></SelectTrigger></FormControl>
                          <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl shadow-2xl">
                              <SelectItem value="llamada">Llamada</SelectItem>
                              <SelectItem value="whatsapp">WhatsApp</SelectItem>
                              <SelectItem value="instagram">Instagram</SelectItem>
                              <SelectItem value="google-meet">Google Meet</SelectItem>
                              <SelectItem value="zoom">Zoom</SelectItem>
                          </SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
              )} />
              <FormField control={form.control} name="estado" render={({ field }) => (
                  <FormItem>
                      <FormLabel className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2"><Info className="w-3 h-3"/> Estado</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isRescheduling}>
                          <FormControl><SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-2xl"><SelectValue placeholder="Selecciona" /></SelectTrigger></FormControl>
                          <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl shadow-2xl">
                              <SelectItem value="pronto">Pronto</SelectItem>
                              <SelectItem value="pendiente">Pendiente</SelectItem>
                              <SelectItem value="realizada">Realizada</SelectItem>
                              <SelectItem value="cancelada">Cancelada</SelectItem>
                          </SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="fecha" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Fecha y Hora Programada</FormLabel>
                <FormControl>
                  <DateTimePicker date={field.value} setDate={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="notas" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2"><MessageSquare className="w-3 h-3"/> Notas adicionales</FormLabel>
                <FormControl><Textarea placeholder="Escribe detalles importantes aquí..." {...field} className="bg-white/5 border-white/10 min-h-[100px] text-white rounded-2xl focus:bg-white/10 transition-all" /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
            
            <DialogFooter className="pt-6 flex justify-between items-center border-t border-white/5 mt-4">
                <div>
                    {llamada && onDelete && !isRescheduling && (
                        <Button type="button" variant="destructive" onClick={onDelete} className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/20 h-10 rounded-xl">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                        </Button>
                    )}
                </div>
                <div className="flex gap-3">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" className="bg-white/5 border-white/5 hover:bg-white/10 h-10 rounded-xl px-6">Cancelar</Button>
                    </DialogClose>
                    <Button type="submit" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-10 rounded-xl px-8 font-bold text-white">Guardar</Button>
                </div>
            </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
