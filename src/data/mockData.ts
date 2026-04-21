import type { Cliente, Pago } from '@/lib/types';
import { subDays, addDays, formatISO, subMonths, addMonths } from 'date-fns';

const today = new Date();

export const mockClientes: Cliente[] = [
  {
    id: 'cl-1',
    nombre: 'Elena Campos',
    empresa: 'Soluciones Digitales Avanzadas',
    telefono: '55-1010-2020',
    email: 'elena.campos@sda.com',
    fechaInicio: formatISO(subDays(today, 150)),
    estado: 'activo',
    diaDePago: 1,
    montoRecurrente: 8000,
    proyecto: {
        nombre: 'Plataforma E-learning',
        descripcion: 'Desarrollo de una plataforma web para cursos online.',
        fechaEntrega: formatISO(addDays(today, 60)),
        estado: 'en-progreso',
    }
  },
  {
    id: 'cl-2',
    nombre: 'Marcos Herrera',
    empresa: 'VisualWorks',
    telefono: '55-3030-4040',
    email: 'marcos.herrera@visualworks.mx',
    fechaInicio: formatISO(subDays(today, 300)),
    estado: 'activo',
    proyecto: {
        nombre: 'Branding Corporativo',
        descripcion: 'Diseño de identidad de marca, logo y material de papelería.',
        fechaEntrega: formatISO(subDays(today, 90)),
        estado: 'completado',
    }
  },
  {
    id: 'cl-3',
    nombre: 'Lucía Fernández',
    empresa: 'TechInnova',
    telefono: '55-5050-6060',
    email: 'lucia.f@techinnova.io',
    fechaInicio: formatISO(subDays(today, 45)),
    estado: 'activo',
    diaDePago: 15,
    montoRecurrente: 6500,
    proyecto: {
        nombre: 'Campaña SEO y SEM',
        descripcion: 'Estrategia de posicionamiento en buscadores y publicidad pagada.',
        fechaEntrega: formatISO(addDays(today, 15)),
        estado: 'en-progreso',
    }
  },
  {
    id: 'cl-4',
    nombre: 'Ricardo Jiménez',
    empresa: 'Constructora Forte',
    telefono: '55-7070-8080',
    email: 'ricardo.j@forte.com.mx',
    fechaInicio: formatISO(subDays(today, 180)),
    estado: 'inactivo',
    proyecto: {
        nombre: 'App de Supervisión de Obra',
        descripcion: 'Aplicación móvil para seguimiento de avances en construcción.',
        fechaEntrega: formatISO(addDays(today, -60)),
        estado: 'cancelado',
    }
  },
  {
    id: 'cl-5',
    nombre: 'Verónica Morales',
    empresa: 'Salud Integral',
    telefono: '55-9090-0000',
    email: 'veronica.m@saludintegral.com',
    fechaInicio: formatISO(subDays(today, 25)),
    estado: 'activo',
    proyecto: {
        nombre: 'Sistema de Citas Médicas',
        descripcion: 'Plataforma web para que los pacientes agenden citas online.',
        fechaEntrega: formatISO(addDays(today, 90)),
        estado: 'en-progreso',
    }
  },
  {
    id: 'cl-6',
    nombre: 'David Peña',
    empresa: 'Finanzas Claras',
    telefono: '55-1212-3434',
    email: 'david.pena@finclaras.com',
    fechaInicio: formatISO(subDays(today, 400)),
    estado: 'activo',
    diaDePago: 10,
    montoRecurrente: 4000,
  },
  {
    id: 'cl-7',
    nombre: 'Gabriela Soto',
    empresa: 'Logística Express',
    telefono: '55-5656-7878',
    email: 'gabriela.s@logiexpress.net',
    fechaInicio: formatISO(subDays(today, 70)),
    estado: 'activo',
    proyecto: {
        nombre: 'Software de Rastreo de Paquetes',
        descripcion: 'Sistema en tiempo real para el seguimiento de envíos.',
        fechaEntrega: formatISO(addDays(today, 20)),
        estado: 'pausado',
    }
  },
  {
    id: 'cl-8',
    nombre: 'Fernando Torres',
    empresa: 'Restaurante El Sazón',
    telefono: '55-8989-1010',
    email: 'fernando.t@elsazon.com',
    fechaInicio: formatISO(subDays(today, 10)),
    estado: 'activo',
    proyecto: {
        nombre: 'Menú Digital con QR',
        descripcion: 'Desarrollo de una web app para mostrar el menú del restaurante.',
        fechaEntrega: formatISO(addDays(today, 5)),
        estado: 'en-progreso',
    }
  },
  {
    id: 'cl-9',
    nombre: 'Patricia Mendoza',
    empresa: 'Abogados & Asociados',
    telefono: '55-2323-4545',
    email: 'p.mendoza@abogadosyasoc.com',
    fechaInicio: formatISO(subDays(today, 250)),
    estado: 'activo',
    proyecto: {
        nombre: 'Gestor Documental',
        descripcion: 'Sistema interno para la administración de expedientes legales.',
        fechaEntrega: formatISO(subDays(today, 180)),
        estado: 'completado',
    }
  },
  {
    id: 'cl-10',
    nombre: 'Jorge Núñez',
    empresa: 'Nómada Films',
    telefono: '55-6767-8989',
    email: 'jorge.nunez@nomadafilms.com',
    fechaInicio: formatISO(subDays(today, 5)),
    estado: 'activo',
    diaDePago: 25,
    montoRecurrente: 12000,
    proyecto: {
        nombre: 'Edición de Video Corporativo',
        descripcion: 'Post-producción para video institucional de fin de año.',
        fechaEntrega: formatISO(addDays(today, 25)),
        estado: 'en-progreso',
    }
  }
];

