'use client';

import * as React from 'react';
import { PlusCircle, Search, Loader2, Users, Phone, Presentation, Target, Pencil } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeadForm } from './LeadForm';
import type { Lead, LeadEstado } from '@/lib/types';
import { leadEstados } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { serviceDisplayNames } from './ServiciosCheckboxes';
import { cn } from '@/lib/utils';

export function LeadsPageClient() {
  const { leads, addLead, updateLead, loading } = useLeads();
  const [isFormOpen, setFormOpen] = React.useState(false);
  const [editingLead, setEditingLead] = React.useState<Lead | undefined>(undefined);
  
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = React.useState('');
  
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

  const handleStatusChange = async (lead: Lead, newStatus: LeadEstado) => {
    const updatedLead = { ...lead, estado: newStatus };
    await updateLead(updatedLead);
    toast({
        title: "Estado de Lead Actualizado",
        description: `El estado de ${lead.nombre} ha sido cambiado a "${newStatus.replace(/-/g, ' ')}".`
    });
  };

  const openNewDialog = () => {
    setEditingLead(undefined);
    setFormOpen(true);
  }
  
  const openEditDialog = (lead: Lead) => {
    setEditingLead(lead);
    setFormOpen(true);
  }

  const searchFilter = (lead: Lead) => {
      const search = searchTerm.toLowerCase();
      return (
          lead.nombre.toLowerCase().includes(search) ||
          lead.telefono.includes(search) ||
          lead.nicho.toLowerCase().includes(search)
      );
  };

  const statusSelectStyles: Record<LeadEstado, string> = {
    'por-contactar': 'text-status-active border-status-active/50 bg-status-active/10 hover:bg-status-active/20',
    'contactado': 'text-blue-600 border-blue-600/50 bg-blue-600/10 hover:bg-blue-600/20',
    'demo-agendada': 'text-status-warning border-status-warning/50 bg-status-warning/10 hover:bg-status-warning/20',
    'convertido': 'text-status-success border-status-success/50 bg-status-success/10 hover:bg-status-success/20',
    'no-interesado': 'text-status-danger border-status-danger/50 bg-status-danger/10 hover:bg-status-danger/20',
  };
  
  const leadsPorContactar = leads.filter(l => l.estado === 'por-contactar').filter(searchFilter);
  const leadsContactado = leads.filter(l => l.estado === 'contactado').filter(searchFilter);
  const leadsDemoAgendada = leads.filter(l => l.estado === 'demo-agendada').filter(searchFilter);
  const leadsConvertido = leads.filter(l => l.estado === 'convertido').filter(searchFilter);
  const leadsNoInteresado = leads.filter(l => l.estado === 'no-interesado').filter(searchFilter);

  const leadsByStatus: Record<LeadEstado, Lead[]> = {
    'por-contactar': leadsPorContactar,
    'contactado': leadsContactado,
    'demo-agendada': leadsDemoAgendada,
    'convertido': leadsConvertido,
    'no-interesado': leadsNoInteresado,
  };

  const tabTitles: Record<LeadEstado, string> = {
    'por-contactar': 'Por Contactar',
    'contactado': 'Contactado',
    'demo-agendada': 'Demo Agendada',
    'convertido': 'Convertido',
    'no-interesado': 'No Interesado',
  }

  const kpi = {
    total: leads.filter(l => l.estado !== 'no-interesado').length,
    contactados: leads.filter(l => l.estado === 'contactado' || l.estado === 'demo-agendada' || l.estado === 'convertido').length,
    demos: leads.filter(l => l.estado === 'demo-agendada' || l.estado === 'convertido').length,
    cierres: leads.filter(l => l.estado === 'convertido').length,
  }

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
              <TableHead><span className="sr-only">Acciones</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.nombre}</TableCell>
                <TableCell>{lead.telefono}</TableCell>
                <TableCell>{lead.nicho}</TableCell>
                <TableCell>
                  {lead.servicios.map(s => serviceDisplayNames[s]).join(', ')}
                </TableCell>
                <TableCell>
                  <Select
                    value={lead.estado}
                    onValueChange={(newStatus: LeadEstado) => handleStatusChange(lead, newStatus)}
                  >
                    <SelectTrigger className={cn("w-[180px]", statusSelectStyles[lead.estado])}>
                      <SelectValue placeholder="Seleccionar estado..." />
                    </SelectTrigger>
                    <SelectContent>
                      {leadEstados
                        .map(estado => (
                          <SelectItem key={estado} value={estado}>
                            <span className="capitalize">{estado.replace(/-/g, ' ')}</span>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                    <Button variant="outline" size="icon" onClick={() => openEditDialog(lead)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar Lead</span>
                    </Button>
                </TableCell>
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
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contactados</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.contactados}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demos</CardTitle>
            <Presentation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.demos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cierres</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.cierres}</div>
          </CardContent>
        </Card>
      </div>


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
        <TabsList className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {(Object.keys(leadsByStatus) as LeadEstado[]).map(status => (
                <TabsTrigger key={status} value={status}>
                    {tabTitles[status]} ({leadsByStatus[status].length})
                </TabsTrigger>
            ))}
        </TabsList>
        {(Object.keys(leadsByStatus) as LeadEstado[]).map(status => (
            <TabsContent key={status} value={status}>
                <Card>
                    <CardHeader>
                      <CardTitle>Leads: {tabTitles[status]}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <LeadsTable data={leadsByStatus[status]} />
                    </CardContent>
                </Card>
            </TabsContent>
        ))}
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
