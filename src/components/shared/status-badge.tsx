import { cn } from "@/lib/utils";
import {
  APPOINTMENT_STATUS_LABELS,
  type AppointmentStatus,
} from "@/features/appointments/types";

const STATUS_BADGE_STYLES: Record<AppointmentStatus, string> = {
  PENDING: "bg-warning/15 text-warning border-warning/25",
  CONFIRMED: "bg-success/15 text-success border-success/25",
  CANCELLED: "bg-destructive/15 text-destructive border-destructive/25",
  COMPLETED: "bg-info/15 text-info border-info/25",
  ABSENT: "bg-muted text-muted-foreground border-border",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const key = (status ?? "").toUpperCase() as AppointmentStatus;
  const label = APPOINTMENT_STATUS_LABELS[key] ?? status;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_BADGE_STYLES[key] ?? "bg-muted text-muted-foreground border-border",
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      {label}
    </span>
  );
}