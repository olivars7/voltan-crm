'use client';

import * as React from 'react';
import { PlusCircle, Search, Loader2 } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LeadForm } from './LeadForm';
import type { Lead } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { serviceDisplayNames } from './ServiciosCheckboxes';

export function LeadsPageClient() {
  const { leads, addLead, updateLead, loading } = useLeads();
  const [isFormOpen, setFormOpen] = React.useState(false);
  const [editingLead, setEditingLead] = React.useState<Lead | undefined>(undefined);
  
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const [visibleCount, setVisibleCount] = React.useState(40);
  
  const handleAddSubmit = async (values: any) => {
    await addLead(values);
    toast({ title: "Lead añadido", description: "El nuevo lead ha sido guardado." });
    setFormOpen(false);
  }

  const handleEditSubmit = async (values: any) => {
    if(editingLead) {
        const updatedLead = { ...editingLead, ...values };
        await updateLead(updatedLead);
        toast({ title: "Lead actualizado", description: "La información del lead ha sido actualizada." });
        setFormOpen(false);
        setEditingLead(undefined);
    }
  }

  const openNewDialog = () => {
    setEditingLead(undefined);
    setFormOpen(true);
  }
  
  const openEditDialog = (lead: Lead) => {
    setEditingLead(lead);
    setFormOpen(true);
  }

  const searchFilter = (lead: Lead) => {
      if (lead.estado === 'no-interesado') return false;
      const search = searchTerm.toLowerCase();
      return (
          lead.nombre.toLowerCase().includes(search) ||
          lead.telefono.includes(search) ||
          lead.nicho.toLowerCase().includes(search)
      );
  };
  
  const leadsPorContactar = leads.filter(l => l.estado === 'por-contactar').filter(searchFilter);
  const leadsSeguimiento = leads.filter(l => ['contactar-despues', 'contactado', 'cliente-potencial'].includes(l.estado)).filter(searchFilter);

  const LeadsTable = ({ data }: { data: Lead[] }) => (
    <>
      {data.length === 0 && !loading ? (
        <p className="text-center text-muted-foreground py-8">No hay leads en esta categoría.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Nicho</TableHead>
              <TableHead>Servicios de Interés</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(0, visibleCount).map((lead) => (
              <TableRow key={lead.id} onClick={() => openEditDialog(lead)} className="cursor-pointer">
                <TableCell className="font-medium">{lead.nombre}</TableCell>
                <TableCell>{lead.telefono}</TableCell>
                <TableCell>{lead.nicho}</TableCell>
                <TableCell>
                  {lead.servicios.map(s => serviceDisplayNames[s]).join(', ')}
                </TableCell>
                <TableCell><StatusBadge status={lead.estado} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );

  return (
    <>
      <PageHeader
        title="Leads"
        description="Gestiona tus clientes potenciales."
      >
        <Button onClick={openNewDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Lead
        </Button>
      </PageHeader>
      
       <div className="pb-4">
        <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Buscar por nombre, número o nicho..."
                className="w-full pl-8 md:w-1/2 lg:w-1/3"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
      <Tabs defaultValue="por-contactar">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="por-contactar">Por Contactar</TabsTrigger>
            <TabsTrigger value="seguimiento">Seguimiento</TabsTrigger>
        </TabsList>
        <TabsContent value="por-contactar">
            <Card>
                <CardHeader>
                  <CardTitle>Leads por Contactar</CardTitle>
                </CardHeader>
                <CardContent>
                    <LeadsTable data={leadsPorContactar} />
                </CardContent>
                {visibleCount < leadsPorContactar.length && (
                    <CardFooter className="justify-center">
                        <Button onClick={() => setVisibleCount(v => v + 40)}>Cargar más</Button>
                    </CardFooter>
                )}
            </Card>
        </TabsContent>
        <TabsContent value="seguimiento">
            <Card>
                <CardHeader>
                  <CardTitle>Leads en Seguimiento</CardTitle>
                </CardHeader>
                <CardContent>
                    <LeadsTable data={leadsSeguimiento} />
                </CardContent>
                 {visibleCount < leadsSeguimiento.length && (
                    <CardFooter className="justify-center">
                        <Button onClick={() => setVisibleCount(v => v + 40)}>Cargar más</Button>
                    </CardFooter>
                )}
            </Card>
        </TabsContent>
      </Tabs>
      )}
      
      <Dialog open={isFormOpen} onOpenChange={(isOpen) => { if(!isOpen) { setEditingLead(undefined) } setFormOpen(isOpen);}}>
        <LeadForm 
            lead={editingLead} 
            onSubmit={editingLead ? handleEditSubmit : handleAddSubmit} 
            setOpen={setFormOpen}
        />
      </Dialog>
    </>
  );
}
