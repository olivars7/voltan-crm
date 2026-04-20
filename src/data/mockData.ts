import type { Cliente, Cita, Pago } from '@/lib/types';
import { subDays, addDays, formatISO } from 'date-fns';

const today = new Date();

export const mockClientes: Cliente[] = [
  {
    id: 'cl-1',
    nombre: 'Ana García',
    empresa: 'Innovatech Solutions',
    telefono: '55-1234-5678',
    email: 'ana.garcia@innovatech.com',
    fechaInicio: formatISO(subDays(today, 90)),
    estado: 'activo',
    diaDePago: 15,
    proyecto: {
        nombre: 'Desarrollo de App Móvil',
        descripcion: 'App para iOS y Android para gestión de inventario.',
        fechaEntrega: formatISO(addDays(today, 45)),
        estado: 'en-progreso',
    }
  },
  {
    id: 'cl-2',
    nombre: 'Carlos Martínez',
    empresa: 'Quantum Dynamics',
    telefono: '55-8765-4321',
    email: 'carlos.martinez@quantum.com',
    fechaInicio: formatISO(subDays(today, 120)),
    estado: 'activo',
    diaDePago: 1,
    proyecto: {
        nombre: 'Migración a la Nube',
        descripcion: 'Mover infraestructura de servidores on-premise a AWS.',
        fechaEntrega: formatISO(addDays(today, 80)),
        estado: 'en-progreso',
    }
  },
  {
    id: 'cl-3',
    nombre: 'Sofía Rodríguez',
    empresa: 'Pixel Perfect',
    telefono: '55-5555-5555',
    email: 'sofia.r@pixelperfect.dev',
    fechaInicio: formatISO(subDays(today, 60)),
    estado: 'activo',
    proyecto: {
        nombre: 'Rediseño de Sitio Web',
        descripcion: 'Modernizar el look and feel del e-commerce.',
        fechaEntrega: formatISO(subDays(today, 10)),
        estado: 'completado',
    }
  },
  {
    id: 'cl-4',
    nombre: 'Javier Hernández',
    empresa: 'Data Systems',
    telefono: '55-1122-3344',
    email: 'javier.h@datasystems.com.mx',
    fechaInicio: formatISO(subDays(today, 200)),
    estado: 'activo',
  },
  {
    id: 'cl-5',
    nombre: 'Laura Gómez',
    empresa: 'Creative Minds',
    telefono: '55-9988-7766',
    email: 'laura.gomez@creativeminds.io',
    fechaInicio: formatISO(subDays(today, 30)),
    estado: 'activo',
    proyecto: {
        nombre: 'Campaña de Marketing Digital',
        descripcion: 'Estrategia para redes sociales y SEM.',
        fechaEntrega: formatISO(addDays(today, 25)),
        estado: 'pausado',
    }
  },
];

export const mockCitas: Cita[] = [
  { id: 'ci-1', clienteId: 'cl-1', fecha: formatISO(addDays(today, 2)), hora: '10:00', tipo: 'meet', estado: 'pendiente', notas: 'Revisión de avances del proyecto.' },
  { id: 'ci-2', clienteId: 'cl-2', fecha: formatISO(addDays(today, 3)), hora: '14:30', tipo: 'whatsapp', estado: 'pendiente', notas: 'Llamada rápida para feedback.' },
  { id: 'ci-3', clienteId: 'cl-3', fecha: formatISO(subDays(today, 5)), hora: '11:00', tipo: 'meet', estado: 'completada' },
  { id: 'ci-4', clienteId: 'cl-1', fecha: formatISO(subDays(today, 15)), hora: '09:00', tipo: 'meet', estado: 'completada', notas: 'Kick-off del proyecto.' },
  { id: 'ci-5', clienteId: 'cl-4', fecha: formatISO(addDays(today, 7)), hora: '16:00', tipo: 'meet', estado: 'pendiente', notas: 'Presentación de propuesta.' },
  { id: 'ci-6', clienteId: 'cl-5', fecha: formatISO(subDays(today, 2)), hora: '12:00', tipo: 'whatsapp', estado: 'completada' },
];

export const mockPagos: Pago[] = [
  { id: 'pa-1', clienteId: 'cl-1', monto: 15000, fechaLimite: formatISO(addDays(today, 10)), estado: 'pendiente' },
  { id: 'pa-2', clienteId: 'cl-1', monto: 15000, fechaPago: formatISO(subDays(today, 20)), fechaLimite: formatISO(subDays(today, 25)), estado: 'pagado', metodo: 'transferencia' },
  { id: 'pa-3', clienteId: 'cl-2', monto: 25000, fechaLimite: formatISO(subDays(today, 5)), estado: 'pendiente', notas: 'Pago atrasado.' },
  { id: 'pa-4', clienteId: 'cl-2', monto: 25000, fechaPago: formatISO(subDays(today, 35)), fechaLimite: formatISO(subDays(today, 40)), estado: 'pagado', metodo: 'transferencia' },
  { id: 'pa-5', clienteId: 'cl-3', monto: 18000, fechaPago: formatISO(subDays(today, 10)), fechaLimite: formatISO(subDays(today, 12)), estado: 'pagado', metodo: 'tarjeta' },
  { id: 'pa-6', clienteId: 'cl-4', monto: 30000, fechaLimite: formatISO(addDays(today, 15)), estado: 'pendiente' },
  { id: 'pa-7', clienteId: 'cl-5', monto: 12000, fechaLimite: formatISO(addDays(today, 5)), estado: 'pendiente' },
  { id: 'pa-8', clienteId: 'cl-2', monto: 25000, fechaPago: formatISO(subDays(today, 65)), fechaLimite: formatISO(subDays(today, 70)), estado: 'pagado', metodo: 'transferencia' },
  { id: 'pa-9', clienteId: 'cl-3', monto: 18000, fechaPago: formatISO(subDays(today, 40)), fechaLimite: formatISO(subDays(today, 42)), estado: 'pagado', metodo: 'tarjeta' },
  { id: 'pa-10', clienteId: 'cl-1', monto: 15000, fechaPago: formatISO(subDays(today, 50)), fechaLimite: formatISO(subDays(today, 55)), estado: 'pagado', metodo: 'transferencia' },
];
