'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, writeBatch, getDocs, query, limit } from 'firebase/firestore';
import type { Cliente } from '@/lib/types';
import { mockClientes } from '@/data/mockData';

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const clientesCollection = collection(db, 'clientes');
    const unsubscribe = onSnapshot(clientesCollection, (snapshot) => {
        const clientesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Cliente));
        setClientes(clientesData);
        if (loading) setLoading(false);
    }, (error) => {
      console.error("Error fetching clientes: ", error);
      setLoading(false);
    });

    // Seed data if empty
    getDocs(query(clientesCollection, limit(1))).then(snapshot => {
        if (snapshot.empty) {
            console.log("Clientes collection is empty, seeding data...");
            const batch = writeBatch(db);
            mockClientes.forEach((cliente) => {
                const {id, ...clientData} = cliente;
                const docRef = doc(collection(db, 'clientes'));
                batch.set(docRef, clientData);
            });
            batch.commit();
        }
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addCliente = useCallback(
    async (cliente: Omit<Cliente, 'id' | 'fechaInicio' | 'estado'>) => {
      const newClienteData = {
        ...cliente,
        fechaInicio: new Date().toISOString(),
        estado: 'activo' as const,
      };
      const docRef = await addDoc(collection(db, 'clientes'), newClienteData);
      return { ...newClienteData, id: docRef.id };
    },
    []
  );

  const updateCliente = useCallback(
    async (updatedCliente: Cliente) => {
      const { id, ...clienteData } = updatedCliente;
      const clienteDoc = doc(db, 'clientes', id);
      await updateDoc(clienteDoc, clienteData as any);
    },
    []
  );

  const getClienteById = useCallback(
    (id: string) => {
      return clientes.find((c) => c.id === id);
    },
    [clientes]
  );
  
  const deleteAllClientes = useCallback(async () => {
      const querySnapshot = await getDocs(collection(db, 'clientes'));
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
      });
      await batch.commit();
  }, []);

  const resetClientes = useCallback(async () => {
      await deleteAllClientes();
      const batch = writeBatch(db);
      mockClientes.forEach((cliente) => {
        const {id, ...clientData} = cliente;
        const docRef = doc(collection(db, 'clientes'));
        batch.set(docRef, clientData);
      });
      await batch.commit();
  }, [deleteAllClientes]);


  return { clientes, loading, addCliente, updateCliente, getClienteById, deleteAllClientes, resetClientes };
};
