"use client";

import useLocalStorage from './useLocalStorage';
import type { Pago } from '@/lib/types';
import { mockPagos } from '@/data/mockData';

export const usePagos = () => {
  const [pagos, setPagos] = useLocalStorage<Pago[]>('pagos', mockPagos);

  const addPago = (pago: Omit<Pago, 'id' | 'estado'>) => {
    const newPago: Pago = {
      ...pago,
      id: `pa-${Date.now()}`,
      estado: 'pendiente',
    };
    setPagos((prev) => [...prev, newPago]);
  };

  const updatePago = (updatedPago: Pago) => {
    setPagos((prev) =>
      prev.map((p) => (p.id === updatedPago.id ? updatedPago : p))
    );
  };

  const getPagosByClienteId = (clienteId: string) => {
    return pagos.filter(p => p.clienteId === clienteId);
  }

  return { pagos, addPago, updatePago, getPagosByClienteId };
};
