"use client";

import { createContext, use, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { CommandPalette } from "@/components/command/command-palette";
import type { SearchEntry } from "@/lib/search/types";

interface CommandPaletteContextValue {
  openPalette: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(
  null
);

export const useCommandPalette = () => {
  const context = use(CommandPaletteContext);
  if (!context) {
    throw new Error("useCommandPalette needs a CommandPaletteProvider");
  }
  return context;
};

const hasModifier = (event: KeyboardEvent) =>
  event.metaKey || event.ctrlKey || event.altKey;

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT");

export const CommandPaletteProvider = ({
  children,
  entries,
}: {
  children: ReactNode;
  entries: readonly SearchEntry[];
}) => {
  const [open, setOpen] = useState(false);
  const controls = { openPalette: () => setOpen(true) };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) {
        return;
      }
      const isToggleShortcut =
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        !event.shiftKey &&
        event.key.toLowerCase() === "k";
      if (isToggleShortcut) {
        event.preventDefault();
        setOpen((current) => !current);
        return;
      }
      if (
        event.key === "/" &&
        !hasModifier(event) &&
        !isTypingTarget(event.target)
      ) {
        event.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <CommandPaletteContext value={controls}>
      {children}
      <CommandPalette entries={entries} onOpenChange={setOpen} open={open} />
    </CommandPaletteContext>
  );
};
