"use client";

import useLocalStorage from './useLocalStorage';
import type { Cliente } from '@/lib/types';
import { mockClientes } from '@/data/mockData';

export const useClientes = () => {
  const [clientes, setClientes] = useLocalStorage<Cliente[]>('clientes', mockClientes);

  const addCliente = (cliente: Omit<Cliente, 'id' | 'fechaInicio' | 'estado'>) => {
    const newCliente: Cliente = {
      ...cliente,
      id: `cl-${Date.now()}`,
      fechaInicio: new Date().toISOString(),
      estado: 'activo',
    };
    setClientes((prev) => [...prev, newCliente]);
  };

  const updateCliente = (updatedCliente: Cliente) => {
    setClientes((prev) =>
      prev.map((c) => (c.id === updatedCliente.id ? updatedCliente : c))
    );
  };
  
  const getClienteById = (id: string) => {
    return clientes.find(c => c.id === id);
  }

  return { clientes, addCliente, updateCliente, getClienteById };
};
