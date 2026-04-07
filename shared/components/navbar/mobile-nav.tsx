"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { haptic } from "@/shared/lib/haptic";

import { NAV_LINKS } from "./constants";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  const isDesktop = useMediaQuery("(min-width: 40rem)");

  const pathname = usePathname();

  const handleOpenChange = useCallback((openCallback: boolean) => {
    haptic();
    setOpen(openCallback);
  }, []);

  if (isDesktop) {
    return <MobileNavTrigger />;
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange} modal>
      <PopoverTrigger render={<MobileNavTrigger />} />

      <PopoverContent
        className="w-48 rounded-xl p-1"
        side="top"
        align="center"
        sideOffset={8}
      >
        <div className="flex flex-col">
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href ||
              (link.href === "/"
                ? ["/", "/index"].includes(pathname || "")
                : pathname?.startsWith(link.href));

            return (
              <Link
                prefetch={false}
                key={link.href}
                href={link.href as Route}
                data-active={active}
                className="rounded-lg px-3 py-1.5 text-base data-active:bg-accent"
                onClick={() => handleOpenChange(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MobileNavTrigger(
  props: Omit<React.ComponentProps<typeof Button>, "children">
) {
  return (
    <Button
      className="group lg:hidden extend-touch-target flex flex-col gap-1 border-none data-open:bg-accent"
      variant="ghost"
      size="icon-sm"
      aria-label="Toggle Menu"
      {...props}
    >
      <span className="flex h-0.5 w-4 transform rounded-[1px] bg-foreground transition-transform group-data-[state=open]:translate-y-0.75 group-data-[state=open]:rotate-45" />
      <span className="flex h-0.5 w-4 transform rounded-[1px] bg-foreground transition-transform group-data-[state=open]:-translate-y-0.75 group-data-[state=open]:-rotate-45" />
    </Button>
  );
}
