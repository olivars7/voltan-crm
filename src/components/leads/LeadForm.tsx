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
import { Lead, leadServicios, leadEstados } from '@/lib/types';
import { useEffect } from 'react';
import { ServiciosCheckboxes } from './ServiciosCheckboxes';
import { Trash2, User, Phone, Briefcase, Info, MessageSquare, CheckSquare } from 'lucide-react';

const formSchema = z.object({
  nombre: z.string().min(2, { message: 'El nombre es requerido.' }),
  telefono: z.string().min(10, { message: 'Número de contacto inválido.' }),
  nicho: z.string().min(2, { message: 'El nicho es requerido.' }),
  servicios: z.array(z.enum(leadServicios)).min(1, { message: 'Selecciona al menos un servicio.' }),
  estado: z.enum(leadEstados, { required_error: 'El estado es requerido.' }),
  notas: z.string().optional(),
});

type LeadFormProps = {
  lead?: Lead;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  onDelete?: () => void;
  setOpen: (open: boolean) => void;
};

export function LeadForm({ lead, onSubmit, onDelete, setOpen }: LeadFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: '',
      telefono: '',
      nicho: '',
      servicios: [],
      estado: 'por-contactar',
      notas: '',
    },
  });

  useEffect(() => {
    if (lead) {
      form.reset({
        ...lead,
        servicios: lead.servicios || [],
      });
    }
  }, [lead, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    setOpen(false);
  };

  return (
    <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col bg-zinc-950/80 backdrop-blur-3xl border-white/10 shadow-2xl rounded-[2.5rem] overflow-hidden p-0">
      <DialogHeader className="p-8 pb-4">
        <DialogTitle className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
          {lead ? 'Editar Prospecto' : 'Nuevo Lead'}
        </DialogTitle>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex-grow overflow-y-auto custom-scrollbar px-8 pb-8 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField control={form.control} name="nombre" render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2"><User className="w-3 h-3"/> Nombre Completo</FormLabel>
                    <FormControl><Input placeholder="Ej. Juan Pérez" {...field} className="bg-white/5 border-white/10 h-12 rounded-2xl focus:bg-white/10 transition-all text-white" /></FormControl>
                    <FormMessage />
                </FormItem>
                )} />
                <FormField control={form.control} name="telefono" render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2"><Phone className="w-3 h-3"/> WhatsApp / Contacto</FormLabel>
                    <FormControl><Input placeholder="55 1234 5678" {...field} className="bg-white/5 border-white/10 h-12 rounded-2xl focus:bg-white/10 transition-all text-white" /></FormControl>
                    <FormMessage />
                </FormItem>
                )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField control={form.control} name="nicho" render={({ field }) => (
                  <FormItem>
                      <FormLabel className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2"><Briefcase className="w-3 h-3"/> Nicho de Mercado</FormLabel>
                      <FormControl><Input placeholder="Ej. Restaurantes, Moda" {...field} className="bg-white/5 border-white/10 h-12 rounded-2xl focus:bg-white/10 transition-all text-white" /></FormControl>
                      <FormMessage />
                  </FormItem>
              )} />
              <FormField control={form.control} name="estado" render={({ field }) => (
                  <FormItem>
                      <FormLabel className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2"><Info className="w-3 h-3"/> Estado del Embudo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-2xl"><SelectValue placeholder="Selecciona" /></SelectTrigger></FormControl>
                          <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl shadow-2xl">
                              <SelectItem value="por-contactar">Por Contactar</SelectItem>
                              <SelectItem value="contactado">Contactado</SelectItem>
                              <SelectItem value="demo-agendada">Demo Agendada</SelectItem>
                              <SelectItem value="convertido">Convertido</SelectItem>
                              <SelectItem value="no-interesado">No Interesado</SelectItem>
                          </SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
              )} />
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                    <CheckSquare className="w-3 h-3" /> Servicios de Interés
                </h3>
                <FormField
                  control={form.control}
                  name="servicios"
                  render={({ field }) => (
                    <FormItem>
                      <ServiciosCheckboxes field={field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            <FormField control={form.control} name="notas" render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2"><MessageSquare className="w-3 h-3"/> Notas u Observaciones</FormLabel>
                    <FormControl><Textarea placeholder="Detalles de la conversación, próximos pasos..." {...field} className="bg-white/5 border-white/10 min-h-[100px] text-white rounded-2xl focus:bg-white/10 transition-all" /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            
            <DialogFooter className="pt-6 flex justify-between items-center border-t border-white/5 mt-4">
                <div>
                    {lead && onDelete && (
                        <Button type="button" variant="destructive" onClick={onDelete} className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/20 h-11 rounded-2xl px-6">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                        </Button>
                    )}
                </div>
                <div className="flex gap-3">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" className="bg-white/5 border-white/5 hover:bg-white/10 h-11 rounded-2xl px-8">Cancelar</Button>
                    </DialogClose>
                    <Button type="submit" className="bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 h-11 rounded-2xl px-10 font-bold text-white">Guardar Prospecto</Button>
                </div>
            </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
