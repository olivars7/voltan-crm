'use client';

import useLocalStorage from './useLocalStorage';
import type { Pago } from '@/lib/types';
import { mockPagos } from '@/data/mockData';
import { useCallback } from 'react';

export const usePagos = () => {
  const [pagos, setPagos] = useLocalStorage<Pago[]>('pagos', mockPagos);

  const addPago = useCallback(
    (pago: Omit<Pago, 'id'>) => {
      const newPago: Pago = {
        ...pago,
        id: `pa-${Date.now()}`,
      };
      setPagos((prev) => [...prev, newPago]);
    },
    [setPagos]
  );

  const updatePago = useCallback(
    (updatedPago: Pago) => {
      const isSynthetic = updatedPago.id.startsWith('recurring-');
      if (isSynthetic) {
        // When a synthetic payment is acted upon (paid or edited),
        // we create a new "real" payment record instead of trying to update it.
        const realPago: Pago = {
          ...updatedPago,
          id: `pa-${Date.now()}`, // Assign a new, permanent ID
        };
        setPagos((prev) => [...prev, realPago]);
        return;
      }
      
      setPagos((prev) => prev.map((p) => (p.id === updatedPago.id ? updatedPago : p)));
    },
    [setPagos]
  );

  const getPagosByClienteId = useCallback(
    (clienteId: string) => {
      return pagos.filter((p) => p.clienteId === clienteId);
    },
    [pagos]
  );

  return { pagos, addPago, updatePago, getPagosByClienteId };
};
