import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { PullControls, PullLink } from "./pull-link";
import { PullRack } from "./pull-rack";
import { openingPickOf } from "./repositories";
import type { RepositorySpecimen } from "./repositories";
import { RepositoryDescription, RepositoryHeading } from "./repository-facts";
import { COVER_CELLS, sleeveCoverOf } from "./sleeve-cover";
import { swatchClassNames } from "./swatch";

const SleeveCover = ({ specimen }: { specimen: RepositorySpecimen }) => (
  <svg
    aria-hidden
    className="text-ink size-full [shape-rendering:crispEdges]"
    preserveAspectRatio="xMidYMid slice"
    viewBox={`0 0 ${COVER_CELLS} ${COVER_CELLS}`}
  >
    <path
      d={sleeveCoverOf(specimen.id, specimen.language)}
      fill="currentColor"
    />
  </svg>
);

const SpineLine = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <span className={cn("font-mono text-sm leading-6", className)}>
    {children}
  </span>
);

const CassetteSpine = ({ specimen }: { specimen: RepositorySpecimen }) => (
  <>
    <span
      className={cn(
        swatchClassNames[specimen.swatch],
        "flex w-11 shrink-0 items-center justify-center border-r"
      )}
    >
      <SpineLine>
        <span className="label">{specimen.languageCode}</span>
      </SpineLine>
    </span>
    <span className="flex min-w-0 flex-1 items-center px-3">
      <SpineLine className="text-ink min-w-0 truncate">
        <span className="label text-mist pr-1 normal-case max-sm:hidden">
          {specimen.owner}/
        </span>
        {specimen.name}
      </SpineLine>
    </span>
    <span className="border-rule flex shrink-0 items-center border-l px-3">
      <SpineLine>
        <span className="label text-ink tabular-nums">★{specimen.stars}</span>
      </SpineLine>
    </span>
  </>
);

const Track = ({ code, children }: { children: ReactNode; code: string }) => (
  <li className="flex min-w-0 gap-3">
    <span className="label text-mist w-5 shrink-0 tabular-nums">{code}</span>
    <span className="label text-ink truncate normal-case">{children}</span>
  </li>
);

const tracksOf = (specimen: RepositorySpecimen) =>
  specimen.topics.length > 0 ? specimen.topics : [specimen.language];

const JCard = ({ specimen }: { specimen: RepositorySpecimen }) => (
  <div className="flex flex-col perspective-distant">
    <span className="border-ink bg-paper flex h-12 border">
      <CassetteSpine specimen={specimen} />
    </span>
    <span className="border-ink bg-paper flex h-44 border-x border-b">
      <span className="border-ink bg-paper-deep relative aspect-square h-full shrink-0 border-r">
        <SleeveCover specimen={specimen} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        <RepositoryHeading className="text-2xl" specimen={specimen} />
        <span className="label text-graphite mt-auto flex flex-wrap gap-x-3 gap-y-1 tabular-nums">
          <span>{specimen.language}</span>
          <span>★ {specimen.stars}</span>
        </span>
      </span>
    </span>
    <span className="relative flex">
      <span className="label text-mist ease-out-quart absolute top-3 left-0 transition-opacity duration-200 group-data-open/reveal:opacity-0">
        Click or Enter unfolds the card
      </span>
      <span className="border-ink bg-paper ease-out-quart flex w-full origin-top -rotate-x-90 flex-col gap-4 border-x border-b p-4 opacity-0 transition-[transform,opacity] duration-450 group-data-open/reveal:rotate-x-0 group-data-open/reveal:opacity-100 motion-reduce:rotate-x-0 motion-reduce:transition-opacity">
        <span className="grid gap-4 sm:grid-cols-2">
          <span className="flex min-w-0 flex-col gap-2">
            <span className="label text-mist">Side A · Notes</span>
            <RepositoryDescription
              className="line-clamp-2"
              specimen={specimen}
            />
            <ol className="flex flex-col gap-1">
              {tracksOf(specimen).map((topic, index) => (
                <Track code={`A${index + 1}`} key={topic}>
                  {topic}
                </Track>
              ))}
              {specimen.topicsLeft > 0 ? (
                <Track code="··">+{specimen.topicsLeft} more</Track>
              ) : null}
            </ol>
          </span>
          <span className="flex min-w-0 flex-col gap-2">
            <span className="label text-mist">Side B · Facts</span>
            <ol className="flex flex-col gap-1">
              <Track code="B1">
                {specimen.forks} {specimen.forks === 1 ? "fork" : "forks"}
              </Track>
              <Track code="B2">Pushed {specimen.pushed}</Track>
              <Track code="B3">{specimen.visibility}</Track>
            </ol>
          </span>
        </span>
        <PullControls putBack="Fold" specimen={specimen} />
      </span>
    </span>
  </div>
);

export const CassetteTower = ({
  specimens,
}: {
  specimens: readonly RepositorySpecimen[];
}) => {
  const opening = openingPickOf(specimens);
  return (
    <PullRack
      classNames={{
        item: "ease-out-quart transition-transform duration-300 data-nudged:translate-x-1 data-peeking:translate-x-3 data-open:translate-x-6 motion-reduce:transition-none",
        list: "border-ink mr-6 flex flex-col gap-1 border-x-4 border-b-4 p-1 lg:w-88 lg:shrink-0",
        reveal: "min-w-0 lg:flex-1",
        root: "flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8",
      }}
      initialOpen={opening}
      items={specimens.map((specimen) => ({
        id: specimen.id,
        node: (
          <PullLink
            action="Unfold the J-card"
            className="border-ink bg-paper flex h-12 w-full border"
            isOpen={specimen.index === opening}
            specimen={specimen}
          >
            <CassetteSpine specimen={specimen} />
          </PullLink>
        ),
      }))}
      label="Repositories as cassettes in a tower. Arrow keys move, Enter unfolds the J-card."
      panels={specimens.map((specimen) => ({
        id: specimen.id,
        node: <JCard specimen={specimen} />,
      }))}
      revealLabel="Cassette J-card"
    />
  );
};
