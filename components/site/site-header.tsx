import Link from "next/link";

import { CommandPaletteProvider } from "@/components/command/command-palette-provider";
import { CommandPaletteTrigger } from "@/components/command/command-palette-trigger";
import { GithubStars } from "@/components/site/github-stars";
import { MobileNav } from "@/components/site/mobile-nav";
import { NavLinks } from "@/components/site/nav-links";
import {
  focusRingClassName,
  technicalButtonVariants,
} from "@/components/site/styles";
import { buildSearchIndex } from "@/lib/search/build-index";
import { siteConfig } from "@/lib/site/config";
import { getRepoStars } from "@/lib/site/github-repo";
import { cn } from "@/lib/utils";

export const SiteHeader = async () => {
  const [searchEntries, stars] = await Promise.all([
    buildSearchIndex(),
    getRepoStars(),
  ]);
  return (
    <CommandPaletteProvider entries={searchEntries}>
      <header className="border-rule bg-paper/85 text-ink sticky top-0 z-50 border-b backdrop-blur-md">
        <div className="mx-auto grid h-12 max-w-screen-2xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 md:px-8">
          <Link
            className={cn(
              "col-start-1 min-w-0 justify-self-start",
              focusRingClassName
            )}
            href="/"
          >
            <span className="font-wordmark text-xl leading-none whitespace-nowrap italic">
              {siteConfig.nickname}
            </span>
          </Link>
          <nav
            aria-label="Primary"
            className="col-start-2 hidden self-stretch lg:flex"
          >
            <NavLinks />
          </nav>
          <div className="col-start-3 flex items-center gap-3 justify-self-end">
            <CommandPaletteTrigger />
            <GithubStars count={stars} />
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
    </CommandPaletteProvider>
  );
};
