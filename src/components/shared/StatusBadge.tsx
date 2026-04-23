import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Status = 'pendiente' | 'pagado' | 'vencido' | 'completada' | 'activo' | 'inactivo' | 'en-progreso' | 'completado' | 'pausado' | 'cancelado';

type StatusBadgeProps = {
  status: Status;
};

const statusStyles: Record<Status, string> = {
  pendiente: "bg-status-warning/30 text-status-warning border-status-warning/40",
  pagado: "bg-status-success/30 text-status-success border-status-success/40",
  vencido: "bg-status-danger/30 text-status-danger border-status-danger/40",
  completada: "bg-status-success/30 text-status-success border-status-success/40",
  activo: "bg-status-active/30 text-status-active border-status-active/40",
  inactivo: "bg-status-inactive/30 text-status-inactive border-status-inactive/40",
  "en-progreso": "bg-status-warning/30 text-status-warning border-status-warning/40",
  completado: "bg-status-success/30 text-status-success border-status-success/40",
  pausado: "bg-status-inactive/30 text-status-inactive border-status-inactive/40",
  cancelado: "bg-status-danger/30 text-status-danger border-status-danger/40",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const formattedStatus = status.replace('-', ' ');
  return (
    <Badge
      variant="outline"
      className={cn("capitalize", statusStyles[status])}
    >
      {formattedStatus}
    </Badge>
  );
}
