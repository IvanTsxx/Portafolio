"use client";

import { ListIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { NavLinks } from "@/components/site/nav-links";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig } from "@/lib/site/config";

export const MobileNav = () => {
  const [open, setOpen] = useState(false);
  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger
        render={
          <Button
            aria-label="Open menu"
            className="md:hidden"
            size="icon-sm"
            variant="ghost"
          />
        }
      >
        <ListIcon />
      </SheetTrigger>
      <SheetContent className="w-full max-w-xs" side="right">
        <SheetHeader>
          <SheetTitle className="label text-muted-foreground">
            Navigate
          </SheetTitle>
        </SheetHeader>
        <nav aria-label="Mobile" className="px-2">
          <NavLinks
            className="flex-col items-stretch gap-0 [&_a]:py-3 [&_a]:text-sm"
            onNavigate={() => setOpen(false)}
          />
        </nav>
        <a
          className="label border-rule-strong mx-4 mt-auto mb-6 border px-3 py-3 text-center"
          href={`mailto:${siteConfig.email}`}
        >
          {siteConfig.email}
        </a>
      </SheetContent>
    </Sheet>
  );
};
