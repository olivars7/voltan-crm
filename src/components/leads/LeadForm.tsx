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
import { Trash2 } from 'lucide-react';

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
    } else {
      form.reset({
        nombre: '',
        telefono: '',
        nicho: '',
        servicios: [],
        estado: 'por-contactar',
        notas: '',
      });
    }
  }, [lead, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    setOpen(false);
  };

  return (
    <DialogContent className="sm:max-w-lg bg-zinc-950/80 backdrop-blur-3xl border-white/10 shadow-2xl rounded-3xl">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold tracking-tight">
            {lead ? 'Editar Lead' : 'Añadir Lead'}
        </DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="nombre" render={({ field }) => (
                <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl><Input placeholder="John Doe" {...field} className="bg-white/5 border-white/10" /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="telefono" render={({ field }) => (
                <FormItem>
                    <FormLabel>Número de Contacto</FormLabel>
                    <FormControl><Input placeholder="55-1234-5678" {...field} className="bg-white/5 border-white/10" /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="nicho" render={({ field }) => (
                <FormItem>
                    <FormLabel>Nicho de Mercado</FormLabel>
                    <FormControl><Input placeholder="Ej. Restaurantes, Tiendas de Ropa" {...field} className="bg-white/5 border-white/10" /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />

            <FormField
              control={form.control}
              name="servicios"
              render={({ field }) => (
                <FormItem className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Posibles Servicios a Ofrecer</FormLabel>
                  <ServiciosCheckboxes field={field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField control={form.control} name="estado" render={({ field }) => (
                <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger className="bg-white/5 border-white/10">
                                <SelectValue placeholder="Selecciona un estado" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-zinc-900 border-white/10">
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
            <FormField control={form.control} name="notas" render={({ field }) => (
                <FormItem>
                    <FormLabel>Notas (Opcional)</FormLabel>
                    <FormControl><Textarea placeholder="Detalles de la conversación, próximos pasos..." {...field} className="bg-white/5 border-white/10 min-h-[100px]" /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            
            <DialogFooter className="pt-6 flex justify-between items-center border-t border-white/5 mt-4">
                <div>
                    {lead && onDelete && (
                        <Button type="button" variant="destructive" onClick={onDelete} className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/20 h-9">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                        </Button>
                    )}
                </div>
                <div className="flex gap-2">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" className="bg-white/5 border-white/5 hover:bg-white/10 h-9">Cancelar</Button>
                    </DialogClose>
                    <Button type="submit" className="bg-primary shadow-lg shadow-primary/20 h-9">Guardar Cambios</Button>
                </div>
            </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
