import Link from "next/link";

import { CommandPaletteProvider } from "@/components/command/command-palette-provider";
import { CommandPaletteTrigger } from "@/components/command/command-palette-trigger";
import { GithubStars } from "@/components/site/github-stars";
import { focusRingClassName } from "@/components/site/styles";
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
      <header className="border-rule bg-paper/90 text-ink sticky top-0 z-50 border-b backdrop-blur-md">
        <div className="flex h-12 items-center justify-between gap-4 px-3 md:px-8 lg:px-12">
          <Link
            aria-label={`${siteConfig.nickname}, home`}
            className={cn(
              "font-wordmark -mx-1 inline-flex min-h-11 items-center px-1 text-xl leading-none italic",
              focusRingClassName
            )}
            href="/"
          >
            {siteConfig.nickname}
          </Link>
          <div className="flex items-center gap-2">
            <CommandPaletteTrigger />
            <GithubStars count={stars} />
          </div>
        </div>
      </header>
    </CommandPaletteProvider>
  );
};
