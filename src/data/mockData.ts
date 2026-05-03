import type { Cliente, Pago, Lead, LlamadaAgendada } from '@/lib/types';
import { formatISO } from 'date-fns';

export const mockClientes: Cliente[] = [
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
            portalUrl: '#',
            websiteUrl: 'https://innovatemarketing.com'
        }
    },
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
            portalUrl: '#',
            websiteUrl: '#'
        }
    },
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
            portalUrl: 'https://admin.gourmetbistro.com',
            websiteUrl: 'https://gourmetbistro.com'
        }
    }
];

export const mockPagos: Pago[] = [
    { id: 'pa-1-1', clienteId: 'cl-1', monto: 5000, concepto: 'Mensualidad Ene', fechaLimite: formatISO(new Date('2026-01-10T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-01-10T12:00:00Z')) },
    { id: 'pa-1-2', clienteId: 'cl-1', monto: 5000, concepto: 'Mensualidad Feb', fechaLimite: formatISO(new Date('2026-02-10T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-02-09T12:00:00Z')) },
    { id: 'pa-1-3', clienteId: 'cl-1', monto: 5000, concepto: 'Mensualidad Mar', fechaLimite: formatISO(new Date('2026-03-10T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-03-11T12:00:00Z')) },
    { id: 'pa-1-4', clienteId: 'cl-1', monto: 5000, concepto: 'Mensualidad Abr', fechaLimite: formatISO(new Date('2026-04-10T12:00:00Z')), estado: 'pendiente' },
    { id: 'pa-2-1', clienteId: 'cl-2', monto: 12000, concepto: 'Apertura de Servicio', fechaLimite: formatISO(new Date('2026-02-20T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-02-18T12:00:00Z')) },
    { id: 'pa-3-1', clienteId: 'cl-3', monto: 15000, concepto: 'Adelanto Desarrollo', fechaLimite: formatISO(new Date('2026-01-25T12:00:00Z')), estado: 'pagado', fechaPago: formatISO(new Date('2026-01-22T12:00:00Z')) }
];

export const mockLeads: Lead[] = [
    {
        id: 'lead-1',
        nombre: 'Marcos Galperin',
        telefono: '55-1122-3344',
        nicho: 'E-commerce',
        servicios: ['crm', 'panel-administrativo'],
        estado: 'por-contactar',
        fechaCreacion: formatISO(new Date('2026-04-01T10:00:00Z')),
        notas: 'Interesado en automatizar ventas de su marketplace local.'
    },
    {
        id: 'lead-2',
        nombre: 'Elena Poniatowska',
        telefono: '55-9988-7766',
        nicho: 'Editorial',
        servicios: ['landing-page'],
        estado: 'contactado',
        fechaCreacion: formatISO(new Date('2026-04-05T14:30:00Z')),
        notas: 'Quiere una página para promocionar su nuevo libro.'
    }
];

export const mockLlamadas: LlamadaAgendada[] = [
    {
        id: 'call-1',
        nombre: 'Sofia Rodriguez',
        telefono: '55-1234-5678',
        medio: 'google-meet',
        fecha: formatISO(new Date('2026-04-20T16:00:00Z')),
        estado: 'pronto',
        notas: 'Revisión de métricas mensuales.'
    }
];
