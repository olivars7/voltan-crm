import type { Cliente, Pago } from '@/lib/types';
import { subDays, addDays, formatISO, subMonths, addMonths, subYears } from 'date-fns';

const today = new Date();

export const mockClientes: Cliente[] = [
  // 1. Active, new project, small retainer
  {
    id: 'cl-1',
    nombre: 'Ana Torres',
    empresa: 'Innovatech Solutions',
    telefono: '55-1122-3344',
    email: 'ana.torres@innovatech.com',
    fechaInicio: formatISO(subDays(today, 45)),
    estado: 'activo',
    diaDePago: 1,
    montoRecurrente: 500,
    proyecto: {
        nombre: 'Plataforma CRM',
        descripcion: 'Desarrollo de un sistema CRM a medida.',
        fechaEntrega: formatISO(addDays(today, 75)),
        estado: 'en-progreso',
    }
  },
  // 2. Active, retainer + project
  {
    id: 'cl-2',
    nombre: 'Carlos Mendoza',
    empresa: 'Quantum Dynamics',
    telefono: '55-2233-4455',
    email: 'carlos.m@quantum.com',
    fechaInicio: formatISO(subMonths(today, 8)),
    estado: 'activo',
    diaDePago: 5,
    montoRecurrente: 7500,
    proyecto: {
        nombre: 'Optimización SEO',
        descripcion: 'Campaña de 6 meses para mejorar posicionamiento.',
        fechaEntrega: formatISO(addMonths(today, 4)),
        estado: 'en-progreso',
    }
  },
  // 3. Active, completed long ago, retainer only
  {
    id: 'cl-3',
    nombre: 'Beatriz Navarro',
    empresa: 'Creaciones Visuales',
    telefono: '55-3344-5566',
    email: 'beatriz.n@visuales.mx',
    fechaInicio: formatISO(subYears(today, 2)),
    estado: 'activo',
    diaDePago: 10,
    montoRecurrente: 3000,
  },
  // 4. Inactive, cancelled project
  {
    id: 'cl-4',
    nombre: 'David Ríos',
    empresa: 'Constructora Atlas',
    telefono: '55-4455-6677',
    email: 'david.rios@atlas.com',
    fechaInicio: formatISO(subMonths(today, 10)),
    estado: 'inactivo',
    diaDePago: 1,
    montoRecurrente: 0,
    proyecto: {
        nombre: 'App de Logística',
        descripcion: 'App para gestión de inventario en obra.',
        fechaEntrega: formatISO(subMonths(today, 6)),
        estado: 'cancelado',
    }
  },
  // 5. Active, paused project
  {
    id: 'cl-5',
    nombre: 'Elena Garza',
    empresa: 'Gourmet World',
    telefono: '55-5566-7788',
    email: 'elena.g@gourmet.com',
    fechaInicio: formatISO(subMonths(today, 5)),
    estado: 'activo',
    diaDePago: 15,
    montoRecurrente: 1200,
    proyecto: {
        nombre: 'E-commerce de Vinos',
        descripcion: 'Tienda en línea con pasarela de pago.',
        fechaEntrega: formatISO(addDays(today, 40)),
        estado: 'pausado',
    }
  },
  // 6. Very new client
  {
    id: 'cl-6',
    nombre: 'Francisco León',
    empresa: 'Asesoría Legal Integral',
    telefono: '55-6677-8899',
    email: 'f.leon@legalintegral.com',
    fechaInicio: formatISO(subDays(today, 10)),
    estado: 'activo',
    diaDePago: 25,
    montoRecurrente: 0,
    proyecto: {
        nombre: 'Sitio Web Informativo',
        descripcion: 'Landing page y secciones de servicios.',
        fechaEntrega: formatISO(addDays(today, 20)),
        estado: 'en-progreso',
    }
  },
  // 7. Old client, multiple completed projects (showing last one)
  {
    id: 'cl-7',
    nombre: 'Gloria Ponce',
    empresa: 'Salud y Bienestar Corp',
    telefono: '55-7788-9900',
    email: 'gloria.p@sybcorp.com',
    fechaInicio: formatISO(subYears(today, 3)),
    estado: 'activo',
    diaDePago: 1,
    montoRecurrente: 1500,
    proyecto: {
        nombre: 'Sistema de Membresías',
        descripcion: 'Plataforma para gestionar miembros del gimnasio.',
        fechaEntrega: formatISO(subYears(today, 1)),
        estado: 'completado',
    }
  },
  // 8. Active client with overdue payment
  {
    id: 'cl-8',
    nombre: 'Hugo Valdez',
    empresa: 'Transportes Rápidos',
    telefono: '55-8899-0011',
    email: 'hugo.v@rapidos.net',
    fechaInicio: formatISO(subMonths(today, 4)),
    estado: 'activo',
    diaDePago: 20,
    montoRecurrente: 5000,
  },
  // 9. Inactive, project completed
  {
    id: 'cl-9',
    nombre: 'Irene Soto',
    empresa: 'Estudio de Arquitectura',
    telefono: '55-9900-1122',
    email: 'irene.soto@arquestudio.com',
    fechaInicio: formatISO(subMonths(today, 14)),
    estado: 'inactivo',
    diaDePago: 1,
    montoRecurrente: 0,
    proyecto: {
        nombre: 'Portafolio Digital',
        descripcion: 'Sitio web para mostrar proyectos de arquitectura.',
        fechaEntrega: formatISO(subMonths(today, 11)),
        estado: 'completado',
    }
  },
  // 10. Active, high-value project
  {
    id: 'cl-10',
    nombre: 'Javier Luna',
    empresa: 'Fintech Global',
    telefono: '55-1020-3040',
    email: 'j.luna@fintechglobal.com',
    fechaInicio: formatISO(subMonths(today, 2)),
    estado: 'activo',
    diaDePago: 1,
    montoRecurrente: 25000,
    proyecto: {
        nombre: 'Plataforma de Trading',
        descripcion: 'Desarrollo de front-end para plataforma de inversiones.',
        fechaEntrega: formatISO(addMonths(today, 3)),
        estado: 'en-progreso',
    }
  },
  // 11. New active client, retainer only
  {
    id: 'cl-11',
    nombre: 'Karla Ríos',
    empresa: 'KR Comunicaciones',
    telefono: '55-2030-4050',
    email: 'karla@krcom.com',
    fechaInicio: formatISO(subMonths(today, 1)),
    estado: 'activo',
    diaDePago: 1,
    montoRecurrente: 10000,
  },
  // 12. Client with a very short project, recently completed
  {
    id: 'cl-12',
    nombre: 'Luis Marín',
    empresa: 'El Buen Comer',
    telefono: '55-3040-5060',
    email: 'luis.marin@elbuencomer.com',
    fechaInicio: formatISO(subDays(today, 20)),
    estado: 'activo',
    diaDePago: 15,
    montoRecurrente: 0,
    proyecto: {
        nombre: 'Video Promocional',
        descripcion: 'Edición de video para redes sociales.',
        fechaEntrega: formatISO(subDays(today, 5)),
        estado: 'completado',
    }
  },
  // 13. Client with many small payments for maintenance
  {
    id: 'cl-13',
    nombre: 'Mónica Solís',
    empresa: 'EducaMás Online',
    telefono: '55-4050-6070',
    email: 'monica.solis@educamas.com',
    fechaInicio: formatISO(subMonths(today, 9)),
    estado: 'activo',
    diaDePago: 1,
    montoRecurrente: 2500,
    proyecto: {
        nombre: 'Mantenimiento Plataforma',
        descripcion: 'Soporte y actualizaciones mensuales.',
        fechaEntrega: formatISO(addMonths(today, 3)),
        estado: 'en-progreso',
    }
  },
  // 14. Inactive, business closed, no contact
  {
    id: 'cl-14',
    nombre: 'Néstor Paredes',
    empresa: 'Viajes El Mundo',
    telefono: '55-5060-7080',
    email: 'nestor.p@viajeselmundo.com',
    fechaInicio: formatISO(subYears(today, 2)),
    estado: 'inactivo',
    diaDePago: 1,
    montoRecurrente: 0,
  },
  // 15. Active, project about to be delivered
  {
    id: 'cl-15',
    nombre: 'Olivia Cárdenas',
    empresa: 'Moda Urbana',
    telefono: '55-6070-8090',
    email: 'olivia.c@modaurbana.com',
    fechaInicio: formatISO(subMonths(today, 3)),
    estado: 'activo',
    diaDePago: 10,
    montoRecurrente: 0,
    proyecto: {
        nombre: 'Campaña Fotográfica Q3',
        descripcion: 'Producción y retoque de fotos para catálogo.',
        fechaEntrega: formatISO(addDays(today, 7)),
        estado: 'en-progreso',
    }
  },
  // 16. Active, recurring only, long time client
  {
    id: 'cl-16',
    nombre: 'Pedro Galindo',
    empresa: 'Clínica Dental Sonríe',
    telefono: '55-7080-9010',
    email: 'pedro.g@sonrie.com',
    fechaInicio: formatISO(subYears(today, 4)),
    estado: 'activo',
    diaDePago: 15,
    montoRecurrente: 4500,
  },
  // 17. New, enterprise client, large project
  {
    id: 'cl-17',
    nombre: 'Quintín Rocha',
    empresa: 'Corporativo Oceánica',
    telefono: '55-8090-1020',
    email: 'q.rocha@oceanica.com',
    fechaInicio: formatISO(subDays(today, 60)),
    estado: 'activo',
    diaDePago: 30,
    montoRecurrente: 50000,
    proyecto: {
        nombre: 'Intranet Corporativa',
        descripcion: 'Rediseño y migración de la intranet.',
        fechaEntrega: formatISO(addMonths(today, 6)),
        estado: 'en-progreso',
    }
  },
  // 18. Active, but project on hold, may become inactive
  {
    id: 'cl-18',
    nombre: 'Raquel Alarcón',
    empresa: 'Eventos Mágicos',
    telefono: '55-9010-2030',
    email: 'raquel.a@eventosmagicos.com',
    fechaInicio: formatISO(subMonths(today, 7)),
    estado: 'activo',
    diaDePago: 20,
    montoRecurrente: 1000,
     proyecto: {
        nombre: 'App para Bodas',
        descripcion: 'Aplicación para organización de eventos.',
        fechaEntrega: formatISO(addMonths(today, 2)),
        estado: 'pausado',
    }
  },
  // 19. Loyal client, always on time
  {
    id: 'cl-19',
    nombre: 'Sergio Villa',
    empresa: 'SV Contadores',
    telefono: '55-1234-5678',
    email: 'sergio.v@svcontadores.com',
    fechaInicio: formatISO(subYears(today, 5)),
    estado: 'activo',
    diaDePago: 1,
    montoRecurrente: 6000,
  },
  // 20. Client with irregular project payments, project completed
  {
    id: 'cl-20',
    nombre: 'Teresa Ocampo',
    empresa: 'Inmobiliaria Tu Hogar',
    telefono: '55-2345-6789',
    email: 'teresa.o@tuhogar.com',
    fechaInicio: formatISO(subMonths(today, 10)),
    estado: 'activo',
    diaDePago: 1,
    montoRecurrente: 0,
    proyecto: {
        nombre: 'Recorridos Virtuales 360',
        descripcion: 'Creación de recorridos para 10 propiedades.',
        fechaEntrega: formatISO(subMonths(today, 7)),
        estado: 'completado',
    }
  }
];

