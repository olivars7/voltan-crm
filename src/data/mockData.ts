import type { Cliente, Pago, ProyectoEstado } from '@/lib/types';
import { subDays, addDays, formatISO, subMonths, addMonths, subYears, startOfMonth, parseISO, endOfMonth, isBefore } from 'date-fns';

const today = new Date();

export const mockClientes: Cliente[] = Array.from({ length: 20 }, (_, i) => {
    const id = `cl-${i + 1}`;
    const monthsAgo = Math.floor(Math.random() * 36) + 1; // 1 to 36 months ago
    const fechaInicio = subMonths(today, monthsAgo);
    
    const names = ['Ana Torres', 'Carlos Mendoza', 'Beatriz Navarro', 'David Ríos', 'Elena Garza', 'Francisco León', 'Gloria Ponce', 'Hugo Valdez', 'Irene Soto', 'Javier Luna', 'Karla Ríos', 'Luis Marín', 'Mónica Solís', 'Néstor Paredes', 'Olivia Cárdenas', 'Pedro Galindo', 'Quintín Rocha', 'Raquel Alarcón', 'Sergio Villa', 'Teresa Ocampo'];
    const companies = ['Innovatech', 'Quantum Dynamics', 'Creaciones Visuales', 'Constructora Atlas', 'Gourmet World', 'Legal Integral', 'Salud y Bienestar', 'Transportes Rápidos', 'Arquestudio', 'Fintech Global', 'KR Comunicaciones', 'El Buen Comer', 'EducaMás', 'Viajes El Mundo', 'Moda Urbana', 'Dental Sonríe', 'Oceánica Corp', 'Eventos Mágicos', 'SV Contadores', 'Inmobiliaria Tu Hogar'];
    const projectStates: ProyectoEstado[] = ['en-progreso', 'completado', 'pausado', 'cancelado'];

    const client: Cliente = {
        id: id,
        nombre: names[i],
        empresa: companies[i],
        telefono: `55-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        email: `${names[i].split(' ')[0].toLowerCase()}@${companies[i].split(' ')[0].toLowerCase()}.com`,
        fechaInicio: formatISO(fechaInicio),
        estado: (i % 4 === 0 && i > 0) ? 'inactivo' : 'activo', // some inactive clients
        diaDePago: Math.floor(Math.random() * 28) + 1,
        cuotaMensual: (Math.floor(Math.random() * 20) + 1) * 500, // 500 to 10000
        proyecto: {
            nombre: `Proyecto ${companies[i].split(' ')[0]}`,
            descripcion: `Descripción detallada del proyecto para ${companies[i]}.`,
            fechaEntrega: formatISO(i % 2 === 0 ? addMonths(today, Math.floor(Math.random() * 3) + 1) : subMonths(today, Math.floor(Math.random() * 3) + 1)),
            estado: projectStates[i % projectStates.length],
        }
    };

    return client;
});


export const mockPagos: Pago[] = [];

mockClientes.forEach(cliente => {
    const fechaInicioDate = parseISO(cliente.fechaInicio);
    const montoApertura = (cliente.cuotaMensual || 0) * (Math.random() * 2 + 1); // 1x to 3x recurring

    // 1. Add Opening Payment for each client
    mockPagos.push({
        id: `pa-open-${cliente.id}`,
        clienteId: cliente.id,
        monto: montoApertura,
        concepto: 'Apertura',
        fechaPago: formatISO(fechaInicioDate),
        fechaLimite: formatISO(fechaInicioDate),
        estado: 'pagado',
        notas: 'Pago inicial de proyecto/servicio.'
    });

    // 2. Add historical recurring payments if client is active
    if (cliente.estado === 'activo' && cliente.diaDePago && cliente.cuotaMensual) {
      const now = new Date(2025, 10, 15); // November 15, 2025
      let cursorDate = parseISO(cliente.fechaInicio);

      while(isBefore(cursorDate, now)) {
          let paymentDueDate = addMonths(startOfMonth(cursorDate), 1);
          paymentDueDate.setDate(cliente.diaDePago);
          
          if (isBefore(paymentDueDate, now)) {
             const isOverdue = cliente.id === 'cl-8' && addMonths(startOfMonth(cursorDate), 2) > now;
             
             mockPagos.push({
                  id: `pa-hist-${cliente.id}-${formatISO(paymentDueDate)}`,
                  clienteId: cliente.id,
                  monto: cliente.cuotaMensual,
                  concepto: 'Mensualidad',
                  fechaPago: isOverdue ? undefined : formatISO(paymentDueDate),
                  fechaLimite: formatISO(paymentDueDate),
                  estado: isOverdue ? 'pendiente' : 'pagado',
              });
          }
          cursorDate = addMonths(cursorDate, 1);
      }
    }
     // 3. Add specific project-based payments for variety
    if (cliente.proyecto && cliente.proyecto.estado === 'en-progreso') {
        mockPagos.push({ 
            id: `pa-proj-${cliente.id}`, 
            clienteId: cliente.id, 
            monto: (cliente.cuotaMensual || 500) * 2, 
            concepto: 'Adelanto Proyecto',
            fechaLimite: formatISO(addDays(parseISO(cliente.proyecto.fechaEntrega), -30)), 
            estado: 'pendiente', 
            notas: `Pago intermedio para ${cliente.proyecto.nombre}` 
        });
    }
});
