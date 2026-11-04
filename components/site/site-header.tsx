import Link from "next/link";

import { CommandPaletteProvider } from "@/components/command/command-palette-provider";
import { CommandPaletteTrigger } from "@/components/command/command-palette-trigger";
import { Monogram } from "@/components/site/monogram";
import { MobileMenu, SiteNav } from "@/components/site/site-nav";
import { focusRingClassName } from "@/components/site/styles";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { buildSearchIndex } from "@/lib/search/build-index";
import { siteConfig } from "@/lib/site/config";
import { cn } from "@/lib/utils";

export const SiteHeader = async () => {
  const searchEntries = await buildSearchIndex();
  return (
    <CommandPaletteProvider entries={searchEntries}>
      <header className="bg-background/75 text-foreground sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-frame mx-auto grid h-14 grid-cols-2 items-center gap-4 px-5 md:grid-cols-3 md:px-8">
          <Link
            aria-label={`${siteConfig.nickname}, home`}
            className={cn(
              "group/home -mx-1 flex min-h-11 w-fit items-center gap-3 px-1",
              focusRingClassName
            )}
            href="/"
          >
            <Monogram className="ease-out-expo size-7 transition-transform duration-500 group-hover/home:-rotate-6" />
            <span className="spaced hidden sm:inline">Ivan</span>
          </Link>
          <SiteNav />
          <div className="flex items-center gap-1 justify-self-end">
            <CommandPaletteTrigger />
            <ThemeToggle />
            <MobileMenu />
          </div>
        </div>
        <div aria-hidden className="hairline-x max-w-frame mx-auto h-px" />
      </header>
    </CommandPaletteProvider>
  );
};
