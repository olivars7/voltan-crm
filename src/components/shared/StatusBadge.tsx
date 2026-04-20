import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Status = 'pendiente' | 'pagado' | 'completada' | 'activo' | 'inactivo' | 'en-progreso' | 'completado' | 'pausado' | 'cancelado';

type StatusBadgeProps = {
  status: Status;
};

const statusStyles: Record<Status, string> = {
  pendiente: "bg-status-warning/20 text-status-warning border-status-warning/30",
  pagado: "bg-status-success/20 text-status-success border-status-success/30",
  completada: "bg-status-success/20 text-status-success border-status-success/30",
  activo: "bg-status-active/20 text-status-active border-status-active/30",
  inactivo: "bg-status-inactive/20 text-status-inactive border-status-inactive/30",
  "en-progreso": "bg-status-warning/20 text-status-warning border-status-warning/30",
  completado: "bg-status-success/20 text-status-success border-status-success/30",
  pausado: "bg-status-inactive/20 text-status-inactive border-status-inactive/30",
  cancelado: "bg-status-danger/20 text-status-danger border-status-danger/30",
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
