"use client";

import useLocalStorage from './useLocalStorage';
import type { Cita } from '@/lib/types';
import { mockCitas } from '@/data/mockData';

export const useCitas = () => {
  const [citas, setCitas] = useLocalStorage<Cita[]>('citas', mockCitas);

  const addCita = (cita: Omit<Cita, 'id' | 'estado'>) => {
    const newCita: Cita = {
      ...cita,
      id: `ci-${Date.now()}`,
      estado: 'pendiente',
    };
    setCitas((prev) => [...prev, newCita]);
  };

  const updateCita = (updatedCita: Cita) => {
    setCitas((prev) =>
      prev.map((c) => (c.id === updatedCita.id ? updatedCita : c))
    );
  };
  
  const getCitasByClienteId = (clienteId: string) => {
    return citas.filter(c => c.clienteId === clienteId);
  }

  return { citas, addCita, updateCita, getCitasByClienteId };
};
