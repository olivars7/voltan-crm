'use client';

import * as React from 'react';
import { PlusCircle, Search, Loader2, Users, Phone, Presentation, Target, ArrowRight, XCircle, ArrowUp, ArrowDown, ChevronRight } from 'lucide-react';
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
              <TableHead className="text-muted-foreground/60 text-[10px] uppercase font-bold tracking-wider">Nombre</TableHead>
              <TableHead className="text-muted-foreground/60 text-[10px] uppercase font-bold tracking-wider">Contacto</TableHead>
              <TableHead className="text-muted-foreground/60 text-[10px] uppercase font-bold tracking-wider">Nicho</TableHead>
              <TableHead className="text-muted-foreground/60 text-[10px] uppercase font-bold tracking-wider">Servicios de Interés</TableHead>
              <TableHead className="text-right text-muted-foreground/60 text-[10px] uppercase font-bold tracking-wider">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((lead) => (
              <TableRow key={lead.id} onClick={() => openDetailDialog(lead)} className="cursor-pointer group border-white/5 hover:bg-white/5">
                <TableCell className="font-medium text-xs text-white">{lead.nombre}</TableCell>
                <TableCell className="text-zinc-300 text-xs">{lead.telefono}</TableCell>
                <TableCell className="text-zinc-300 text-xs">{lead.nicho}</TableCell>
                <TableCell className="text-zinc-300 text-xs">
                  {lead.servicios.map(s => serviceDisplayNames[s]).join(', ')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {lead.estado !== 'convertido' && lead.estado !== 'no-interesado' && (
                        <Button 
                            size="sm" 
                            className="bg-status-success hover:bg-status-success/90 h-7 text-[10px] px-2"
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
                            className="h-7 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white border-white/10 text-[10px] px-2"
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

  const KpiCard = ({ title, value, diff, icon: Icon, isLast = false }: { title: string, value: number, diff: number, icon: any, isLast?: boolean }) => (
    <div className="flex-1 flex items-center gap-2">
      <Card className="flex-1 border-white/10 bg-zinc-950/20 backdrop-blur-3xl shadow-xl transition-all hover:bg-white/[0.03] group relative overflow-hidden h-20">
        <div className="p-3 flex items-start gap-3 h-full">
          <div className="p-2 rounded-lg bg-white/5 shrink-0">
            <Icon className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
          </div>
          <div className="flex flex-col justify-between h-full py-0.5">
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 leading-none">{title}</p>
              <p className="text-lg font-bold text-white leading-none tracking-tight">{value}</p>
            </div>
            <div className={cn("text-[8px] font-bold flex items-center", diff >= 0 ? "text-emerald-500" : "text-rose-500")}>
              {diff >= 0 ? <ArrowUp className="h-2 w-2 mr-0.5" /> : <ArrowDown className="h-2 w-2 mr-0.5" />}
              {Math.abs(diff)} <span className="text-muted-foreground/40 font-normal ml-1">este mes</span>
            </div>
          </div>
        </div>
      </Card>
      {!isLast && (
        <ChevronRight className="h-4 w-4 text-white/10 shrink-0" />
      )}
    </div>
  );

  return (
    <div className="pb-20">
      <PageHeader
        title="Leads"
        description="Gestiona tus clientes potenciales."
      >
        <Button onClick={openNewDialog} className="bg-white/80 backdrop-blur-xl border-white/10 hover:bg-white/90 text-zinc-950">
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Lead
        </Button>
      </PageHeader>
      
      <div className="flex items-center justify-between gap-2 mb-6 w-full">
        <KpiCard title="Nuevos" value={kpiData.current.total} diff={kpiData.diff.total} icon={Users} />
        <KpiCard title="Contactos" value={kpiData.current.contactados} diff={kpiData.diff.contactados} icon={Phone} />
        <KpiCard title="Demos" value={kpiData.current.demos} diff={kpiData.diff.demos} icon={Presentation} />
        <KpiCard title="Cierres" value={kpiData.current.cierres} diff={kpiData.diff.cierres} icon={Target} isLast />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
      <Tabs defaultValue="por-contactar">
        <TabsList className="bg-zinc-950/20 border border-white/10 p-1 mb-4 h-auto backdrop-blur-3xl w-full grid grid-cols-2 sm:grid-cols-5">
            {(Object.keys(leadsByStatus) as LeadEstado[]).map(status => (
                <TabsTrigger key={status} value={status} className="px-3 py-2 text-[10px] font-bold transition-all">
                    {tabTitles[status]} ({leadsByStatus[status].length})
                </TabsTrigger>
            ))}
        </TabsList>
        {(Object.keys(leadsByStatus) as LeadEstado[]).map(status => (
            <TabsContent key={status} value={status} className="mt-0">
                <Card className="border-white/10 bg-zinc-950/20 backdrop-blur-3xl shadow-2xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                        <CardTitle className="text-lg text-white">Leads: {tabTitles[status]}</CardTitle>
                        <div className="relative w-full max-w-[280px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60 z-10" />
                            <Input
                                type="search"
                                placeholder="Buscar en esta categoría..."
                                className="w-full h-9 pl-9 bg-white/5 border-white/10 text-white text-xs backdrop-blur-xl focus:bg-white/10 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
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
