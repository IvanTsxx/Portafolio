import Link from "next/link";

import { MobileNav } from "@/components/site/mobile-nav";
import { NavLinks } from "@/components/site/nav-links";
import { siteConfig } from "@/lib/site/config";

export const SiteHeader = () => (
  <header className="border-rule bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md">
    <div className="mx-auto flex h-12 max-w-screen-2xl items-center gap-6 px-4 md:px-6">
      <Link className="group flex items-center gap-3" href="/">
        <span
          aria-hidden
          className="bg-clay ease-out-quart size-3 rounded-sm transition-transform duration-300 group-hover:rotate-90"
        />
        <span className="label text-foreground">
          {siteConfig.shortName}
          <span className="text-faint">/workshop</span>
        </span>
      </Link>
      <nav
        aria-label="Primary"
        className="hidden flex-1 justify-center md:flex"
      >
        <NavLinks />
      </nav>
      <div className="ml-auto flex items-center gap-4 md:ml-0">
        <Link
          className="label border-rule-strong text-foreground hover:border-clay hover:text-clay hidden border px-3 py-1.5 transition-colors md:inline-flex"
          href="/#contact"
        >
          Contact
        </Link>
        <MobileNav />
      </div>
    </div>
  </header>
);
