"use client";

import { cva } from "class-variance-authority";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { primaryRoutes } from "@/lib/site/config";

const isActiveRoute = (pathname: string, href: string) =>
  href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);

const tabVariants = cva(
  "group/tab label border-rule-strong/50 ease-mechanical focus-visible:ring-ink relative flex shrink-0 items-center gap-2 border-t border-r border-l whitespace-nowrap transition-[translate,clip-path,background-color,color] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-inset max-lg:-ml-px max-lg:h-11 max-lg:px-3 max-lg:first:ml-0 lg:-mt-px lg:w-9 lg:flex-col lg:gap-3 lg:border-r-0 lg:border-b lg:py-3 lg:first:mt-0",
  {
    variants: {
      state: {
        active:
          "bg-paper text-ink z-10 [clip-path:inset(0)] max-lg:translate-y-px lg:translate-x-px",
        idle: "bg-paper-deep text-graphite hover:text-ink focus-visible:text-ink max-lg:translate-y-1 max-lg:[clip-path:inset(0_0_4px_0)] max-lg:focus-visible:translate-y-0 max-lg:focus-visible:[clip-path:inset(0)] lg:translate-x-1.5 lg:[clip-path:inset(0_6px_0_0)] lg:hover:translate-x-0 lg:hover:[clip-path:inset(0)] lg:focus-visible:translate-x-0 lg:focus-visible:[clip-path:inset(0)] max-lg:pointer-fine:hover:translate-y-0 max-lg:pointer-fine:hover:[clip-path:inset(0)]",
      },
    },
  }
);

export const RouteTabs = () => {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="relative z-20 lg:absolute lg:top-0 lg:right-full lg:bottom-0"
    >
      <ol className="no-scrollbar -mb-px flex overflow-x-auto pb-px lg:sticky lg:top-24 lg:mb-0 lg:flex-col lg:overflow-visible lg:pb-0">
        {primaryRoutes.map((route) => {
          const isActive = isActiveRoute(pathname, route.href);
          return (
            <li className="flex" key={route.href}>
              <Link
                aria-current={isActive ? "page" : undefined}
                aria-label={`${route.index} ${route.label}`}
                className={tabVariants({ state: isActive ? "active" : "idle" })}
                href={route.href}
              >
                <span className="text-mist group-aria-[current=page]/tab:text-ink tabular-nums">
                  {route.index}
                </span>
                <span className="lg:[writing-mode:vertical-rl]">
                  {route.label}
                </span>
                <span
                  aria-hidden
                  className="jp text-mist/70 hidden [writing-mode:vertical-rl] lg:block"
                >
                  {route.jp}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
