"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function PatientGuard({
  role,
  children,
}: {
  role?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const isForbidden =
    role === "PATIENT" && pathname !== "/dashboard/appointments";

  useEffect(() => {
    if (isForbidden) {
      router.replace("/dashboard/appointments");
    }
  }, [isForbidden, router]);

  if (isForbidden) return null;

  return <>{children}</>;
}