'use client';

import useLocalStorage from './useLocalStorage';
import type { Cliente } from '@/lib/types';
import { mockClientes } from '@/data/mockData';
import { useCallback } from 'react';

export const useClientes = () => {
  const [clientes, setClientes] = useLocalStorage<Cliente[]>('clientes', mockClientes);

  const addCliente = useCallback(
    (cliente: Omit<Cliente, 'id' | 'fechaInicio' | 'estado'>) => {
      const newCliente: Cliente = {
        ...cliente,
        id: `cl-${Date.now()}`,
        fechaInicio: new Date().toISOString(),
        estado: 'activo',
      };
      setClientes((prev) => [...prev, newCliente]);
      return newCliente;
    },
    [setClientes]
  );

  const updateCliente = useCallback(
    (updatedCliente: Cliente) => {
      setClientes((prev) =>
        prev.map((c) => (c.id === updatedCliente.id ? updatedCliente : c))
      );
    },
    [setClientes]
  );

  const getClienteById = useCallback(
    (id: string) => {
      return clientes.find((c) => c.id === id);
    },
    [clientes]
  );

  return { clientes, addCliente, updateCliente, getClienteById };
};
