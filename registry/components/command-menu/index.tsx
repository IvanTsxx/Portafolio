"use client";

import { AnimatePresence } from "motion/react";
import { useCallback, useEffect, useState } from "react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/shared/components/ui/command";
import { cn } from "@/shared/lib/utils";

export interface CommandMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  href?: string;
  onSelect?: () => void;
  disabled?: boolean;
}

export interface CommandMenuGroup {
  heading: string;
  items: CommandMenuItem[];
}

export interface CommandMenuProps {
  groups: CommandMenuGroup[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

function CommandMenuGroupAnimated({
  heading,
  items,
  activeId,
  onSelect,
}: {
  heading: string;
  items: CommandMenuItem[];
  activeId: string | null;
  onSelect: (item: CommandMenuItem) => void;
}) {
  return (
    <CommandGroup heading={heading}>
      {items.map((item) => (
        <CommandItem
          key={item.id}
          value={item.label}
          disabled={item.disabled}
          onSelect={() => onSelect(item)}
          className={cn(activeId === item.id && "bg-muted text-foreground")}
        >
          {item.icon && <span className="shrink-0">{item.icon}</span>}
          <span className="flex-1 truncate">{item.label}</span>
          {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
          {item.href && (
            <svg
              className="size-3 shrink-0 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          )}
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

export function CommandMenu({
  groups,
  open,
  onOpenChange,
  placeholder = "Type a command or search...",
  emptyMessage = "No results found.",
  className,
}: CommandMenuProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const flatItems = groups.flatMap((g) => g.items);

  const handleSelect = useCallback(
    (item: CommandMenuItem) => {
      if (item.disabled) return;
      item.onSelect?.();
      if (item.href) {
        window.open(item.href, "_blank", "noopener,noreferrer");
      }
      onOpenChange(false);
    },
    [onOpenChange]
  );

  useEffect(() => {
    if (open && flatItems.length > 0) {
      setActiveId(flatItems[0].id);
    }
  }, [open, flatItems]);

  return (
    <AnimatePresence>
      {open && (
        <CommandDialog
          open={open}
          onOpenChange={onOpenChange}
          title="Command Palette"
          description="Search for a command or navigate to a page."
          showCloseButton={false}
          className={cn("top-[20%] translate-y-0", className)}
        >
          <Command className="**:[[cmdk-input]]:h-9">
            <CommandInput placeholder={placeholder} />
            <CommandList className="max-h-40">
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              {groups.map((group) => (
                <CommandMenuGroupAnimated
                  key={group.heading}
                  heading={group.heading}
                  items={group.items}
                  activeId={activeId}
                  onSelect={handleSelect}
                />
              ))}
            </CommandList>
          </Command>
        </CommandDialog>
      )}
    </AnimatePresence>
  );
}
