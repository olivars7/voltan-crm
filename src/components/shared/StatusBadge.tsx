import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Status = 'pendiente' | 'pagado' | 'completada' | 'activo' | 'inactivo';

type StatusBadgeProps = {
  status: Status;
};

const statusStyles: Record<Status, string> = {
  pendiente: "bg-status-warning/20 text-status-warning border-status-warning/30",
  pagado: "bg-status-success/20 text-status-success border-status-success/30",
  completada: "bg-status-success/20 text-status-success border-status-success/30",
  activo: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  inactivo: "bg-gray-500/20 text-gray-500 border-gray-500/30",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("capitalize", statusStyles[status])}
    >
      {status}
    </Badge>
  );
}
