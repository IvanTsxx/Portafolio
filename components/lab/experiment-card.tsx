import Link from "next/link";

import { ReactionTally } from "@/components/reactions/reaction-tally";
import { focusRingClassName } from "@/components/site/styles";
import type { Experiment } from "@/lib/lab/experiments";
import { experimentPath } from "@/lib/site/seo";
import { cn } from "@/lib/utils";

export const ExperimentCard = ({ experiment }: { experiment: Experiment }) => {
  const { Poster } = experiment;
  const isInstallable = Boolean(experiment.registryItem);
  return (
    <Link
      className={cn(
        "group/card relative flex h-full flex-col gap-5",
        focusRingClassName
      )}
      href={experimentPath(experiment.slug)}
    >
      <div className="bg-surface relative aspect-4/3 overflow-hidden">
        <div className="ease-out-expo size-full transition-transform duration-700 pointer-fine:group-hover/card:scale-103">
          <Poster />
        </div>
        <span className="label bg-background/80 text-foreground absolute top-3 left-3 px-2 py-1 tabular-nums backdrop-blur-sm">
          {experiment.index}
        </span>
        {isInstallable ? (
          <span className="label bg-signal text-background absolute top-3 right-3 px-2 py-1">
            Installable
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="display text-foreground text-xl">
            <span className="ink-underline">{experiment.title}</span>
          </h3>
          <span className="label text-faint shrink-0 tabular-nums">
            {experiment.year}
          </span>
        </div>
        <p className="text-muted-foreground max-w-prose text-sm text-pretty">
          {experiment.summary}
        </p>
        <div className="flex items-center justify-between gap-4">
          <p className="label text-faint">{experiment.topics.join(" · ")}</p>
          <ReactionTally slug={experiment.slug} />
        </div>
      </div>
    </Link>
  );
};
