import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { PullCrateStage } from "./pull-crate-stage";
import { PullControls, PullLink } from "./pull-link";
import { SleeveFace } from "./record-crate";
import {
  DISC_CELLS,
  DISC_CENTER,
  LABEL_RADIUS,
  discGrooves,
  discSheenOf,
} from "./record-disc";
import type { RepositorySpecimen } from "./repositories";
import { RepositoryDescription, RepositoryTopics } from "./repository-facts";
import { swatchClassNames } from "./swatch";

const platterRings = [40, 32, 24] as const;

const DeckLayout = ({
  controls,
  sleeve,
  table,
}: {
  controls?: ReactNode;
  sleeve?: ReactNode;
  table: ReactNode;
}) => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:gap-0">
      <div className="relative size-64 shrink-0">{table}</div>
      <div className="relative z-10 size-64 shrink-0 sm:-ml-2">{sleeve}</div>
    </div>
    <div className="flex min-h-8 items-center">{controls}</div>
  </div>
);

const Turntable = () => (
  <DeckLayout
    controls={
      <span className="label text-mist ease-out-quart opacity-0 transition-opacity duration-200 group-data-empty/stage:opacity-100">
        Platter empty · click a record
      </span>
    }
    table={
      <span className="border-ink bg-paper-deep relative block size-full border">
        <svg
          aria-hidden
          className="absolute inset-0 size-full"
          viewBox="0 0 100 100"
        >
          <circle
            className="fill-paper stroke-ink"
            cx={50}
            cy={50}
            r={46}
            strokeWidth={0.4}
          />
          {platterRings.map((radius) => (
            <circle
              className="stroke-rule fill-none"
              cx={50}
              cy={50}
              key={radius}
              r={radius}
              strokeWidth={0.4}
            />
          ))}
          <circle className="fill-ink" cx={50} cy={50} r={1.2} />
        </svg>
        <span className="label text-mist absolute bottom-2 left-3">33⅓</span>
      </span>
    }
  />
);

const ToneArm = () => (
  <DeckLayout
    table={
      <>
        <span className="border-ink bg-paper absolute top-3 right-3 size-5 border" />
        <span className="ease-out-quart absolute top-5 right-5 h-44 w-0 origin-top rotate-12 transition-transform duration-450 group-data-empty/stage:rotate-0 motion-reduce:transition-none">
          <span className="bg-ink absolute inset-y-0 -left-px w-0.5" />
          <span className="bg-ink absolute -bottom-1 -left-1.5 h-4 w-3" />
        </span>
      </>
    }
  />
);

const Disc = ({ specimen }: { specimen: RepositorySpecimen }) => (
  <span className="ease-out-quart absolute inset-2.5 block -translate-y-4 scale-105 opacity-0 transition-[translate,scale,opacity] duration-450 group-data-open/reveal:translate-y-0 group-data-open/reveal:scale-100 group-data-open/reveal:opacity-100 group-data-open/reveal:delay-100 motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:transition-opacity">
    <span className="relative block size-full" data-spin={specimen.index}>
      <svg
        aria-hidden
        className="size-full"
        viewBox={`0 0 ${DISC_CELLS} ${DISC_CELLS}`}
      >
        <circle
          className="fill-ink"
          cx={DISC_CENTER}
          cy={DISC_CENTER}
          r={DISC_CENTER}
        />
        <path
          className="fill-paper [shape-rendering:crispEdges]"
          d={discSheenOf(specimen.id)}
          opacity={0.28}
        />
        <path
          className="stroke-paper fill-none"
          d={discGrooves}
          opacity={0.16}
          strokeWidth={0.12}
        />
        <circle
          className="fill-paper"
          cx={DISC_CENTER}
          cy={DISC_CENTER}
          r={LABEL_RADIUS}
        />
        <circle
          className="stroke-ink fill-none"
          cx={DISC_CENTER}
          cy={DISC_CENTER}
          r={LABEL_RADIUS - 1}
          strokeWidth={0.2}
        />
        <circle
          className="fill-paper-deep stroke-ink"
          cx={DISC_CENTER}
          cy={DISC_CENTER}
          r={0.8}
          strokeWidth={0.2}
        />
      </svg>
      <span className="absolute inset-1/3 flex flex-col items-center justify-center gap-1 text-center">
        <span className="label text-mist max-w-full truncate normal-case">
          {specimen.owner}/
        </span>
        <span className="label text-ink line-clamp-3 max-w-full wrap-anywhere normal-case">
          {specimen.name}
        </span>
        <span className="label text-graphite tabular-nums">
          {specimen.languageCode} · ★{specimen.stars}
        </span>
      </span>
    </span>
  </span>
);

const SleeveBack = ({ specimen }: { specimen: RepositorySpecimen }) => (
  <span className="border-ink bg-paper ease-out-quart flex size-full -translate-x-6 flex-col border opacity-0 transition-[translate,rotate,opacity] duration-300 group-data-open/reveal:translate-x-0 group-data-open/reveal:-rotate-1 group-data-open/reveal:opacity-100 motion-reduce:translate-x-0 motion-reduce:transition-opacity">
    <span
      className={cn(
        swatchClassNames[specimen.swatch],
        "label flex h-7 shrink-0 items-center gap-2 px-3 tabular-nums"
      )}
    >
      <span className="min-w-0 truncate">
        <span className="opacity-60">{specimen.owner}/</span>
        {specimen.name}
      </span>
      <span className="ml-auto shrink-0">★{specimen.stars}</span>
      <span className="shrink-0">{specimen.languageCode}</span>
    </span>
    <span className="flex min-h-0 flex-1 flex-col gap-3 p-4">
      <span className="label text-mist">Back of sleeve</span>
      <RepositoryDescription className="line-clamp-4" specimen={specimen} />
      <RepositoryTopics specimen={specimen} />
      <span className="label text-graphite border-rule mt-auto flex flex-wrap justify-between gap-x-4 gap-y-1 border-t pt-2 tabular-nums">
        <span>
          {specimen.forks} {specimen.forks === 1 ? "fork" : "forks"}
        </span>
        <span>Pushed {specimen.pushed}</span>
      </span>
    </span>
  </span>
);

const RecordOut = ({ specimen }: { specimen: RepositorySpecimen }) => (
  <DeckLayout
    controls={<PullControls putBack="Put back" specimen={specimen} />}
    sleeve={<SleeveBack specimen={specimen} />}
    table={<Disc specimen={specimen} />}
  />
);

export const PullCrate = ({
  specimens,
}: {
  specimens: readonly RepositorySpecimen[];
}) => (
  <PullCrateStage
    arm={<ToneArm />}
    band={
      <>
        <span className="label text-ink">Crate</span>
        <span className="label text-mist tabular-nums">
          {String(specimens.length).padStart(2, "0")} records
        </span>
      </>
    }
    deck={<Turntable />}
    panels={specimens.map((specimen) => ({
      id: specimen.id,
      node: <RecordOut specimen={specimen} />,
    }))}
    sleeves={specimens.map((specimen) => ({
      id: specimen.id,
      node: (
        <PullLink
          action="Pull the record out"
          className="border-ink bg-paper flex size-full flex-col border"
          specimen={specimen}
        >
          <SleeveFace specimen={specimen} />
        </PullLink>
      ),
    }))}
  />
);
