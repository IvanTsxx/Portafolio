import { cn } from "@/lib/utils";

import type { RepositorySpecimen } from "./repositories";

const Fact = ({ label, value }: { label: string; value: string }) => (
  <span className="flex min-w-0 flex-col gap-1">
    <span className="label text-mist">{label}</span>
    <span className="text-ink truncate text-sm tabular-nums">{value}</span>
  </span>
);

export const RepositoryFacts = ({
  className,
  specimen,
}: {
  className?: string;
  specimen: RepositorySpecimen;
}) => (
  <span className={cn("grid grid-cols-2 gap-x-4 gap-y-3", className)}>
    <Fact label="Language" value={specimen.language} />
    <Fact label="Stars" value={`★ ${specimen.stars}`} />
    <Fact label="Forks" value={String(specimen.forks)} />
    <Fact label="Pushed" value={specimen.pushed} />
  </span>
);

export const RepositoryTopics = ({
  specimen,
}: {
  specimen: RepositorySpecimen;
}) =>
  specimen.topics.length > 0 ? (
    <span className="flex flex-wrap gap-1">
      {specimen.topics.map((topic) => (
        <span
          className="label border-rule-strong text-graphite border px-1.5 py-0.5"
          key={topic}
        >
          {topic}
        </span>
      ))}
      {specimen.topicsLeft > 0 ? (
        <span className="label text-mist px-1 py-0.5 tabular-nums">
          +{specimen.topicsLeft}
        </span>
      ) : null}
    </span>
  ) : null;

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
