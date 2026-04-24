import type { Cliente, Pago, ProyectoEstado } from '@/lib/types';
import { formatISO } from 'date-fns';

// --- Enero 2026 a Junio 2026 ---
// The application logic assumes the current date is around April 15, 2026 for calculating "overdue" status.

export const mockClientes: Cliente[] = [
    // 1. Marketing Digital - Mensualidades, 1 vencida
    {
        id: 'cl-1',
        nombre: 'Sofia Rodriguez',
        empresa: 'Innovate Marketing',
        telefono: '55-1234-5678',
        email: 'sofia.r@innovate.com',
        fechaInicio: formatISO(new Date('2026-01-10T12:00:00Z')),
        estado: 'activo',
        diaDePago: 10,
        cuotaMensual: 5000,
        proyecto: {
            nombre: 'Gestión de Redes Sociales',
            descripcion: 'Manejo de cuentas de Instagram y Facebook.',
            fechaEntrega: formatISO(new Date('2026-12-31T12:00:00Z')),
            estado: 'en-progreso',
        }
    },
    // 2. Consultoría Legal - Apertura y cuotas
    {
        id: 'cl-2',
        nombre: 'Carlos Morales',
        empresa: 'Morales & Asoc. Legal',
        telefono: '55-8765-4321',
        email: 'carlos.m@moraleslegal.com',
        fechaInicio: formatISO(new Date('2026-02-15T12:00:00Z')),
        estado: 'activo',
        diaDePago: 15,
        cuotaMensual: 8000,
        proyecto: {
            nombre: 'Asesoría Corporativa',
            descripcion: 'Iguala mensual de asesoría legal para la empresa.',
            fechaEntrega: formatISO(new Date('2026-12-31T12:00:00Z')),
            estado: 'en-progreso',
        }
    },
    // 3. Desarrollo Web - Adelanto, Apertura y Cuotas
    {
        id: 'cl-3',
        nombre: 'Ana Torres',
        empresa: 'Gourmet Bistro',
        telefono: '55-5555-1111',
        email: 'ana.t@gourmetbistro.com',
        fechaInicio: formatISO(new Date('2026-01-20T12:00:00Z')),
        estado: 'activo',
        diaDePago: 20,
        cuotaMensual: 10000,
        proyecto: {
            nombre: 'Sitio Web con Reservas',
            descripcion: 'Desarrollo de nuevo sitio web y sistema de reservas online.',
            fechaEntrega: formatISO(new Date('2026-07-20T12:00:00Z')),
            estado: 'en-progreso',
        }
    },
    // 4. Diseño Gráfico - Proyecto por hitos
    {
        id: 'cl-4',
        nombre: 'Jorge Nuñez',
        empresa: 'CreaVisual',
        telefono: '55-2222-3333',
        email: 'jorge.n@creavisual.mx',
        fechaInicio: formatISO(new Date('2026-03-01T12:00:00Z')),
        estado: 'activo',
        cuotaMensual: 0,
        proyecto: {
            nombre: 'Branding para Marca Nueva',
            descripcion: 'Creación de logo, paleta de colores y manual de marca.',
            fechaEntrega: formatISO(new Date('2026-05-30T12:00:00Z')),
            estado: 'en-progreso',
        }
    },
    // 5. Contabilidad - Cliente ahora inactivo
    {
        id: 'cl-5',
        nombre: 'Laura Jimenez',
        empresa: 'Orden Contable',
        telefono: '55-4444-7777',
        email: 'laura.j@ordencontable.com',
        fechaInicio: formatISO(new Date('2025-12-05T12:00:00Z')),
        estado: 'inactivo',
        diaDePago: 5,
        cuotaMensual: 3000,
        proyecto: {
            nombre: 'Declaraciones Mensuales',
            descripcion: 'Servicio de contabilidad mensual.',
            fechaEntrega: formatISO(new Date('2026-03-31T12:00:00Z')),
            estado: 'completado',
        }
    },
    // 6. Fotografía - Cliente nuevo con pagos futuros
    {
        id: 'cl-6',
        nombre: 'David Fernandez',
        empresa: 'Click Perfecto',
        telefono: '55-6666-8888',
        email: 'david.f@clickperfecto.com',
        fechaInicio: formatISO(new Date('2026-04-05T12:00:00Z')),
        estado: 'activo',
        cuotaMensual: 0,
        proyecto: {
            nombre: 'Sesión de Fotos para E-commerce',
            descripcion: 'Fotografía de producto para 50 SKUs.',
            fechaEntrega: formatISO(new Date('2026-05-10T12:00:00Z')),
            estado: 'en-progreso',
        }
    }
];

