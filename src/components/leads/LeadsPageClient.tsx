'use client';

import * as React from 'react';
import { PlusCircle, Search, Loader2, Users, Phone, Presentation, Target, ArrowRight, XCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadForm } from './LeadForm';
import { LeadDetail } from './LeadDetail';
import type { Lead, LeadEstado } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { serviceDisplayNames } from './ServiciosCheckboxes';
import { cn } from '@/lib/utils';
import { startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO } from 'date-fns';

export function LeadsPageClient() {
  const { leads, addLead, updateLead, deleteLead, loading } = useLeads();
  const [isFormOpen, setFormOpen] = React.useState(false);
  const [editingLead, setEditingLead] = React.useState<Lead | undefined>(undefined);
  
  const [isDetailOpen, setDetailOpen] = React.useState(false);
  const [selectedLead, setSelectedLead] = React.useState<Lead | undefined>(undefined);
  
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState('');

  const now = new Date();
  const currentMonth = { start: startOfMonth(now), end: endOfMonth(now) };
  const lastMonth = { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };

  const getKpiStats = () => {
    const calculateStats = (interval: { start: Date; end: Date }) => {
      const filteredLeads = leads.filter(l => isWithinInterval(parseISO(l.fechaCreacion), interval));
      const reachedContactado = leads.filter(l => 
        l.historial?.some(h => ['contactado', 'demo-agendada', 'convertido'].includes(h.estado) && 
        isWithinInterval(parseISO(h.fecha), interval))
      ).length;
      const reachedDemo = leads.filter(l => 
        l.historial?.some(h => ['demo-agendada', 'convertido'].includes(h.estado) && 
        isWithinInterval(parseISO(h.fecha), interval))
      ).length;
      const reachedCierre = leads.filter(l => 
        l.historial?.some(h => h.estado === 'convertido' && 
        isWithinInterval(parseISO(h.fecha), interval))
      ).length;

      return {
        total: filteredLeads.length,
        contactados: reachedContactado,
        demos: reachedDemo,
        cierres: reachedCierre
      };
    };

    const current = calculateStats(currentMonth);
    const prev = calculateStats(lastMonth);

    return {
      current,
      diff: {
        total: current.total - prev.total,
        contactados: current.contactados - prev.contactados,
        demos: current.demos - prev.demos,
        cierres: current.cierres - prev.cierres
      }
    };
  };

  const kpiData = getKpiStats();

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
        if (selectedLead?.id === updatedLead.id) {
            setSelectedLead(updatedLead);
        }
    }
  }

  const handleDeleteLead = async () => {
    if (editingLead) {
      if(window.confirm(`¿Estás seguro de que quieres eliminar a ${editingLead.nombre}? Esta acción es permanente.`)){
        await deleteLead(editingLead.id);
        toast({ title: "Lead eliminado", description: "El lead ha sido eliminado permanentemente." });
        setFormOpen(false);
        setEditingLead(undefined);
        if (selectedLead?.id === editingLead.id) {
          setSelectedLead(undefined);
          setDetailOpen(false);
        }
      }
    }
  };

  const handleStatusChange = async (lead: Lead, newStatus: LeadEstado) => {
    const updatedLead = { ...lead, estado: newStatus };
    await updateLead(updatedLead);
    toast({
        title: "Estado de Lead Actualizado",
        description: `El estado de ${lead.nombre} ha sido cambiado a "${newStatus.replace(/-/g, ' ')}".`
    });
  };

  const handleAvanzar = async (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    let nextStatus: LeadEstado = lead.estado;

    switch (lead.estado) {
        case 'por-contactar': nextStatus = 'contactado'; break;
        case 'contactado': nextStatus = 'demo-agendada'; break;
        case 'demo-agendada': nextStatus = 'convertido'; break;
        default: return; // No hay más avances
    }

    await handleStatusChange(lead, nextStatus);
  };

  const handleNoInteresado = async (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    await handleStatusChange(lead, 'no-interesado');
  };

  const openNewDialog = () => {
    setEditingLead(undefined);
    setFormOpen(true);
  }
  
  const openEditDialog = () => {
    if (selectedLead) {
        setEditingLead(selectedLead);
        setDetailOpen(false);
        setFormOpen(true);
    }
  }

  const openDetailDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setDetailOpen(true);
  }

  const searchFilter = (lead: Lead) => {
      const search = searchTerm.toLowerCase();
      return (
          lead.nombre.toLowerCase().includes(search) ||
          lead.telefono.includes(search) ||
          lead.nicho.toLowerCase().includes(search)
      );
  };
  
  const leadsByStatus: Record<LeadEstado, Lead[]> = {
    'por-contactar': leads.filter(l => l.estado === 'por-contactar').filter(searchFilter),
    'contactado': leads.filter(l => l.estado === 'contactado').filter(searchFilter),
    'demo-agendada': leads.filter(l => l.estado === 'demo-agendada').filter(searchFilter),
    'convertido': leads.filter(l => l.estado === 'convertido').filter(searchFilter),
    'no-interesado': leads.filter(l => l.estado === 'no-interesado').filter(searchFilter),
  };

  const tabTitles: Record<LeadEstado, string> = {
    'por-contactar': 'Por Contactar',
    'contactado': 'Contactado',
    'demo-agendada': 'Demo Agendada',
    'convertido': 'Convertido',
    'no-interesado': 'No Interesado',
  }

  const LeadsTable = ({ data }: { data: Lead[] }) => (
    <>
      {data.length === 0 && !loading ? (
        <p className="text-center text-muted-foreground/40 py-8">No hay leads en esta categoría.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-muted-foreground/60">Nombre</TableHead>
              <TableHead className="text-muted-foreground/60">Contacto</TableHead>
              <TableHead className="text-muted-foreground/60">Nicho</TableHead>
              <TableHead className="text-muted-foreground/60">Servicios de Interés</TableHead>
              <TableHead className="text-right text-muted-foreground/60">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((lead) => (
              <TableRow key={lead.id} onClick={() => openDetailDialog(lead)} className="cursor-pointer group border-white/5 hover:bg-white/5">
                <TableCell className="font-medium">{lead.nombre}</TableCell>
                <TableCell className="text-muted-foreground/80">{lead.telefono}</TableCell>
                <TableCell className="text-muted-foreground/80">{lead.nicho}</TableCell>
                <TableCell className="text-muted-foreground/80">
                  {lead.servicios.map(s => serviceDisplayNames[s]).join(', ')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 text-white">
                    {lead.estado !== 'convertido' && lead.estado !== 'no-interesado' && (
                        <Button 
                            size="sm" 
                            className="bg-status-success hover:bg-status-success/90 h-8"
                            onClick={(e) => handleAvanzar(e, lead)}
                        >
                            <ArrowRight className="w-3 h-3 mr-1" />
                            Avanzar
                        </Button>
                    )}
                    {lead.estado !== 'no-interesado' && (
                        <Button 
                            size="sm" 
                            variant="secondary"
                            className="h-8 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white border-white/10"
                            onClick={(e) => handleNoInteresado(e, lead)}
                        >
                            <XCircle className="w-3 h-3 mr-1" />
                            No interesado
                        </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );

  const KpiCard = ({ title, value, diff, icon: Icon }: { title: string, value: number, diff: number, icon: any }) => (
    <Card className="border-white/10 bg-zinc-950/20 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{title}</CardTitle>
        <Icon className="h-3.5 w-3.5 text-muted-foreground/40" />
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-0">
        <div className="text-xl font-bold text-white">{value}</div>
        <div className={cn("text-[9px] font-bold flex items-center mt-0.5", diff >= 0 ? "text-emerald-500" : "text-rose-500")}>
          {diff >= 0 ? <ArrowUp className="h-2 w-2 mr-0.5" /> : <ArrowDown className="h-2 w-2 mr-0.5" />}
          {Math.abs(diff)} vs mes anterior
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="pb-20">
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
        <KpiCard title="Nuevos Leads" value={kpiData.current.total} diff={kpiData.diff.total} icon={Users} />
        <KpiCard title="Contactados" value={kpiData.current.contactados} diff={kpiData.diff.contactados} icon={Phone} />
        <KpiCard title="Demos" value={kpiData.current.demos} diff={kpiData.diff.demos} icon={Presentation} />
        <KpiCard title="Cierres" value={kpiData.current.cierres} diff={kpiData.diff.cierres} icon={Target} />
      </div>


       <div className="pb-4">
        <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/60" />
            <Input
                type="search"
                placeholder="Buscar por nombre, número o nicho..."
                className="w-full pl-8 md:w-1/2 lg:w-1/3 bg-white/5 border-white/10 text-white"
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
        <TabsList className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 bg-white/5 border border-white/10 h-auto p-1">
            {(Object.keys(leadsByStatus) as LeadEstado[]).map(status => (
                <TabsTrigger key={status} value={status} className="data-[state=active]:bg-white/10 py-2">
                    {tabTitles[status]} ({leadsByStatus[status].length})
                </TabsTrigger>
            ))}
        </TabsList>
        {(Object.keys(leadsByStatus) as LeadEstado[]).map(status => (
            <TabsContent key={status} value={status}>
                <Card className="border-white/10 bg-zinc-950/20 backdrop-blur-3xl shadow-2xl">
                    <CardHeader>
                      <CardTitle className="text-white">Leads: {tabTitles[status]}</CardTitle>
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
            onDelete={editingLead ? handleDeleteLead : undefined}
            setOpen={setFormOpen}
        />
      </Dialog>

      <Dialog open={isDetailOpen} onOpenChange={(isOpen) => { if(!isOpen) { setSelectedLead(undefined) } setDetailOpen(isOpen);}}>
        {selectedLead && <LeadDetail 
            lead={selectedLead}
            onEdit={openEditDialog} 
        />}
      </Dialog>
    </div>
  );
}
