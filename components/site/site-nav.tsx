"use client";

import { Dialog } from "@base-ui/react/dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { focusRingClassName } from "@/components/site/styles";
import { primaryRoutes, secondaryRoutes, siteConfig } from "@/lib/site/config";
import { cn } from "@/lib/utils";

const isActiveRoute = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

export const SiteNav = () => {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="hidden justify-self-center md:block">
      <ul className="flex items-center gap-1">
        {primaryRoutes.map((route) => {
          const isActive = isActiveRoute(pathname, route.href);
          return (
            <li key={route.href}>
              <Link
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group/nav text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground relative flex min-h-11 items-center gap-1.5 px-3 text-sm transition-colors duration-200",
                  focusRingClassName
                )}
                href={route.href}
              >
                <span className="label text-faint group-aria-[current=page]/nav:text-signal tabular-nums transition-colors duration-200">
                  {route.index}
                </span>
                <span>{route.label}</span>
                <span
                  aria-hidden
                  className="bg-foreground group-aria-[current=page]/nav:bg-signal ease-out-expo absolute inset-x-3 bottom-2 h-px origin-left scale-x-0 transition-transform duration-500 group-hover/nav:scale-x-100 group-aria-[current=page]/nav:scale-x-100"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export const MobileMenu = () => {
  const pathname = usePathname();
  return (
    <Dialog.Root>
      <Dialog.Trigger
        className={cn(
          "label text-foreground flex min-h-11 items-center gap-2 px-2 md:hidden",
          focusRingClassName
        )}
      >
        Menu
        <span aria-hidden className="flex flex-col gap-1">
          <span className="bg-foreground block h-px w-4" />
          <span className="bg-foreground block h-px w-2.5 self-end" />
        </span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="bg-background/80 fixed inset-0 z-50 backdrop-blur-sm transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="bg-background ease-out-expo fixed inset-0 z-50 flex flex-col px-5 pt-3 pb-8 transition-[opacity,translate] duration-500 data-ending-style:-translate-y-4 data-ending-style:opacity-0 data-starting-style:-translate-y-4 data-starting-style:opacity-0">
          <div className="flex h-12 items-center justify-between">
            <Dialog.Title className="spaced text-foreground">
              {siteConfig.nickname}
            </Dialog.Title>
            <Dialog.Close
              className={cn(
                "label text-foreground flex min-h-11 items-center px-2",
                focusRingClassName
              )}
            >
              Close
            </Dialog.Close>
          </div>
          <nav aria-label="Mobile" className="mt-auto">
            <ul className="flex flex-col">
              {primaryRoutes.map((route) => (
                <li
                  className="border-border border-b first:border-t"
                  key={route.href}
                >
                  <Dialog.Close
                    nativeButton={false}
                    render={
                      <Link
                        aria-current={
                          isActiveRoute(pathname, route.href)
                            ? "page"
                            : undefined
                        }
                        className={cn(
                          "display text-foreground aria-[current=page]:text-muted-foreground flex items-baseline justify-between py-4 text-5xl",
                          focusRingClassName
                        )}
                        href={route.href}
                      />
                    }
                  >
                    <span>{route.label}</span>
                    <span className="label text-faint tabular-nums">
                      {route.index}
                    </span>
                  </Dialog.Close>
                </li>
              ))}
            </ul>
            <ul className="label text-muted-foreground mt-8 flex gap-6">
              {secondaryRoutes.map((route) => (
                <li key={route.href}>
                  <Dialog.Close
                    nativeButton={false}
                    render={
                      <Link
                        className={cn(
                          "flex min-h-11 items-center",
                          focusRingClassName
                        )}
                        href={route.href}
                      />
                    }
                  >
                    {route.label}
                  </Dialog.Close>
                </li>
              ))}
            </ul>
          </nav>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
