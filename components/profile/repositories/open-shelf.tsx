import { cn } from "@/lib/utils";

import { OpenShelfStage } from "./open-shelf-stage";
import { starStep } from "./repositories";
import type { RepositorySpecimen } from "./repositories";
import {
  RepositoryDescription,
  RepositoryFacts,
  RepositoryHeading,
  RepositoryTopics,
} from "./repository-facts";
import { RepositoryLink } from "./repository-link";
import { swatchClassNames } from "./swatch";

const bookHeights = ["h-44", "h-52", "h-60", "h-68", "h-76"] as const;

const TitlePage = ({
  className,
  specimen,
}: {
  className?: string;
  specimen: RepositorySpecimen;
}) => (
  <span
    className={cn(
      "border-ink bg-paper flex flex-col gap-4 border border-l-4 p-5 text-left",
      className
    )}
  >
    <span className="label text-mist flex justify-between gap-4 tabular-nums">
      <span>Title page</span>
      <span>{specimen.visibility}</span>
    </span>
    <RepositoryHeading className="text-2xl" specimen={specimen} />
    <span className="bg-rule h-px" />
    <RepositoryDescription specimen={specimen} />
    <RepositoryTopics specimen={specimen} />
    <RepositoryFacts className="mt-auto" specimen={specimen} />
  </span>
);

const Book = ({
  height,
  specimen,
}: {
  height: (typeof bookHeights)[number];
  specimen: RepositorySpecimen;
}) => (
  <RepositoryLink
    className={cn("relative flex w-10 sm:w-14", height)}
    specimen={specimen}
  >
    <span
      className={cn(
        swatchClassNames[specimen.swatch],
        "ease-out-quart flex size-full origin-bottom flex-col items-center justify-between gap-2 border py-3 transition-[scale,translate] duration-300 motion-safe:group-data-active/book:-translate-y-2 motion-safe:group-data-active/book:scale-105"
      )}
    >
      <span className="label tabular-nums">★{specimen.stars}</span>
      <span className="flex min-h-0 w-full flex-1 justify-center border-y border-current/40 py-2">
        <span className="min-h-0 rotate-180 truncate font-mono text-xs [writing-mode:vertical-rl] sm:text-sm">
          {specimen.name}
        </span>
      </span>
      <span className="label">{specimen.languageCode}</span>
    </span>
    <TitlePage
      className="ease-out-quart pointer-events-none absolute bottom-0 left-full ml-2 hidden h-76 w-72 origin-left scale-x-0 opacity-0 transition-[scale,opacity] duration-300 group-data-active/book:pointer-events-auto group-data-active/book:scale-x-100 group-data-active/book:opacity-100 group-data-active/book:delay-75 motion-reduce:scale-x-100 lg:flex"
      specimen={specimen}
    />
  </RepositoryLink>
);

export const OpenShelf = ({
  specimens,
}: {
  specimens: readonly RepositorySpecimen[];
}) => {
  const most = Math.max(0, ...specimens.map((specimen) => specimen.stars));
  return (
    <OpenShelfStage
      books={specimens.map((specimen) => ({
        id: specimen.id,
        node: (
          <Book
            height={
              bookHeights[starStep(specimen.stars, most, bookHeights.length)] ??
              "h-44"
            }
            specimen={specimen}
          />
        ),
      }))}
      pages={specimens.map((specimen) => ({
        id: specimen.id,
        node: <TitlePage className="min-h-64 w-full" specimen={specimen} />,
      }))}
    />
  );
};
