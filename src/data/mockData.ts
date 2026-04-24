import type { Cliente, Pago, ProyectoEstado } from '@/lib/types';
import { formatISO } from 'date-fns';

// --- Enero 2026 a Junio 2026 ---
// The application logic assumes the current date is around April 15, 2026 for calculating "overdue" status.

export const mockClientes: Cliente[] = [
    // 1. Solo mensualidades
    {
        id: 'cl-1',
        nombre: 'Sofia Ramirez',
        empresa: 'Constructora Roble',
        telefono: '55-1122-3344',
        email: 'sofia.r@constructoraroble.com',
        fechaInicio: formatISO(new Date('2026-01-05T12:00:00Z')),
        estado: 'activo',
        diaDePago: 5,
        cuotaMensual: 7500,
        proyecto: {
            nombre: 'Mantenimiento Web Mensual',
            descripcion: 'Soporte y actualizaciones para el sitio web corporativo.',
            fechaEntrega: formatISO(new Date('2026-12-31T12:00:00Z')),
            estado: 'en-progreso',
        }
    },
    // 2. Apertura y cuotas
    {
        id: 'cl-2',
        nombre: 'Carlos Herrera',
        empresa: 'Gimnasio Fuerte',
        telefono: '55-2233-4455',
        email: 'carlos.h@gimnasiofuerte.com',
        fechaInicio: formatISO(new Date('2026-02-01T12:00:00Z')),
        estado: 'activo',
        diaDePago: 10,
        cuotaMensual: 4000,
        proyecto: {
            nombre: 'App de Miembros',
            descripcion: 'Desarrollo de app para registro y seguimiento de miembros.',
            fechaEntrega: formatISO(new Date('2026-08-30T12:00:00Z')),
            estado: 'en-progreso',
        }
    },
    // 3. Adelanto, apertura y cuotas
    {
        id: 'cl-3',
        nombre: 'Ana Paredes',
        empresa: 'Digitalia Marketing',
        telefono: '55-3344-5566',
        email: 'ana.p@digitaliamarketing.com',
        fechaInicio: formatISO(new Date('2026-01-15T12:00:00Z')),
        estado: 'activo',
        diaDePago: 15,
        cuotaMensual: 12000,
        proyecto: {
            nombre: 'Campaña Redes Sociales Q2',
            descripcion: 'Gestión de campaña de marketing para el segundo trimestre.',
            fechaEntrega: formatISO(new Date('2026-06-30T12:00:00Z')),
            estado: 'en-progreso',
        }
    },
    // 4. Solo mensualidades, con pago vencido
    {
        id: 'cl-4',
        nombre: 'Jorge Nuñez',
        empresa: 'Café Aromas',
        telefono: '55-4455-6677',
        email: 'jorge.n@cafearomas.com',
        fechaInicio: formatISO(new Date('2026-01-20T12:00:00Z')),
        estado: 'activo',
        diaDePago: 1,
        cuotaMensual: 3500,
        proyecto: {
            nombre: 'E-commerce de Café',
            descripcion: 'Tienda en línea para venta de café de especialidad.',
            fechaEntrega: formatISO(new Date('2026-05-31T12:00:00Z')),
            estado: 'en-progreso',
        }
    },
    // 5. Proyecto único, sin cuota mensual
    {
        id: 'cl-5',
        nombre: 'Lucia Campos',
        empresa: 'Legallex Abogados',
        telefono: '55-5566-7788',
        email: 'lucia.c@legallex.com',
        fechaInicio: formatISO(new Date('2026-03-10T12:00:00Z')),
        estado: 'activo',
        cuotaMensual: 0,
        proyecto: {
            nombre: 'Sistema de Gestión de Casos',
            descripcion: 'Software a medida para la administración de expedientes legales.',
            fechaEntrega: formatISO(new Date('2026-09-15T12:00:00Z')),
            estado: 'en-progreso',
        }
    },
    // 6. Cliente inactivo
    {
        id: 'cl-6',
        nombre: 'Mario Benitez',
        empresa: 'Viajes por el Mundo',
        telefono: '55-6677-8899',
        email: 'mario.b@viajesmundo.com',
        fechaInicio: formatISO(new Date('2025-11-01T12:00:00Z')),
        estado: 'inactivo',
        diaDePago: 20,
        cuotaMensual: 5000,
        proyecto: {
            nombre: 'Plataforma de Reservas',
            descripcion: 'Mantenimiento de plataforma de reservas online.',
            fechaEntrega: formatISO(new Date('2026-12-31T12:00:00Z')),
            estado: 'pausado',
        }
    },
    // 7. Cuota alta, pagador puntual
    {
        id: 'cl-7',
        nombre: 'Elena Morales',
        empresa: 'Fintech Soluciones',
        telefono: '55-7788-9900',
        email: 'elena.m@fintechsoluciones.com',
        fechaInicio: formatISO(new Date('2025-12-01T12:00:00Z')),
        estado: 'activo',
        diaDePago: 25,
        cuotaMensual: 25000,
        proyecto: {
            nombre: 'Consultoría Financiera',
            descripcion: 'Servicios de consultoría y análisis de datos financieros.',
            fechaEntrega: formatISO(new Date('2026-12-31T12:00:00Z')),
            estado: 'en-progreso',
        }
    },
    // 8. Proyecto con múltiples adelantos
    {
        id: 'cl-8',
        nombre: 'Ricardo Islas',
        empresa: 'ArquiDiseño',
        telefono: '55-8899-0011',
        email: 'ricardo.i@arquidiseno.com',
        fechaInicio: formatISO(new Date('2026-02-18T12:00:00Z')),
        estado: 'activo',
        cuotaMensual: 0,
        proyecto: {
            nombre: 'Diseño Residencia Lomas',
            descripcion: 'Diseño arquitectónico y planos para residencia.',
            fechaEntrega: formatISO(new Date('2026-07-31T12:00:00Z')),
            estado: 'en-progreso',
        }
    },
    // 9. Cliente nuevo
    {
        id: 'cl-9',
        nombre: 'Daniela Soto',
        empresa: 'Sabor Criollo',
        telefono: '55-9900-1122',
        email: 'daniela.s@saborcriollo.com',
        fechaInicio: formatISO(new Date('2026-04-01T12:00:00Z')),
        estado: 'activo',
        diaDePago: 1,
        cuotaMensual: 4500,
        proyecto: {
            nombre: 'Menú Digital QR',
            descripcion: 'Implementación de sistema de menú digital interactivo.',
            fechaEntrega: formatISO(new Date('2026-05-15T12:00:00Z')),
            estado: 'en-progreso',
        }
    },
    // 10. Pago de cuota vencido de hace meses
    {
        id: 'cl-10',
        nombre: 'Fernando Diaz',
        empresa: 'Tutorías Éxito',
        telefono: '55-0011-2233',
        email: 'fernando.d@tutoriaexito.com',
        fechaInicio: formatISO(new Date('2025-10-15T12:00:00Z')),
        estado: 'activo',
        diaDePago: 28,
        cuotaMensual: 6000,
        proyecto: {
            nombre: 'Plataforma Educativa',
            descripcion: 'Mantenimiento y soporte de plataforma de e-learning.',
            fechaEntrega: formatISO(new Date('2026-12-31T12:00:00Z')),
            estado: 'en-progreso',
        }
    }
];

