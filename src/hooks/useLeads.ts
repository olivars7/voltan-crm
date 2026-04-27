'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, writeBatch, getDocs, query, orderBy, deleteDoc } from 'firebase/firestore';
import type { Lead } from '@/lib/types';

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const leadsCollection = collection(db, 'leads');
    const q = query(leadsCollection, orderBy('fechaCreacion', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Lead));
      setLeads(leadsData);
      if (loading) setLoading(false);
    }, (error) => {
      console.error("Error fetching leads: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addLead = useCallback(async (lead: Omit<Lead, 'id' | 'fechaCreacion'>) => {
    const newLeadData = {
      ...lead,
      fechaCreacion: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, 'leads'), newLeadData);
    return { ...newLeadData, id: docRef.id };
  }, []);

  const updateLead = useCallback(async (updatedLead: Lead) => {
    const { id, ...leadData } = updatedLead;
    const leadDoc = doc(db, 'leads', id);
    await updateDoc(leadDoc, leadData as any);
  }, []);
  
  const deleteLead = useCallback(async (leadId: string) => {
    const leadDoc = doc(db, 'leads', leadId);
    await deleteDoc(leadDoc);
  }, []);


  const deleteAllLeads = useCallback(async () => {
      const querySnapshot = await getDocs(collection(db, 'leads'));
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
      });
      await batch.commit();
  }, []);

  return { leads, loading, addLead, updateLead, deleteLead, deleteAllLeads };
};
