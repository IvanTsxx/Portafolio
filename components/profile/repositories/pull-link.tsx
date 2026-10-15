import type { ReactNode } from "react";

import {
  focusRingClassName,
  technicalButtonVariants,
} from "@/components/site/styles";
import { cn } from "@/lib/utils";

import type { RepositorySpecimen } from "./repositories";

export const PullLink = ({
  action,
  children,
  className,
  specimen,
}: {
  action: string;
  children: ReactNode;
  className?: string;
  specimen: RepositorySpecimen;
}) => (
  <a
    aria-expanded={false}
    aria-label={`${specimen.spoken}. ${action}.`}
    className={cn(focusRingClassName, className)}
    data-pick={specimen.index}
    href={specimen.url}
  >
    {children}
  </a>
);

export const PullControls = ({
  className,
  putBack,
  specimen,
}: {
  className?: string;
  putBack: string;
  specimen: RepositorySpecimen;
}) => (
  <span className={cn("flex flex-wrap items-center gap-2", className)}>
    <button
      className={technicalButtonVariants({ size: "sm", tone: "solid" })}
      data-put-back
      type="button"
    >
      {putBack}
    </button>
    <a
      aria-haspopup="dialog"
      className={technicalButtonVariants({ size: "sm" })}
      data-file={specimen.index}
      href={specimen.url}
    >
      Details
    </a>
    <a
      className={technicalButtonVariants({ size: "sm" })}
      href={specimen.url}
      rel="noopener"
      target="_blank"
    >
      GitHub ↗
    </a>
  </span>
);
