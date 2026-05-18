"use client";

import * as React from "react";
import { Command } from "cmdk";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const CommandRoot = React.forwardRef<
  React.ElementRef<typeof Command>,
  React.ComponentPropsWithoutRef<typeof Command>
>(({ className, ...props }, ref) => (
  <Command
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-white",
      className
    )}
    {...props}
  />
));
CommandRoot.displayName = "Command";

const CommandInput = React.forwardRef<
  React.ElementRef<typeof Command.Input>,
  React.ComponentPropsWithoutRef<typeof Command.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <Command.Input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  </div>
));
CommandInput.displayName = Command.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof Command.List>,
  React.ComponentPropsWithoutRef<typeof Command.List>
>(({ className, ...props }, ref) => (
  <Command.List
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
));
CommandList.displayName = Command.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof Command.Empty>,
  React.ComponentPropsWithoutRef<typeof Command.Empty>
>(({ className, ...props }, ref) => (
  <Command.Empty
    ref={ref}
    className={cn("py-6 text-center text-sm", className)}
    {...props}
  />
));
CommandEmpty.displayName = Command.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof Command.Group>,
  React.ComponentPropsWithoutRef<typeof Command.Group>
>(({ className, ...props }, ref) => (
  <Command.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-zinc-950 [&_cmdk-group-heading]:px-2 [&_cmdk-group-heading]:py-1.5 [&_cmdk-group-heading]:text-xs [&_cmdk-group-heading]:font-medium [&_cmdk-group-heading]:text-zinc-500",
      className
    )}
    {...props}
  />
));
CommandGroup.displayName = Command.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof Command.Separator>,
  React.ComponentPropsWithoutRef<typeof Command.Separator>
>(({ className, ...props }, ref) => (
  <Command.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-zinc-200", className)}
    {...props}
  />
));
CommandSeparator.displayName = Command.Separator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof Command.Item>,
  React.ComponentPropsWithoutRef<typeof Command.Item>
>(({ className, ...props }, ref) => (
  <Command.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-zinc-100 aria-selected:text-zinc-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  />
));
CommandItem.displayName = Command.Item.displayName;

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-zinc-500",
        className
      )}
      {...props}
    />
  );
};
CommandShortcut.displayName = "CommandShortcut";

export {
  CommandRoot as Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandSeparator,
  CommandItem,
  CommandShortcut,
};