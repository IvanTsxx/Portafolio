"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/shared/lib/utils";

import { NAV_LINKS } from "./constants";

export const DesktopNavbar = () => {
  const pathname = usePathname();

  return (
    <nav
      className="hidden lg:flex items-center gap-x-3"
      aria-label="Main navigation"
    >
      {NAV_LINKS.map(({ href, label }, index) => {
        const isActive =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            key={href}
          >
            <Link
              prefetch={false}
              href={href}
              className={cn(
                "text-xs transition-colors duration-150",
                isActive
                  ? "text-brand-green"
                  : "text-muted-foreground hover:text-brand-green"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {label}
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
};
