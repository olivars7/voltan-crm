export type Cliente = {
  id: string;
  nombre: string;
  empresa: string;
  telefono: string;
  email: string;
  fechaInicio: string;
  estado: 'activo' | 'inactivo';
  diaDePago?: number;
  cuotaMensual?: number;
  proyecto: Proyecto;
};

export type ProyectoEstado = 'en-progreso' | 'completado' | 'pausado' | 'cancelado';

export type Proyecto = {
  nombre: string;
  descripcion: string;
  fechaEntrega: string;
  estado: ProyectoEstado;
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

export type LlamadaEstado = 'pronto' | 'cancelada' | 'realizada' | 'cierre-exitoso';
export type LlamadaMedio = 'llamada' | 'google-meet' | 'zoom';

export type LlamadaAgendada = {
  id: string;
  nombre: string;
  telefono: string;
  medio: LlamadaMedio;
  fecha: string; // ISO date string
  estado: LlamadaEstado;
  notas?: string;
};
