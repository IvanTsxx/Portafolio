"use client";

import { ListIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { NavLinks } from "@/components/site/nav-links";
import { PanelHeading } from "@/components/site/panel-heading";
import { technicalButtonVariants } from "@/components/site/styles";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig } from "@/lib/site/config";
import { cn } from "@/lib/utils";

export const MobileNav = () => {
  const [open, setOpen] = useState(false);
  return (
    <Sheet onOpenChange={setOpen} open={open}>
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
        <nav aria-label="Mobile">
          <NavLinks onNavigate={() => setOpen(false)} orientation="vertical" />
        </nav>
        <div className="mt-auto flex flex-col gap-4 p-4">
          <span aria-hidden className="hazard-stripe text-ink block h-1.5" />
          <a
            className={cn(technicalButtonVariants(), "normal-case")}
            href={`mailto:${siteConfig.email}`}
          >
            {siteConfig.email}
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
};
