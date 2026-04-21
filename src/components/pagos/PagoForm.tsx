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

const formSchema = z.object({
  clienteId: z.string().min(1, { message: 'Debes seleccionar un cliente.' }),
  monto: z.coerce.number().positive({ message: 'El monto debe ser positivo.' }),
  concepto: z.string().min(1, { message: 'El concepto es requerido.' }),
  fechaLimite: z.string().min(1, { message: 'La fecha límite es requerida.' }),
  notas: z.string().optional(),
});

type PagoFormProps = {
  pago?: Pago;
  clientes: Cliente[];
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  setOpen: (open: boolean) => void;
};

export function PagoForm({ pago, clientes, onSubmit, setOpen }: PagoFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: pago ? { ...pago, fechaLimite: pago.fechaLimite.split('T')[0] } : {
      clienteId: '',
      monto: 0,
      concepto: '',
      fechaLimite: '',
      notas: '',
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({ ...values, fechaLimite: new Date(values.fechaLimite).toISOString() });
    setOpen(false);
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{pago ? 'Editar Pago' : 'Registrar Pago'}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
          <FormField
            control={form.control}
            name="clienteId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!pago}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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
                  <Input placeholder="Ej. Mensualidad, Adelanto, etc." {...field} />
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
                  <Input type="number" step="0.01" placeholder="15000.00" {...field} />
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
                  <Input type="date" {...field} />
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
                  <Textarea placeholder="Detalles adicionales sobre el pago..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Cancelar</Button>
            </DialogClose>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