export const mockPagos: Pago[] = [
    // --- Pagos para Cliente 1 (Constructora Roble) ---
    { id: 'pa-1-1', clienteId: 'cl-1', monto: 7500, concepto: 'Mensualidad Feb', fechaLimite: formatISO(new Date('2026-02-05T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-02-04T12:00:00Z')) },
    { id: 'pa-1-2', clienteId: 'cl-1', monto: 7500, concepto: 'Mensualidad Mar', fechaLimite: formatISO(new Date('2026-03-05T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-03-05T12:00:00Z')) },
    { id: 'pa-1-3', clienteId: 'cl-1', monto: 7500, concepto: 'Mensualidad Abr', fechaLimite: formatISO(new Date('2026-04-05T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-04-03T12:00:00Z')) },
    { id: 'pa-1-4', clienteId: 'cl-1', monto: 7500, concepto: 'Mensualidad May', fechaLimite: formatISO(new Date('2026-05-05T12:00:00Z')), estado: 'pendiente' },

    // --- Pagos para Cliente 2 (Gimnasio Fuerte) ---
    { id: 'pa-2-1', clienteId: 'cl-2', monto: 15000, concepto: 'Apertura de Proyecto', fechaLimite: formatISO(new Date('2026-02-10T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-02-08T12:00:00Z')) },
    { id: 'pa-2-2', clienteId: 'cl-2', monto: 4000, concepto: 'Mensualidad Mar', fechaLimite: formatISO(new Date('2026-03-10T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-03-10T12:00:00Z')) },
    { id: 'pa-2-3', clienteId: 'cl-2', monto: 4000, concepto: 'Mensualidad Abr', fechaLimite: formatISO(new Date('2026-04-10T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-04-12T12:00:00Z')) }, // Pagado con retraso
    { id: 'pa-2-4', clienteId: 'cl-2', monto: 4000, concepto: 'Mensualidad May', fechaLimite: formatISO(new Date('2026-05-10T12:00:00Z')), estado: 'pendiente' },

    // --- Pagos para Cliente 3 (Digitalia Marketing) ---
    { id: 'pa-3-1', clienteId: 'cl-3', monto: 20000, concepto: 'Apertura de Campaña', fechaLimite: formatISO(new Date('2026-01-20T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-01-18T12:00:00Z')) },
    { id: 'pa-3-2', clienteId: 'cl-3', monto: 10000, concepto: 'Adelanto Q2', fechaLimite: formatISO(new Date('2026-01-30T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-01-28T12:00:00Z')) },
    { id: 'pa-3-3', clienteId: 'cl-3', monto: 12000, concepto: 'Mensualidad Feb', fechaLimite: formatISO(new Date('2026-02-15T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-02-15T12:00:00Z')) },
    { id: 'pa-3-4', clienteId: 'cl-3', monto: 12000, concepto: 'Mensualidad Mar', fechaLimite: formatISO(new Date('2026-03-15T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-03-14T12:00:00Z')) },
    { id: 'pa-3-5', clienteId: 'cl-3', monto: 12000, concepto: 'Mensualidad Abr', fechaLimite: formatISO(new Date('2026-04-15T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-04-15T12:00:00Z')) },

    // --- Pagos para Cliente 4 (Café Aromas) - VENCIDO ---
    { id: 'pa-4-1', clienteId: 'cl-4', monto: 3500, concepto: 'Mensualidad Feb', fechaLimite: formatISO(new Date('2026-02-01T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-02-01T12:00:00Z')) },
    { id: 'pa-4-2', clienteId: 'cl-4', monto: 3500, concepto: 'Mensualidad Mar', fechaLimite: formatISO(new Date('2026-03-01T12:00:00Z')), estado: 'pendiente' }, // Vencido
    { id: 'pa-4-3', clienteId: 'cl-4', monto: 3500, concepto: 'Mensualidad Abr', fechaLimite: formatISO(new Date('2026-04-01T12:00:00Z')), estado: 'pendiente' }, // Vencido
    
    // --- Pagos para Cliente 5 (Legallex Abogados) ---
    { id: 'pa-5-1', clienteId: 'cl-5', monto: 30000, concepto: 'Apertura Sistema', fechaLimite: formatISO(new Date('2026-03-15T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-03-15T12:00:00Z')) },
    { id: 'pa-5-2', clienteId: 'cl-5', monto: 25000, concepto: 'Adelanto 50%', fechaLimite: formatISO(new Date('2026-03-20T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-03-20T12:00:00Z')) },
    { id: 'pa-5-3', clienteId: 'cl-5', monto: 25000, concepto: 'Finiquito', fechaLimite: formatISO(new Date('2026-09-15T12:00:00Z')), estado: 'pendiente' },

    // --- Pagos para Cliente 7 (Fintech Soluciones) ---
    { id: 'pa-7-1', clienteId: 'cl-7', monto: 25000, concepto: 'Mensualidad Ene', fechaLimite: formatISO(new Date('2026-01-25T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-01-24T12:00:00Z')) },
    { id: 'pa-7-2', clienteId: 'cl-7', monto: 25000, concepto: 'Mensualidad Feb', fechaLimite: formatISO(new Date('2026-02-25T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-02-25T12:00:00Z')) },
    { id: 'pa-7-3', clienteId: 'cl-7', monto: 25000, concepto: 'Mensualidad Mar', fechaLimite: formatISO(new Date('2026-03-25T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-03-22T12:00:00Z')) },
    { id: 'pa-7-4', clienteId: 'cl-7', monto: 25000, concepto: 'Mensualidad Abr', fechaLimite: formatISO(new Date('2026-04-25T12:00:00Z')), estado: 'pendiente' },

    // --- Pagos para Cliente 8 (ArquiDiseño) ---
    { id: 'pa-8-1', clienteId: 'cl-8', monto: 40000, concepto: 'Adelanto 1 - Planos', fechaLimite: formatISO(new Date('2026-03-01T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-02-28T12:00:00Z')) },
    { id: 'pa-8-2', clienteId: 'cl-8', monto: 50000, concepto: 'Adelanto 2 - Renders', fechaLimite: formatISO(new Date('2026-05-15T12:00:00Z')), estado: 'pendiente' },
    { id: 'pa-8-3', clienteId: 'cl-8', monto: 35000, concepto: 'Finiquito', fechaLimite: formatISO(new Date('2026-07-31T12:00:00Z')), estado: 'pendiente' },
    
    // --- Pagos para Cliente 9 (Sabor Criollo) ---
    { id: 'pa-9-1', clienteId: 'cl-9', monto: 5000, concepto: 'Apertura Menú QR', fechaLimite: formatISO(new Date('2026-04-10T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-04-09T12:00:00Z')) },
    { id: 'pa-9-2', clienteId: 'cl-9', monto: 4500, concepto: 'Mensualidad May', fechaLimite: formatISO(new Date('2026-05-01T12:00:00Z')), estado: 'pendiente' },

    // --- Pagos para Cliente 10 (Tutorías Éxito) - VENCIDOS ---
    { id: 'pa-10-1', clienteId: 'cl-10', monto: 6000, concepto: 'Mensualidad Ene', fechaLimite: formatISO(new Date('2026-01-28T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-01-28T12:00:00Z')) },
    { id: 'pa-10-2', clienteId: 'cl-10', monto: 6000, concepto: 'Mensualidad Feb', fechaLimite: formatISO(new Date('2026-02-28T12:00:00Z')), estado: 'pendiente' }, // Vencido
    { id: 'pa-10-3', clienteId: 'cl-10', monto: 6000, concepto: 'Mensualidad Mar', fechaLimite: formatISO(new Date('2026-03-28T12:00:00Z')), estado: 'pendiente' }  // Vencido
];
