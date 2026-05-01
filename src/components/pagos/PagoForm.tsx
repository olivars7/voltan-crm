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
import { Textarea } from '@/components/ui/textarea';
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
import type { Pago, Cliente } from '@/lib/types';
import { useEffect } from 'react';
import { Trash2 } from 'lucide-react';

const formSchema = z.object({
  clienteId: z.string().min(1, { message: 'Debes seleccionar un cliente.' }),
  monto: z.coerce.number().positive({ message: 'El monto debe ser positivo.' }),
  concepto: z.string().min(1, { message: 'El concepto es requerido.' }),
  fechaLimite: z.string().min(1, { message: 'La fecha límite es requerida.' }),
  fechaPago: z.string().optional(),
  notas: z.string().optional(),
});

type PagoFormProps = {
  pago?: Pago;
  clientes: Cliente[];
  onSubmit: (values: any) => void;
  onDelete?: () => void;
  setOpen: (open: boolean) => void;
};

export function PagoForm({ pago, clientes, onSubmit, onDelete, setOpen }: PagoFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clienteId: '',
      monto: 0,
      concepto: '',
      fechaLimite: '',
      fechaPago: '',
      notas: '',
    },
  });

  useEffect(() => {
    form.reset(
      pago
        ? { 
            ...pago, 
            fechaLimite: pago.fechaLimite.split('T')[0],
            fechaPago: pago.fechaPago ? pago.fechaPago.split('T')[0] : ''
          }
        : {
            clienteId: '',
            monto: 0,
            concepto: '',
            fechaLimite: '',
            fechaPago: '',
            notas: '',
          }
    );
  }, [pago, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const { fechaPago, ...restValues } = values;
    
    const submissionValues: any = {
        ...restValues,
        fechaLimite: new Date(values.fechaLimite.includes('T') ? values.fechaLimite : `${values.fechaLimite}T00:00:00`).toISOString(),
        estado: fechaPago ? 'pagado' : 'pendiente',
    };

    if (fechaPago) {
        submissionValues.fechaPago = new Date(fechaPago.includes('T') ? fechaPago : `${fechaPago}T00:00:00`).toISOString();
    }
    
    onSubmit(submissionValues);
    setOpen(false);
  };
  
  const isSynthetic = pago?.id?.startsWith('recurring-');

  return (
    <DialogContent className="sm:max-w-[425px] bg-zinc-950/80 backdrop-blur-3xl border-white/10 shadow-2xl rounded-3xl">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold tracking-tight">{pago ? 'Editar Pago' : 'Registrar Pago'}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
          <FormField
            control={form.control}
            name="clienteId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={!!pago}>
                  <FormControl>
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="concepto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Concepto</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Mensualidad, Adelanto, etc." {...field} className="bg-white/5 border-white/10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="monto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="15000.00" {...field} className="bg-white/5 border-white/10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fechaLimite"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha Límite</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="bg-white/5 border-white/10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fechaPago"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Pago (opcional)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="bg-white/5 border-white/10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="notas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas (opcional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Detalles adicionales sobre el pago..." {...field} className="bg-white/5 border-white/10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter className="flex justify-between items-center pt-6 border-t border-white/5 mt-4">
            <div>
                {pago && onDelete && !isSynthetic && (
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
                <Button type="submit" className="bg-primary shadow-lg shadow-primary/20 h-9">Guardar</Button>
            </div>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
