import Link from "next/link";

import { MobileNav } from "@/components/site/mobile-nav";
import { NavLinks } from "@/components/site/nav-links";
import {
  focusRingClassName,
  technicalButtonVariants,
} from "@/components/site/styles";
import { siteConfig } from "@/lib/site/config";
import { cn } from "@/lib/utils";

export const SiteHeader = () => (
  <header className="border-rule bg-paper/85 text-ink sticky top-0 z-50 border-b backdrop-blur-md">
    <div className="mx-auto flex h-12 max-w-screen-2xl items-center justify-between gap-4 px-4 md:px-8">
      <Link
        className={cn(
          "group flex min-w-0 shrink-0 items-baseline gap-3",
          focusRingClassName
        )}
        href="/"
      >
        <span className="font-wordmark text-xl leading-none whitespace-nowrap italic">
          {siteConfig.name}
        </span>
        <span className="label text-mist group-hover:text-ink ease-mechanical hidden transition-colors duration-100 sm:inline">
          Archive of builds
        </span>
      </Link>
      <nav aria-label="Primary" className="hidden self-stretch lg:flex">
        <NavLinks />
      </nav>
      <div className="flex items-center gap-4">
        <Link
          className={cn(
            technicalButtonVariants({ size: "sm" }),
            "hidden lg:inline-flex"
          )}
          href="/#contact"
        >
          Contact
        </Link>
        <MobileNav />
      </div>
    </div>
  </header>
);
