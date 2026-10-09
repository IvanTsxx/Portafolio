"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { primaryRoutes } from "@/lib/site/config";
import { cn } from "@/lib/utils";

const isActiveRoute = (pathname: string, href: string) =>
  href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);

export const NavLinks = ({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) => {
  const pathname = usePathname();
  return (
    <ul className={cn("flex items-center gap-1", className)}>
      {primaryRoutes.map((route) => {
        const active = isActiveRoute(pathname, route.href);
        return (
          <li key={route.href}>
            <Link
              aria-current={active ? "page" : undefined}
              className="group label text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground flex items-center gap-2 px-3 py-1.5 transition-colors"
              href={route.href}
              onClick={onNavigate}
            >
              <span className="text-faint group-hover:text-clay group-aria-[current=page]:text-clay transition-colors">
                {route.index}
              </span>
              {route.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