export const mockPagos: Pago[] = [
  // Pagos Cliente 1 (Ana Torres)
  { id: 'pa-1', clienteId: 'cl-1', monto: 15000, fechaPago: formatISO(subDays(today, 40)), fechaLimite: formatISO(subDays(today, 40)), estado: 'pagado', notas: 'Anticipo CRM (50%)' },
  { id: 'pa-2', clienteId: 'cl-1', monto: 15000, fechaLimite: formatISO(addDays(today, 75)), estado: 'pendiente', notas: 'Pago final CRM' },

  // Pagos Cliente 2 (Carlos Mendoza)
  { id: 'pa-3', clienteId: 'cl-2', monto: 7500, fechaPago: formatISO(subMonths(today, 1)), fechaLimite: formatISO(subMonths(today, 1)), estado: 'pagado', notas: 'Retainer Mensual' },
  { id: 'pa-4', clienteId: 'cl-2', monto: 10000, fechaLimite: formatISO(addMonths(today, 1)), estado: 'pendiente', notas: 'Hito 1 SEO' },
  
  // Pagos Cliente 3 (Beatriz Navarro) - varios pagos de retainer
  ...Array.from({length: 3}).map((_, i) => ({ id: `pa-5-${i}`, clienteId: 'cl-3', monto: 3000, fechaPago: formatISO(subMonths(today, i + 1)), fechaLimite: formatISO(subMonths(today, i + 1)), estado: 'pagado' as const, notas: 'Mantenimiento Web' })),
  
  // Pagos Cliente 4 (David Ríos)
  { id: 'pa-6', clienteId: 'cl-4', monto: 20000, fechaPago: formatISO(subMonths(today, 9)), fechaLimite: formatISO(subMonths(today, 9)), estado: 'pagado', notas: 'Anticipo App' },
  
  // Pagos Cliente 5 (Elena Garza) - pago vencido
  { id: 'pa-7', clienteId: 'cl-5', monto: 12000, fechaPago: formatISO(subMonths(today, 5)), fechaLimite: formatISO(subMonths(today, 5)), estado: 'pagado', notas: 'Anticipo E-commerce' },
  { id: 'pa-8', clienteId: 'cl-5', monto: 8000, fechaLimite: formatISO(subDays(today, 15)), estado: 'pendiente', notas: 'Hito Diseño (Vencido)' },

  // Pagos Cliente 6 (Francisco León)
  { id: 'pa-9', clienteId: 'cl-6', monto: 4000, fechaLimite: formatISO(addDays(today, 5)), estado: 'pendiente', notas: 'Pago único Sitio Web' },

  // Pagos Cliente 7 (Gloria Ponce)
  { id: 'pa-10', clienteId: 'cl-7', monto: 25000, fechaPago: formatISO(subYears(today, 1)), fechaLimite: formatISO(subYears(today, 1)), estado: 'pagado', notas: 'Pago Final Membresías' },

  // Pagos Cliente 8 (Hugo Valdez) - pago vencido
  { id: 'pa-11', clienteId: 'cl-8', monto: 5000, fechaPago: formatISO(subMonths(today, 1)), fechaLimite: formatISO(subMonths(today, 1)), estado: 'pagado', notas: 'Retainer' },
  { id: 'pa-12', clienteId: 'cl-8', monto: 5000, fechaLimite: formatISO(subDays(today, 12)), estado: 'pendiente', notas: 'Retainer (Vencido)' },

  // Pagos Cliente 9 (Irene Soto)
  { id: 'pa-13', clienteId: 'cl-9', monto: 18000, fechaPago: formatISO(subMonths(today, 11)), fechaLimite: formatISO(subMonths(today, 11)), estado: 'pagado', notas: 'Pago Portafolio' },
  
  // Pagos Cliente 10 (Javier Luna)
  { id: 'pa-14', clienteId: 'cl-10', monto: 50000, fechaPago: formatISO(subMonths(today, 2)), fechaLimite: formatISO(subMonths(today, 2)), estado: 'pagado', notas: 'Anticipo Trading (40%)' },
  { id: 'pa-15', clienteId: 'cl-10', monto: 75000, fechaLimite: formatISO(addMonths(today, 3)), estado: 'pendiente', notas: 'Pago Final Trading (60%)' },
  
  // Pagos Cliente 12 (Luis Marín)
  { id: 'pa-16', clienteId: 'cl-12', monto: 3500, fechaPago: formatISO(subDays(today, 4)), fechaLimite: formatISO(subDays(today, 5)), estado: 'pagado', notas: 'Pago Video Promo' },

  // Pagos Cliente 13 (Mónica Solís)
  { id: 'pa-17', clienteId: 'cl-13', monto: 2500, fechaPago: formatISO(subMonths(today, 1)), fechaLimite: formatISO(subMonths(today, 1)), estado: 'pagado', notas: 'Mantenimiento' },
  { id: 'pa-18', clienteId: 'cl-13', monto: 2500, fechaLimite: formatISO(addDays(today, 28)), estado: 'pendiente', notas: 'Mantenimiento' },

  // Pagos Cliente 15 (Olivia Cárdenas)
  { id: 'pa-19', clienteId: 'cl-15', monto: 9000, fechaPago: formatISO(subMonths(today, 3)), fechaLimite: formatISO(subMonths(today, 3)), estado: 'pagado', notas: 'Anticipo Campaña' },
  { id: 'pa-20', clienteId: 'cl-15', monto: 9000, fechaLimite: formatISO(addDays(today, 7)), estado: 'pendiente', notas: 'Pago contra-entrega' },
  
  // Pagos Cliente 17 (Quintín Rocha)
  { id: 'pa-21', clienteId: 'cl-17', monto: 80000, fechaPago: formatISO(subDays(today, 55)), fechaLimite: formatISO(subDays(today, 55)), estado: 'pagado', notas: 'Fase 1 - Intranet' },
  { id: 'pa-22', clienteId: 'cl-17', monto: 80000, fechaLimite: formatISO(addMonths(today, 2)), estado: 'pendiente', notas: 'Fase 2 - Intranet' },

  // Pagos Cliente 18 (Raquel Alarcón)
  { id: 'pa-23', clienteId: 'cl-18', monto: 15000, fechaPago: formatISO(subMonths(today, 7)), fechaLimite: formatISO(subMonths(today, 7)), estado: 'pagado', notas: 'Anticipo App Bodas' },
  
  // Pagos Cliente 19 (Sergio Villa)
  ...Array.from({length: 4}).map((_, i) => ({ id: `pa-27-${i}`, clienteId: 'cl-19', monto: 6000, fechaPago: formatISO(subMonths(today, i + 1)), fechaLimite: formatISO(subMonths(today, i + 1)), estado: 'pagado' as const, notas: 'Retainer Contable' })),
  
  // Pagos Cliente 20 (Teresa Ocampo)
  { id: 'pa-24', clienteId: 'cl-20', monto: 10000, fechaPago: formatISO(subMonths(today, 10)), fechaLimite: formatISO(subMonths(today, 10)), estado: 'pagado', notas: 'Anticipo Recorridos' },
  { id: 'pa-25', clienteId: 'cl-20', monto: 10000, fechaPago: formatISO(subMonths(today, 8)), fechaLimite: formatISO(subMonths(today, 8)), estado: 'pagado', notas: 'Pago intermedio' },
  { id: 'pa-26', clienteId: 'cl-20', monto: 10000, fechaPago: formatISO(subMonths(today, 7)), fechaLimite: formatISO(subMonths(today, 7)), estado: 'pagado', notas: 'Finiquito' },
];
