'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, writeBatch, getDocs } from 'firebase/firestore';
import type { LlamadaAgendada } from '@/lib/types';

export const useAgenda = () => {
  const [llamadas, setLlamadas] = useState<LlamadaAgendada[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const agendaCollection = collection(db, 'agenda');
    const unsubscribe = onSnapshot(agendaCollection, (snapshot) => {
      const agendaData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as LlamadaAgendada));
      setLlamadas(agendaData);
      if (loading) setLoading(false);
    }, (error) => {
      console.error("Error fetching agenda: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addLlamada = useCallback(async (llamada: Omit<LlamadaAgendada, 'id'>) => {
    const docRef = await addDoc(collection(db, 'agenda'), llamada);
    return { ...llamada, id: docRef.id };
  }, []);

  const updateLlamada = useCallback(async (updatedLlamada: LlamadaAgendada) => {
    const { id, ...llamadaData } = updatedLlamada;
    const llamadaDoc = doc(db, 'agenda', id);
    await updateDoc(llamadaDoc, llamadaData as any);
  }, []);

  const getLlamadaById = useCallback(
    (id: string) => {
      return llamadas.find((l) => l.id === id);
    },
    [llamadas]
  );
  
  const deleteAllLlamadas = useCallback(async () => {
      const querySnapshot = await getDocs(collection(db, 'agenda'));
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
      });
      await batch.commit();
  }, []);

  return { llamadas, loading, addLlamada, updateLlamada, getLlamadaById, deleteAllLlamadas };
};
