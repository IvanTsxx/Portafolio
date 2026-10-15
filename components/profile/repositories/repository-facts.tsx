import { cn } from "@/lib/utils";

import type { RepositorySpecimen } from "./repositories";

export const RepositoryHeading = ({
  className,
  specimen,
}: {
  className?: string;
  specimen: RepositorySpecimen;
}) => (
  <span className="flex min-w-0 flex-col gap-1">
    <span className="label text-mist truncate">{specimen.owner} /</span>
    <span className={cn("display text-ink wrap-break-word", className)}>
      {specimen.name}
    </span>
  </span>
);

export const RepositoryDescription = ({
  className,
  specimen,
}: {
  className?: string;
  specimen: RepositorySpecimen;
}) => (
  <span
    className={cn("text-graphite line-clamp-3 text-sm text-pretty", className)}
  >
    {specimen.description ?? "No description."}
  </span>
);
