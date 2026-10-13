import { GithubLogoIcon, StarIcon } from "@phosphor-icons/react/ssr";

import { technicalButtonVariants } from "@/components/site/styles";
import { siteConfig } from "@/lib/site/config";
import { formatStarCount, repoUrl } from "@/lib/site/github-repo";
import { cn } from "@/lib/utils";

export const GithubStars = ({
  className,
  count,
}: {
  className?: string;
  count: number | null;
}) => (
  <a
    aria-label={
      count === null
        ? `Star ${siteConfig.repository} on GitHub`
        : `Star ${siteConfig.repository} on GitHub, ${count} ${count === 1 ? "star" : "stars"}`
    }
    className={cn(
      technicalButtonVariants({ size: "sm" }),
      "group/stars gap-0 px-0",
      className
    )}
    href={repoUrl}
    rel="noopener noreferrer"
    target="_blank"
  >
    <span className="flex items-center gap-1.5 px-2.5">
      <GithubLogoIcon aria-hidden className="size-4" />
      <StarIcon
        aria-hidden
        className="ease-mechanical size-3.5 transition-transform duration-200 group-hover/stars:rotate-[72deg]"
      />
      <span className="max-sm:hidden">Star</span>
    </span>
    {count === null ? null : (
      <span className="border-graphite/60 group-hover/stars:border-paper/40 flex h-full items-center border-l px-2.5 tabular-nums">
        {formatStarCount(count)}
      </span>
    )}
  </a>
);