export const mockPagos: Pago[] = [
    // --- Pagos Cliente 1 (Sofia Rodriguez) ---
    { id: 'pa-1-1', clienteId: 'cl-1', monto: 5000, concepto: 'Mensualidad Ene', fechaLimite: formatISO(new Date('2026-01-10T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-01-10T12:00:00Z')) },
    { id: 'pa-1-2', clienteId: 'cl-1', monto: 5000, concepto: 'Mensualidad Feb', fechaLimite: formatISO(new Date('2026-02-10T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-02-09T12:00:00Z')) },
    { id: 'pa-1-3', clienteId: 'cl-1', monto: 5000, concepto: 'Mensualidad Mar', fechaLimite: formatISO(new Date('2026-03-10T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-03-11T12:00:00Z')) },
    { id: 'pa-1-4', clienteId: 'cl-1', monto: 5000, concepto: 'Mensualidad Abr', fechaLimite: formatISO(new Date('2026-04-10T12:00:00Z')), estado: 'pendiente' }, // Vencido

    // --- Pagos Cliente 2 (Carlos Morales) ---
    { id: 'pa-2-1', clienteId: 'cl-2', monto: 12000, concepto: 'Apertura de Servicio', fechaLimite: formatISO(new Date('2026-02-20T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-02-18T12:00:00Z')) },
    { id: 'pa-2-2', clienteId: 'cl-2', monto: 8000, concepto: 'Mensualidad Mar', fechaLimite: formatISO(new Date('2026-03-15T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-03-15T12:00:00Z')) },
    { id: 'pa-2-3', clienteId: 'cl-2', monto: 8000, concepto: 'Mensualidad Abr', fechaLimite: formatISO(new Date('2026-04-15T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-04-14T12:00:00Z')) },
    { id: 'pa-2-4', clienteId: 'cl-2', monto: 8000, concepto: 'Mensualidad May', fechaLimite: formatISO(new Date('2026-05-15T12:00:00Z')), estado: 'pendiente' },

    // --- Pagos Cliente 3 (Ana Torres) ---
    { id: 'pa-3-1', clienteId: 'cl-3', monto: 15000, concepto: 'Adelanto Desarrollo', fechaLimite: formatISO(new Date('2026-01-25T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-01-22T12:00:00Z')) },
    { id: 'pa-3-2', clienteId: 'cl-3', monto: 15000, concepto: 'Apertura de Proyecto', fechaLimite: formatISO(new Date('2026-01-30T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-01-30T12:00:00Z')) },
    { id: 'pa-3-3', clienteId: 'cl-3', monto: 10000, concepto: 'Mensualidad Feb', fechaLimite: formatISO(new Date('2026-02-20T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-02-20T12:00:00Z')) },
    { id: 'pa-3-4', clienteId: 'cl-3', monto: 10000, concepto: 'Mensualidad Mar', fechaLimite: formatISO(new Date('2026-03-20T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-03-19T12:00:00Z')) },
    { id: 'pa-3-5', clienteId: 'cl-3', monto: 10000, concepto: 'Mensualidad Abr', fechaLimite: formatISO(new Date('2026-04-20T12:00:00Z')), estado: 'pendiente' },

    // --- Pagos Cliente 4 (Jorge Nuñez) ---
    { id: 'pa-4-1', clienteId: 'cl-4', monto: 7000, concepto: 'Adelanto 50%', fechaLimite: formatISO(new Date('2026-03-05T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-03-04T12:00:00Z')) },
    { id: 'pa-4-2', clienteId: 'cl-4', monto: 7000, concepto: 'Finiquito Contra-entrega', fechaLimite: formatISO(new Date('2026-05-30T12:00:00Z')), estado: 'pendiente' },

    // --- Pagos Cliente 5 (Laura Jimenez) ---
    { id: 'pa-5-1', clienteId: 'cl-5', monto: 3000, concepto: 'Mensualidad Ene', fechaLimite: formatISO(new Date('2026-01-05T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-01-05T12:00:00Z')) },
    { id: 'pa-5-2', clienteId: 'cl-5', monto: 3000, concepto: 'Mensualidad Feb', fechaLimite: formatISO(new Date('2026-02-05T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-02-03T12:00:00Z')) },
    { id: 'pa-5-3', clienteId: 'cl-5', monto: 3000, concepto: 'Finiquito Mar', fechaLimite: formatISO(new Date('2026-03-05T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-03-05T12:00:00Z')) },
    
    // --- Pagos Cliente 6 (David Fernandez) ---
    { id: 'pa-6-1', clienteId: 'cl-6', monto: 4000, concepto: 'Apertura de Sesión', fechaLimite: formatISO(new Date('2026-04-10T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-04-09T12:00:00Z')) },
    { id: 'pa-6-2', clienteId: 'cl-6', monto: 4000, concepto: 'Finiquito de Proyecto', fechaLimite: formatISO(new Date('2026-05-10T12:00:00Z')), estado: 'pendiente' }
];
