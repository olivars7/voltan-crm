'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, writeBatch, getDocs, query, deleteDoc } from 'firebase/firestore';
import type { Pago } from '@/lib/types';
import { mockPagos } from '@/data/mockData';

export const usePagos = () => {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pagosCollection = collection(db, 'pagos');
    const unsubscribe = onSnapshot(pagosCollection, (snapshot) => {
        const pagosData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Pago));
        setPagos(pagosData);
        if (loading) setLoading(false);
    }, (error) => {
      console.error("Error fetching pagos: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addPago = useCallback(async (pago: Omit<Pago, 'id'>) => {
    const docRef = await addDoc(collection(db, 'pagos'), pago);
    return { ...pago, id: docRef.id };
  }, []);

  const updatePago = useCallback(async (updatedPago: Pago) => {
    const { id, ...pagoData } = updatedPago;
    
    const cleanPagoData: Partial<typeof pagoData> = { ...pagoData };

    if (!cleanPagoData.fechaPago) {
      delete cleanPagoData.fechaPago;
    }

    const isSynthetic = id.startsWith('recurring-');
    if (isSynthetic) {
      await addDoc(collection(db, 'pagos'), cleanPagoData);
      return;
    }
    const pagoDoc = doc(db, 'pagos', id);
    await updateDoc(pagoDoc, cleanPagoData as any);
  }, []);

  const deletePago = useCallback(async (pagoId: string) => {
    if (pagoId.startsWith('recurring-')) {
        console.warn("Cannot delete a synthetic recurring payment.");
        return;
    }
    const pagoDoc = doc(db, 'pagos', pagoId);
    await deleteDoc(pagoDoc);
  }, []);

  const getPagosByClienteId = useCallback(
    (clienteId: string) => {
      return pagos.filter((p) => p.clienteId === clienteId);
    },
    [pagos]
  );
  
  const deleteAllPagos = useCallback(async () => {
      const querySnapshot = await getDocs(collection(db, 'pagos'));
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
      });
      await batch.commit();
  }, []);

  const resetPagos = useCallback(async () => {
      await deleteAllPagos();
      const batch = writeBatch(db);
      mockPagos.forEach((pago) => {
        const {id, ...pagoData} = pago;
        const docRef = doc(collection(db, 'pagos'));
        batch.set(docRef, pagoData);
      });
      await batch.commit();
  }, [deleteAllPagos]);


  return { pagos, loading, addPago, updatePago, getPagosByClienteId, deleteAllPagos, resetPagos, deletePago };
};
