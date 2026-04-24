'use client';

import useLocalStorage from './useLocalStorage';
import type { LlamadaAgendada } from '@/lib/types';
import { useCallback } from 'react';

export const useAgenda = () => {
  const [llamadas, setLlamadas] = useLocalStorage<LlamadaAgendada[]>('agenda', []);

  const addLlamada = useCallback(
    (llamada: Omit<LlamadaAgendada, 'id'>) => {
      const newLlamada: LlamadaAgendada = {
        ...llamada,
        id: `call-${Date.now()}`,
      };
      setLlamadas((prev) => [...prev, newLlamada]);
      return newLlamada;
    },
    [setLlamadas]
  );

  const updateLlamada = useCallback(
    (updatedLlamada: LlamadaAgendada) => {
      setLlamadas((prev) =>
        prev.map((l) => (l.id === updatedLlamada.id ? updatedLlamada : l))
      );
    },
    [setLlamadas]
  );

  const getLlamadaById = useCallback(
    (id: string) => {
      return llamadas.find((l) => l.id === id);
    },
    [llamadas]
  );

  return { llamadas, addLlamada, updateLlamada, getLlamadaById };
};
