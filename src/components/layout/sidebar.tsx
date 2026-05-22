"use client";

import Link from "next/link";
import type React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  Settings,
  Clock,
  CalendarOff,
  Shield,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { hasPermission, type Permission } from "@/lib/permissions";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";

const navItems: { title: string; href: string; icon: React.ComponentType<{ className?: string }>; permission: Permission }[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: "view:dashboard",
  },
  {
    title: "Citas",
    href: "/dashboard/appointments",
    icon: Calendar,
    permission: "view:appointments",
  },
  {
    title: "Pacientes",
    href: "/dashboard/patients",
    icon: Users,
    permission: "view:patients",
  },
  {
    title: "Especialistas",
    href: "/dashboard/specialists",
    icon: Stethoscope,
    permission: "view:specialists",
  },
  {
    title: "Horarios",
    href: "/dashboard/schedules",
    icon: Clock,
    permission: "view:schedules",
  },
  {
    title: "Días bloqueados",
    href: "/dashboard/blocked-dates",
    icon: CalendarOff,
    permission: "view:blocked-dates",
  },
  {
    title: "Usuarios",
    href: "/dashboard/users",
    icon: Shield,
    permission: "view:users",
  },
  {
    title: "Configuración",
    href: "/dashboard/settings",
    icon: Settings,
    permission: "view:settings",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const userRole = useAuthStore((state) => state.user?.role);
  const collapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  const visibleItems = navItems.filter(
    (item) => !item.permission || hasPermission(userRole, item.permission)
  );

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 260 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex flex-col h-full bg-sidebar border-r border-sidebar-border"
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-sidebar-border px-3">
          <Link href="/dashboard" className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/20"
            >
              <HeartPulse className="h-5 w-5 text-primary-foreground" />
            </motion.div>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="font-semibold text-sm whitespace-nowrap text-sidebar-foreground"
                >
                  CitasMed
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 gap-1.5 p-3 overflow-y-auto">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            const link = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                  "transition-all duration-200 ease-out",
                  isActive
                    ? "text-sidebar-primary bg-primary/10"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary/8 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-border"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-primary to-primary/60 rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <motion.div
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10"
                >
                  <Icon className={cn(
                    "h-5 w-5 shrink-0 transition-colors duration-200",
                    isActive ? "text-sidebar-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground/80"
                  )} />
                </motion.div>
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative z-10 whitespace-nowrap"
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return link;
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3 space-y-3">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-center text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
              "transition-all duration-200",
              collapsed && "px-2"
            )}
            onClick={toggleSidebar}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span className="text-xs">Colapsar</span>
              </>
            )}
          </Button>
          
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="rounded-xl bg-sidebar-accent/30 p-3"
              >
                <p className="text-xs text-sidebar-foreground/50">Panel de Administración</p>
                <p className="text-xs font-medium text-sidebar-foreground/70 mt-1">Versión 1.0.0</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}