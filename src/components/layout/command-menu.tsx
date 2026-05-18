"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Calendar, Users, Stethoscope, Settings, LayoutDashboard, Search } from "lucide-react";

interface CommandMenuProps {
  children?: React.ReactNode;
}

export function CommandMenu({ children }: CommandMenuProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false);
      command();
    },
    []
  );

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {children || (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-md">
            <Search className="h-4 w-4" />
            <span>Buscar...</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-zinc-200 px-1.5 font-mono text-[10px] font-medium">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 overflow-hidden max-w-lg">
          <Command>
            <CommandInput placeholder="Buscar en la aplicación..." />
            <CommandList>
              <CommandEmpty>No se encontraron resultados.</CommandEmpty>
              <CommandGroup heading="Navegación">
                <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/appointments"))}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Citas
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/patients"))}>
                  <Users className="mr-2 h-4 w-4" />
                  Pacientes
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/specialists"))}>
                  <Stethoscope className="mr-2 h-4 w-4" />
                  Especialistas
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/settings"))}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Acciones rápidas">
                <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/appointments/new"))}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Nueva cita
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/patients/new"))}>
                  <Users className="mr-2 h-4 w-4" />
                  Nuevo paciente
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}