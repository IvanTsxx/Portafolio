import type { ReactNode } from "react";

import { DustPortraitView } from "@/components/lab/experiments/dust-portrait/portrait-view";
import { siteConfig } from "@/lib/site/config";
import { experience } from "@/lib/site/experience";
import { cn } from "@/lib/utils";

const current = experience.find((entry) => entry.end === null);

export const PortraitPlate = ({
  aside,
  className,
}: {
  aside?: ReactNode;
  className?: string;
}) => (
  <figure className={cn("flex flex-col gap-2", className)}>
    <span className="bg-surface relative block aspect-4/5 w-full cursor-crosshair overflow-hidden rounded-sm">
      <DustPortraitView
        alt="Illustrated portrait of Ivan at a laptop, in grayscale"
        priority
        sizes="(min-width: 1024px) 20vw, 40vw"
      />
    </span>
    <figcaption className="label text-faint flex min-h-10 items-center justify-between gap-4">
      {aside ?? <span>Pl. 01</span>}
      <span>Hover · click</span>
    </figcaption>
  </figure>
);

export const Statement = ({ className }: { className?: string }) => (
  <div className={cn("flex flex-col gap-6", className)}>
    <p className="display text-title text-foreground rise-in">
      {siteConfig.statement.lead}{" "}
      <em className="text-signal">{siteConfig.statement.accent}</em>
      {siteConfig.statement.closing}
    </p>
    <p className="label text-faint rise-in wait-150 flex flex-wrap gap-x-4 gap-y-1">
      <span className="text-muted-foreground">{siteConfig.role}</span>
      {current ? (
        <span>
          Now <span className="text-foreground">{current.company}</span>
        </span>
      ) : null}
      <span>{siteConfig.location}</span>
    </p>
  </div>
);
