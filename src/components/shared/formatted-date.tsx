"use client";

import { useUserTimezone } from "@/hooks/use-user-timezone";
import { formatInTz } from "@/lib/date-utils";

interface FormattedDateProps {
  date: Date | string;
  format?: string;
  className?: string;
}

export function FormattedDate({ date, format: fmt = "dd/MM/yyyy HH:mm", className }: FormattedDateProps) {
  const timezone = useUserTimezone();
  const d = typeof date === "string" ? new Date(date) : date;

  return (
    <time dateTime={d.toISOString()} className={className} suppressHydrationWarning>
      {formatInTz(d, fmt, timezone)}
    </time>
  );
}
