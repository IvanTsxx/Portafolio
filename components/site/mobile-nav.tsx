"use client";

import { ListIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useRef, useState } from "react";

import { useCommandPalette } from "@/components/command/command-palette-provider";
import { NavLinks } from "@/components/site/nav-links";
import { PanelHeading } from "@/components/site/panel-heading";
import { SocialLinks } from "@/components/site/social-links";
import {
  focusRingClassName,
  technicalButtonVariants,
} from "@/components/site/styles";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const { openPalette } = useCommandPalette();
  const searchRequested = useRef(false);

  const handleSearchClick = () => {
    searchRequested.current = true;
    setOpen(false);
  };

  const handleOpenChangeComplete = (isOpen: boolean) => {
    if (!isOpen && searchRequested.current) {
      searchRequested.current = false;
      openPalette();
    }
  };

  return (
    <Sheet
      onOpenChange={setOpen}
      onOpenChangeComplete={handleOpenChangeComplete}
      open={open}
    >
      <SheetTrigger
        aria-label="Open menu"
        className={cn(technicalButtonVariants({ size: "sm" }), "lg:hidden")}
      >
        <ListIcon aria-hidden className="size-4" />
        Menu
      </SheetTrigger>
      <SheetContent
        className="w-full sm:max-w-sm"
        showCloseButton={false}
        side="right"
      >
        <SheetHeader className="gap-4 p-4">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex items-center justify-between gap-4">
            <PanelHeading
              as="p"
              className="flex-1"
              index="NAV"
              jp="案内"
              label="Navigate"
            />
            <SheetClose
              className={technicalButtonVariants({ size: "sm" })}
              type="button"
            >
              Close
            </SheetClose>
          </div>
        </SheetHeader>
        <div className="px-4 pb-4">
          <button
            className={cn(
              "border-rule-strong ease-mechanical hover:bg-paper-deep/60 flex min-h-12 w-full items-center gap-3 border px-3 text-left transition-colors duration-100",
              focusRingClassName
            )}
            onClick={handleSearchClick}
            type="button"
          >
            <MagnifyingGlassIcon aria-hidden className="text-graphite size-4" />
            <span className="text-graphite text-base">Search the site</span>
            <span className="jp label text-mist ml-auto">検索</span>
          </button>
        </div>
        <nav aria-label="Mobile">
          <NavLinks onNavigate={() => setOpen(false)} orientation="vertical" />
        </nav>
        <div className="mt-auto flex flex-col gap-4 p-4">
          <span aria-hidden className="hazard-stripe text-ink block h-1.5" />
          <SocialLinks variant="inline" />
        </div>
      </SheetContent>
    </Sheet>
  );
};
