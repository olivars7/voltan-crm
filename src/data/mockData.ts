import type { Cliente, Pago } from '@/lib/types';
import { subDays, addDays, formatISO, subMonths, addMonths, subYears, startOfMonth, parseISO, endOfMonth } from 'date-fns';

const today = new Date();

export const mockClientes: Cliente[] = Array.from({ length: 20 }, (_, i) => {
    const id = `cl-${i + 1}`;
    const monthsAgo = Math.floor(Math.random() * 36) + 1; // 1 to 36 months ago
    const fechaInicio = subMonths(today, monthsAgo);
    
    const names = ['Ana Torres', 'Carlos Mendoza', 'Beatriz Navarro', 'David Ríos', 'Elena Garza', 'Francisco León', 'Gloria Ponce', 'Hugo Valdez', 'Irene Soto', 'Javier Luna', 'Karla Ríos', 'Luis Marín', 'Mónica Solís', 'Néstor Paredes', 'Olivia Cárdenas', 'Pedro Galindo', 'Quintín Rocha', 'Raquel Alarcón', 'Sergio Villa', 'Teresa Ocampo'];
    const companies = ['Innovatech', 'Quantum Dynamics', 'Creaciones Visuales', 'Constructora Atlas', 'Gourmet World', 'Legal Integral', 'Salud y Bienestar', 'Transportes Rápidos', 'Arquestudio', 'Fintech Global', 'KR Comunicaciones', 'El Buen Comer', 'EducaMás', 'Viajes El Mundo', 'Moda Urbana', 'Dental Sonríe', 'Oceánica Corp', 'Eventos Mágicos', 'SV Contadores', 'Inmobiliaria Tu Hogar'];

    const client: Cliente = {
        id: id,
        nombre: names[i],
        empresa: companies[i],
        telefono: `55-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        email: `${names[i].split(' ')[0].toLowerCase()}@${companies[i].split(' ')[0].toLowerCase()}.com`,
        fechaInicio: formatISO(fechaInicio),
        estado: (i % 4 === 0 && i > 0) ? 'inactivo' : 'activo', // some inactive clients
        diaDePago: Math.floor(Math.random() * 28) + 1,
        montoRecurrente: (Math.floor(Math.random() * 20) + 1) * 500, // 500 to 10000
    };

    if (i % 3 === 0) { // Add projects to some clients
        const projectStates: ('en-progreso' | 'completado' | 'pausado' | 'cancelado')[] = ['en-progreso', 'completado', 'pausado', 'cancelado'];
        client.proyecto = {
            nombre: `Proyecto ${companies[i]}`,
            descripcion: `Descripción del proyecto para ${companies[i]}.`,
            fechaEntrega: formatISO(i % 2 === 0 ? addMonths(today, Math.floor(Math.random() * 6)) : subMonths(today, Math.floor(Math.random() * 6))),
            estado: projectStates[i % 4],
        }
    }

    return client;
});


export const mockPagos: Pago[] = [];

mockClientes.forEach(cliente => {
    const fechaInicioDate = parseISO(cliente.fechaInicio);
    const montoApertura = cliente.montoRecurrente * (Math.random() * 2 + 1); // 1x to 3x recurring

    // 1. Add Opening Payment for each client
    mockPagos.push({
        id: `pa-open-${cliente.id}`,
        clienteId: cliente.id,
        monto: montoApertura,
        concepto: 'Apertura',
        fechaPago: formatISO(fechaInicioDate),
        fechaLimite: formatISO(fechaInicioDate),
        estado: 'pagado',
        notas: ''
    });

    // 2. Add historical recurring payments if client is active
    if (cliente.estado === 'activo') {
      const monthsSinceStart = (today.getFullYear() - fechaInicioDate.getFullYear()) * 12 + (today.getMonth() - fechaInicioDate.getMonth());
      
      for (let i = 1; i < monthsSinceStart; i++) {
          let paymentDate = addMonths(startOfMonth(fechaInicioDate), i);
          // Ensure payment date for a given month is not in the future relative to that month's end
          paymentDate = new Date(Math.min(paymentDate.getTime(), endOfMonth(paymentDate).getTime()));
          paymentDate.setDate(cliente.diaDePago);

          // For 'Hugo Valdez', make the last payment overdue
          if (cliente.id === 'cl-8' && i === monthsSinceStart - 1) {
              mockPagos.push({
                  id: `pa-hist-${cliente.id}-${i}`,
                  clienteId: cliente.id,
                  monto: cliente.montoRecurrente,
                  concepto: 'Mensualidad',
                  fechaLimite: formatISO(paymentDate),
                  estado: 'pendiente',
                  notas: ''
              });
              continue; 
          }

          mockPagos.push({
              id: `pa-hist-${cliente.id}-${i}`,
              clienteId: cliente.id,
              monto: cliente.montoRecurrente,
              concepto: 'Mensualidad',
              fechaPago: formatISO(paymentDate),
              fechaLimite: formatISO(paymentDate),
              estado: 'pagado',
              notas: ''
          });
      }
    }
     // 3. Add specific project-based payments for variety
    if (cliente.proyecto && cliente.proyecto.estado === 'en-progreso') {
        mockPagos.push({ 
            id: `pa-proj-${cliente.id}`, 
            clienteId: cliente.id, 
            monto: cliente.montoRecurrente * 5, 
            concepto: 'Pago Proyecto',
            fechaLimite: formatISO(parseISO(cliente.proyecto.fechaEntrega)), 
            estado: 'pendiente', 
            notas: `Pago final para ${cliente.proyecto.nombre}` 
        });
    }
});
