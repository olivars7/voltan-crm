'use client';
import { useClientes } from '@/hooks/useClientes';
import { usePagos } from '@/hooks/usePagos';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Calendar, DollarSign, AlertTriangle, ClipboardCheck } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { isBefore, parseISO, subMonths, startOfMonth, endOfMonth, format, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEffect, useState } from 'react';

type TimelineItem = {
  date: Date;
  type: 'pago' | 'entrega';
  data: any;
  cliente: any;
}

export default function DashboardPage() {
  const { clientes, getClienteById } = useClientes();
  const { pagos } = usePagos();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // This runs only on the client, after hydration
    setNow(new Date());
  }, []);

  const activeClients = clientes.filter((c) => c.estado === 'activo').length;
  const pendingPayments = now ? pagos.filter((p) => p.estado === 'pendiente' && isBefore(parseISO(p.fechaLimite), now)) : [];
  const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + p.monto, 0);

  // General Console Data
  const timelineItems: TimelineItem[] = [];

  pagos.forEach(p => {
    if (p.estado === 'pendiente') {
      timelineItems.push({
        date: parseISO(p.fechaLimite),
        type: 'pago',
        data: p,
        cliente: getClienteById(p.clienteId)
      });
    }
  });

  clientes.forEach(cl => {
    if (cl.proyecto && cl.proyecto.estado === 'en-progreso') {
      timelineItems.push({
        date: parseISO(cl.proyecto.fechaEntrega),
        type: 'entrega',
        data: cl.proyecto,
        cliente: cl
      });
    }
  });
  
  const sortedTimeline = timelineItems.sort((a,b) => a.date.getTime() - b.date.getTime());

  // Statistics Data
  const last4Months = now ? Array.from({ length: 4 }).map((_, i) => subMonths(now, 3 - i)) : [];
  
  const monthlyRevenue = last4Months.map(monthDate => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    
    const revenue = pagos
      .filter(p => p.estado === 'pagado' && isWithinInterval(parseISO(p.fechaPago!), { start: monthStart, end: monthEnd }))
      .reduce((sum, p) => sum + p.monto, 0);
      
    return {
      month: format(monthDate, 'MMM', { locale: es }),
      ingresos: revenue,
    };
  });

  const newClientsByMonth = last4Months.map(monthDate => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    
    const newClients = clientes
      .filter(c => isWithinInterval(parseISO(c.fechaInicio), { start: monthStart, end: monthEnd }))
      .length;
      
    return {
      month: format(monthDate, 'MMM', { locale: es }),
      clientes: newClients,
    };
  });

  const chartConfig: ChartConfig = {
    ingresos: {
      label: "Ingresos",
      color: "hsl(var(--chart-1))",
    },
    clientes: {
      label: "Nuevos Clientes",
      color: "hsl(var(--chart-2))",
    },
  }

  const TimelineIcon = ({ type }: { type: TimelineItem['type'] }) => {
    switch (type) {
      case 'pago': return <DollarSign className="h-4 w-4 text-muted-foreground" />;
      case 'entrega': return <ClipboardCheck className="h-4 w-4 text-muted-foreground" />;
      default: return null;
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{now ? activeClients : 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-status-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{now ? pendingPayments.length : 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deuda Vencida</CardTitle>
            <DollarSign className="h-4 w-4 text-status-danger" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{now ? formatCurrency(totalPendingAmount) : formatCurrency(0)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Consola General</CardTitle>
            <CardDescription>Eventos importantes ordenados cronológicamente.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
                <div className="space-y-6 pr-4">
                    {now && sortedTimeline.map((item, index) => (
                        <div key={index} className="flex items-start gap-4">
                            <TimelineIcon type={item.type} />
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {item.type === 'pago' && `Pago de ${formatCurrency(item.data.monto)}`}
                                    {item.type === 'entrega' && `Entrega: ${item.data.nombre}`}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    <span className={now && isBefore(item.date, now) ? 'text-status-danger font-medium' : ''}>
                                      {formatDate(item.date, "d MMM, yyyy")}
                                    </span>
                                    {' • '}
                                    {item.cliente?.nombre}
                                </p>
                            </div>
                        </div>
                    ))}
                    {(!now || (now && sortedTimeline.length === 0)) && (
                        <p className="text-sm text-muted-foreground text-center py-10">
                          {now ? 'No hay eventos próximos.' : 'Cargando eventos...'}
                        </p>
                    )}
                </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="xl:col-span-2">
            <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
                <CardDescription>Rendimiento de los últimos 4 meses.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Ingresos Mensuales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="w-full h-48">
                            {now && <BarChart accessibilityLayer data={monthlyRevenue} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                                <YAxis tickFormatter={(value) => `$${value/1000}k`} tickLine={false} axisLine={false} fontSize={12} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                <Bar dataKey="ingresos" fill="var(--color-ingresos)" radius={4} />
                            </BarChart>}
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Nuevos Clientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="w-full h-48">
                            {now && <BarChart accessibilityLayer data={newClientsByMonth} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                <Bar dataKey="clientes" fill="var(--color-clientes)" radius={4} />
                            </BarChart>}
                        </ChartContainer>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