export const mockPagos: Pago[] = [
  // Pagos para Elena Campos (cl-1)
  { id: 'pa-1', clienteId: 'cl-1', monto: 8000, fechaPago: formatISO(subMonths(today, 1)), fechaLimite: formatISO(subMonths(today, 1)), estado: 'pagado', metodo: 'transferencia', notas: 'Retainer Mensual' },
  { id: 'pa-2', clienteId: 'cl-1', monto: 10000, fechaLimite: formatISO(addDays(today, 30)), estado: 'pendiente', notas: 'Primer hito Plataforma E-learning' },

  // Pagos para Marcos Herrera (cl-2)
  { id: 'pa-3', clienteId: 'cl-2', monto: 20000, fechaPago: formatISO(subDays(today, 95)), fechaLimite: formatISO(subDays(today, 100)), estado: 'pagado', metodo: 'tarjeta', notas: 'Pago final Branding' },
  { id: 'pa-4', clienteId: 'cl-2', monto: 5000, fechaLimite: formatISO(subDays(today, 10)), estado: 'pendiente', notas: 'Ajustes de diseño (vencido)' },

  // Pagos para Lucía Fernández (cl-3)
  { id: 'pa-5', clienteId: 'cl-3', monto: 6500, fechaPago: formatISO(subDays(today, 16)), fechaLimite: formatISO(subDays(today, 17)), estado: 'pagado', metodo: 'transferencia', notas: 'Retainer Mensual' },

  // Pagos para Ricardo Jiménez (cl-4) - Inactivo
  { id: 'pa-6', clienteId: 'cl-4', monto: 15000, fechaPago: formatISO(subDays(today, 80)), fechaLimite: formatISO(subDays(today, 85)), estado: 'pagado', metodo: 'transferencia', notas: 'Anticipo App de Supervisión' },
  
  // Pagos para Verónica Morales (cl-5)
  { id: 'pa-7', clienteId: 'cl-5', monto: 25000, fechaLimite: formatISO(addDays(today, 12)), estado: 'pendiente', notas: 'Anticipo Sistema de Citas' },
  
  // Pagos para David Peña (cl-6)
  { id: 'pa-8', clienteId: 'cl-6', monto: 4000, fechaPago: formatISO(subDays(today, 21)), fechaLimite: formatISO(subDays(today, 22)), estado: 'pagado', metodo: 'transferencia', notas: 'Retainer Mensual' },
  { id: 'pa-9', clienteId: 'cl-6', monto: 4000, fechaPago: formatISO(addMonths(subDays(today, 21),-1)), fechaLimite: formatISO(addMonths(subDays(today, 22), -1)), estado: 'pagado', metodo: 'transferencia', notas: 'Retainer Mensual' },

  // Pagos para Fernando Torres (cl-8)
  { id: 'pa-10', clienteId: 'cl-8', monto: 7000, fechaLimite: formatISO(addDays(today, 4)), estado: 'pendiente', notas: 'Pago único Menú Digital' },

  // Pagos para Jorge Núñez (cl-10)
  { id: 'pa-11', clienteId: 'cl-10', monto: 12000, fechaLimite: formatISO(addDays(today, 20)), estado: 'pendiente', notas: 'Retainer y anticipo Edición Video' },
];
