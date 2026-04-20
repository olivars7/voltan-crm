export type Cliente = {
  id: string;
  nombre: string;
  empresa: string;
  telefono: string;
  email: string;
  fechaInicio: string;
  estado: 'activo' | 'inactivo';
};

export type Cita = {
  id: string;
  clienteId: string;
  fecha: string;
  hora: string;
  tipo: 'whatsapp' | 'meet';
  estado: 'pendiente' | 'completada';
  notas?: string;
};

export type Pago = {
  id: string;
  clienteId: string;
  monto: number;
  fechaPago?: string;
  fechaLimite: string;
  estado: 'pagado' | 'pendiente';
  metodo?: 'transferencia' | 'tarjeta' | 'efectivo';
  notas?: string;
};
