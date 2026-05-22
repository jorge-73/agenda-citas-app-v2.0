"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, Settings, ChevronDown, Loader2 } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { MobileNav } from "./mobile-nav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { logoutAction } from "@/features/auth/actions";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string;
    image?: string | null;
  } | null | undefined;
  userRole?: UserRole;
}

export function Navbar({ user, userRole }: NavbarProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutAction();
    } catch (error) {
      console.error("Error logging out:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className={cn(
      "sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/40 bg-background/70 px-4 md:px-6 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/70 transition-shadow duration-200",
      scrolled && "shadow-sm"
    )}>
      <div className="flex flex-1 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="lg:hidden">
            <MobileNav userRole={userRole} />
          </div>
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-medium text-foreground/80"
          >
            Panel de Control
          </motion.h2>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 h-10 px-3 rounded-xl transition-all duration-200 hover:bg-accent/50"
            >
              <Avatar className="h-8 w-8 border border-border/40">
                <AvatarImage src={user?.image ?? ""} alt={user?.name ?? ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                  {user?.name ? getInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden md:inline text-foreground/80">
                {user?.name ?? "Usuario"}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-64 rounded-xl border border-border/60 p-2" align="end" forceMount>
            <DropdownMenuLabel className="px-3 py-2">
              <div className="flex flex-col space-y-1.5">
                <p className="text-sm font-medium leading-none">{user?.name ?? "Usuario"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="-mx-2 my-1" />
            <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-3 py-2 mx-1">
              <Link href="/dashboard/settings" className="flex items-center">
                <Settings className="mr-2.5 h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Configuración</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-3 py-2 mx-1">
              <Link href="/dashboard/profile" className="flex items-center">
                <User className="mr-2.5 h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="-mx-2 my-1" />
            <DropdownMenuItem
              className="cursor-pointer rounded-lg px-3 py-2 mx-1 text-destructive focus:text-destructive focus:bg-destructive/5"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <Loader2 className="mr-2.5 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2.5 h-4 w-4" />
              )}
              <span className="text-sm">{isLoggingOut ? "Cerrando..." : "Cerrar sesión"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}