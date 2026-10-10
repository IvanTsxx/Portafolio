"use client";

import { cva } from "class-variance-authority";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { primaryRoutes } from "@/lib/site/config";
import type { PrimaryRoute } from "@/lib/site/config";
import { cn } from "@/lib/utils";

const routeAnnotations = {
  "/": "ホーム",
  "/blog": "野帳",
  "/lab": "実験",
  "/registry": "登録簿",
  "/work": "作品",
} as const satisfies Record<PrimaryRoute["href"], string>;

const isActiveRoute = (pathname: string, href: string) =>
  href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);

const navLinkVariants = cva(
  "text-graphite hover:text-ink aria-[current=page]:text-ink ease-mechanical focus-visible:ring-ink transition-colors duration-100 outline-none focus-visible:ring-2 focus-visible:ring-inset",
  {
    defaultVariants: { orientation: "horizontal" },
    variants: {
      orientation: {
        horizontal:
          "label after:ease-out-quint after:bg-ink relative flex h-12 items-center px-3 after:absolute after:inset-x-3 after:bottom-3 after:h-px after:origin-left after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100 aria-[current=page]:after:scale-x-100",
        vertical:
          "border-rule hover:bg-paper-deep/60 aria-[current=page]:bg-paper-deep/60 flex min-h-14 items-baseline gap-3 border-b px-4 py-4",
      },
    },
  }
);

export const NavLinks = ({
  className,
  onNavigate,
  orientation = "horizontal",
}: {
  className?: string;
  onNavigate?: () => void;
  orientation?: "horizontal" | "vertical";
}) => {
  const pathname = usePathname();
  const isVertical = orientation === "vertical";
  return (
    <ul
      className={cn(
        isVertical ? "flex flex-col" : "flex items-stretch gap-1",
        className
      )}
    >
      {primaryRoutes.map((route, routeIndex) => {
        const active = isActiveRoute(pathname, route.href);
        return (
          <li className="flex" key={route.href}>
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                navLinkVariants({ orientation }),
                isVertical && "w-full"
              )}
              href={route.href}
              onClick={onNavigate}
            >
              {isVertical ? (
                <>
                  <span className="label text-mist shrink-0 tabular-nums">
                    [ {String(routeIndex).padStart(2, "0")} ]
                  </span>
                  <span className="text-ink text-2xl font-light tracking-tight">
                    {route.label}
                  </span>
                  <span
                    aria-hidden
                    className="border-rule-strong mb-1.5 h-px min-w-4 flex-1 self-end border-b border-dotted"
                  />
                  <span className="jp label text-graphite shrink-0">
                    {routeAnnotations[route.href]}
                  </span>
                </>
              ) : (
                route.label
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
