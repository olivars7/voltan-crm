import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Status = 
  | 'pendiente' | 'pagado' | 'vencido' 
  | 'activo' | 'inactivo' 
  | 'en-progreso' | 'completado' | 'pausado' | 'cancelado' 
  | 'pronto' | 'realizada'
  | 'por-contactar' | 'contactado' | 'demo-agendada' | 'convertido' | 'no-interesado';

type StatusBadgeProps = {
  status: Status;
};

const statusStyles: Record<Status, string> = {
  // Pagos
  pendiente: "bg-status-warning/30 text-status-warning border-status-warning/40",
  pagado: "bg-status-success/30 text-status-success border-status-success/40",
  vencido: "bg-status-danger/30 text-status-danger border-status-danger/40",
  // Cliente / Proyecto
  activo: "bg-status-active/30 text-status-active border-status-active/40",
  inactivo: "bg-status-inactive/30 text-status-inactive border-status-inactive/40",
  "en-progreso": "bg-status-warning/30 text-status-warning border-status-warning/40",
  completado: "bg-status-success/30 text-status-success border-status-success/40",
  pausado: "bg-status-inactive/30 text-status-inactive border-status-inactive/40",
  cancelado: "bg-status-danger/30 text-status-danger border-status-danger/40",
  // Agenda
  pronto: "bg-status-active/30 text-status-active border-status-active/40",
  realizada: "bg-status-success/30 text-status-success border-status-success/40",
  // Leads
  'por-contactar': "bg-status-active/30 text-status-active border-status-active/40",
  'contactado': "bg-blue-500/20 text-blue-600 border-blue-500/30",
  'demo-agendada': "bg-status-warning/30 text-status-warning border-status-warning/40",
  'convertido': "bg-status-success/30 text-status-success border-status-success/40",
  'no-interesado': "bg-status-danger/30 text-status-danger border-status-danger/40",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const formattedStatus = status.replace(/-/g, ' ');
  return (
    <Badge
      variant="outline"
      className={cn("capitalize", statusStyles[status])}
    >
      {formattedStatus}
    </Badge>
  );
}
