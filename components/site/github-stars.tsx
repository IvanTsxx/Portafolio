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
        ? `${siteConfig.repository} on GitHub`
        : `${siteConfig.repository} on GitHub, ${count} ${count === 1 ? "star" : "stars"}`
    }
    className={cn(
      technicalButtonVariants({ size: "sm" }),
      "gap-1.5 px-2.5",
      className
    )}
    href={repoUrl}
    rel="noopener noreferrer"
    target="_blank"
  >
    <GithubLogoIcon aria-hidden className="size-4" />
    <StarIcon aria-hidden className="size-3.5" />
    {count === null ? null : (
      <span className="tabular-nums">{formatStarCount(count)}</span>
    )}
  </a>
);
