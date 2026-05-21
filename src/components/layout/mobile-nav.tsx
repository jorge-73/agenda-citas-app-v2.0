"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  Settings,
  Clock,
  CalendarOff,
  HeartPulse,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { hasPermission, type Permission } from "@/lib/permissions";
import type { UserRole } from "@/types";

const navItems: { title: string; href: string; icon: any; permission: Permission }[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "view:dashboard" },
  { title: "Citas", href: "/dashboard/appointments", icon: Calendar, permission: "view:appointments" },
  { title: "Pacientes", href: "/dashboard/patients", icon: Users, permission: "view:patients" },
  { title: "Especialistas", href: "/dashboard/specialists", icon: Stethoscope, permission: "view:specialists" },
  { title: "Horarios", href: "/dashboard/schedules", icon: Clock, permission: "view:schedules" },
  { title: "Días bloqueados", href: "/dashboard/blocked-dates", icon: CalendarOff, permission: "view:blocked-dates" },
  { title: "Configuración", href: "/dashboard/settings", icon: Settings, permission: "view:settings" },
];

interface MobileNavProps {
  userRole?: UserRole;
}

export function MobileNav({ userRole }: MobileNavProps) {
  const pathname = usePathname();

  const visibleItems = navItems.filter(
    (item) => hasPermission(userRole, item.permission)
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden rounded-xl">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <HeartPulse className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold">CitasMed</span>
          </SheetTitle>
        </SheetHeader>
        
        <nav className="flex flex-col gap-1 p-3">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium",
                  "transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon className={cn(
                  "h-5 w-5 shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground/70"
                )} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-muted/20">
          <p className="text-xs text-muted-foreground text-center">
            Panel de Administración v1.0.0
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}