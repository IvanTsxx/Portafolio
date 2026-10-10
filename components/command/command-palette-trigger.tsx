"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useSyncExternalStore } from "react";

import { useCommandPalette } from "@/components/command/command-palette-provider";
import { technicalButtonVariants } from "@/components/site/styles";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

const subscribeToLanguageChange = (notify: () => void) => {
  window.addEventListener("languagechange", notify);
  return () => window.removeEventListener("languagechange", notify);
};

const readModifierKey = () =>
  /Mac|iPhone|iPad|iPod/u.test(navigator.userAgent) ? "⌘" : "Ctrl";

const readServerModifierKey = () => "⌘";

export const CommandPaletteTrigger = ({
  className,
}: {
  className?: string;
}) => {
  const { openPalette } = useCommandPalette();
  const modifierKey = useSyncExternalStore(
    subscribeToLanguageChange,
    readModifierKey,
    readServerModifierKey
  );
  return (
    <button
      aria-haspopup="dialog"
      aria-keyshortcuts="Meta+K Control+K"
      aria-label="Search the site"
      className={cn(
        technicalButtonVariants({ size: "sm" }),
        "group/search max-md:w-8 max-md:px-0 max-md:before:-inset-x-1.5",
        className
      )}
      onClick={openPalette}
      type="button"
    >
      <MagnifyingGlassIcon aria-hidden className="size-4" />
      <span className="hidden md:max-lg:inline xl:inline">Search</span>
      <Kbd className="label bg-paper-deep text-graphite group-hover/search:bg-paper/15 group-hover/search:text-paper ease-mechanical hidden h-5 px-1.5 normal-case transition-colors duration-100 md:pointer-fine:inline-flex">
        {modifierKey}K
      </Kbd>
    </button>
  );
};
