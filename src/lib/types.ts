export type Cliente = {
  id: string;
  nombre: string;
  empresa: string;
  telefono: string;
  email: string;
  fechaInicio: string;
  estado: 'activo' | 'inactivo';
  diaDePago?: number | null;
  cuotaMensual?: number;
  proyecto: Proyecto;
};

export type ProyectoEstado = 'en-progreso' | 'completado' | 'pausado' | 'cancelado';

export type Proyecto = {
  nombre: string;
  descripcion: string;
  fechaEntrega: string;
  estado: ProyectoEstado;
  portalUrl?: string;
  websiteUrl?: string;
};

export type Pago = {
  id: string;
  clienteId: string;
  monto: number;
  concepto: string;
  fechaPago?: string;
  fechaLimite: string;
  estado: 'pagado' | 'pendiente';
  metodo?: 'transferencia' | 'tarjeta' | 'efectivo';
  notas?: string;
};

export type LlamadaEstado = 'pronto' | 'pendiente' | 'realizada' | 'cancelada';
export type LlamadaMedio = 'llamada' | 'google-meet' | 'zoom' | 'whatsapp' | 'instagram';

export type LlamadaAgendada = {
  id: string;
  nombre: string;
  telefono: string;
  medio: LlamadaMedio;
  fecha: string; // ISO date string
  estado: LlamadaEstado;
  notas?: string;
};

export const leadServicios = [
  'landing-page', 
  'crm', 
  'menu-digital', 
  'catalogo-digital', 
  'panel-administrativo',
  'otro'
] as const;
export type LeadServicio = typeof leadServicios[number];

export const leadEstados = [
    'por-contactar', 
    'contactado', 
    'demo-agendada', 
    'convertido',
    'no-interesado',
] as const;
export type LeadEstado = typeof leadEstados[number];

export type LeadHistoryEntry = {
  estado: LeadEstado;
  fecha: string;
};

export type Lead = {
  id: string;
  nombre: string;
  telefono: string;
  nicho: string;
  servicios: LeadServicio[];
  estado: LeadEstado;
  notas?: string;
  fechaCreacion: string;
  historial: LeadHistoryEntry[];
};
