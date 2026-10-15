import type { ReactNode } from "react";

import { focusRingClassName } from "@/components/site/styles";
import { cn } from "@/lib/utils";

import type { RepositorySpecimen } from "./repositories";

export const RepositoryLink = ({
  children,
  className,
  specimen,
}: {
  children: ReactNode;
  className?: string;
  specimen: RepositorySpecimen;
}) => (
  <a
    aria-haspopup="dialog"
    aria-label={`${specimen.spoken}. Open file.`}
    className={cn(focusRingClassName, className)}
    data-file={specimen.index}
    href={specimen.url}
  >
    {children}
  </a>
);
