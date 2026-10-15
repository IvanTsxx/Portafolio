import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { PullControls, PullLink } from "./pull-link";
import { PullRack } from "./pull-rack";
import { DISC_CELLS, discSheenOf } from "./record-disc";
import type { RepositorySpecimen } from "./repositories";
import { RepositoryTopics } from "./repository-facts";
import {
  swatchBandClassNames,
  swatchClassNames,
  swatchFillClassNames,
} from "./swatch";

const metalClassName = "bg-paper-deep hatch";

const DiskBody = ({
  className,
  path,
}: {
  className?: string;
  path: string;
}) => (
  <svg
    aria-hidden
    className="absolute inset-0 size-full"
    preserveAspectRatio="none"
    viewBox="0 0 100 100"
  >
    <path
      className={cn("stroke-ink", className)}
      d={path}
      strokeWidth={1}
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

const HELD_BODY = "M0 0H100V100H6L0 94Z";
const FACING_BODY = "M0 0H94L100 6V100H0Z";

const HeldDisk = ({ specimen }: { specimen: RepositorySpecimen }) => (
  <PullLink
    action="Eject the disk"
    className="relative block aspect-square w-full"
    specimen={specimen}
  >
    <span className="ease-out-quart absolute inset-0 transition-[translate,opacity] duration-300 group-data-active/item:-translate-y-3 group-data-open/item:-translate-y-8 group-data-open/item:opacity-25 motion-reduce:transition-opacity">
      <DiskBody
        className={swatchFillClassNames[specimen.swatch]}
        path={HELD_BODY}
      />
      <span className="border-ink bg-paper absolute inset-x-1/12 top-1/12 flex h-7/12 flex-col border">
        <span
          className={cn(
            swatchBandClassNames[specimen.swatch],
            "border-ink h-1.5 shrink-0 border-b"
          )}
        />
        <span className="flex min-h-0 flex-1 flex-col gap-0.5 px-2 py-1.5">
          <span className="label text-mist truncate normal-case">
            {specimen.owner}/
          </span>
          <span className="text-ink line-clamp-2 origin-left -rotate-1 font-mono text-xs leading-tight wrap-anywhere">
            {specimen.name}
          </span>
          <span className="label text-graphite mt-auto flex justify-between gap-2 tabular-nums">
            <span>★{specimen.stars}</span>
            <span>{specimen.languageCode}</span>
          </span>
        </span>
      </span>
      <span
        className={cn(
          metalClassName,
          "border-ink absolute bottom-0 left-1/4 h-1/4 w-1/2 border"
        )}
      />
    </span>
  </PullLink>
);

const Shutter = () => (
  <span className="ease-out-quart border-ink absolute top-0 left-1/4 flex h-2/5 w-1/2 border transition-transform duration-300 group-data-open/reveal:translate-x-1/3 group-data-open/reveal:delay-200 motion-reduce:transition-none">
    <span className="flex w-1/3 flex-col">
      <span className={cn(metalClassName, "h-1/8")} />
      <span className="border-ink flex-1 border-y" />
      <span className={cn(metalClassName, "h-1/8")} />
    </span>
    <span className={cn(metalClassName, "border-ink flex-1 border-l")} />
  </span>
);

const LabelFact = ({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) => (
  <span className="flex min-w-0 flex-col">
    <span className="label text-mist">{label}</span>
    <span className="label text-ink truncate normal-case tabular-nums">
      {children}
    </span>
  </span>
);

const FacingDisk = ({ specimen }: { specimen: RepositorySpecimen }) => (
  <span className="relative block size-full">
    <DiskBody
      className={swatchFillClassNames[specimen.swatch]}
      path={FACING_BODY}
    />
    <span className="bg-ink absolute top-1/20 left-5/12 h-3/10 w-1/6 overflow-clip">
      <svg
        aria-hidden
        className="size-full [shape-rendering:crispEdges]"
        preserveAspectRatio="xMidYMid slice"
        viewBox={`20 0 24 ${DISC_CELLS}`}
      >
        <path
          className="fill-paper"
          d={discSheenOf(specimen.id)}
          opacity={0.45}
        />
      </svg>
    </span>
    <Shutter />
    <span className="border-ink bg-paper absolute inset-x-1/12 top-9/20 bottom-1/24 flex flex-col border">
      <span
        className={cn(
          swatchBandClassNames[specimen.swatch],
          "border-ink h-1.5 shrink-0 border-b"
        )}
      />
      <span className="flex min-h-0 flex-1 flex-col gap-1.5 px-3 py-2">
        <span className="flex min-w-0 flex-col">
          <span className="label text-mist truncate normal-case">
            {specimen.owner}/
          </span>
          <span className="border-rule text-ink origin-left -rotate-1 truncate border-b pb-0.5 font-mono text-lg leading-tight">
            {specimen.name}
          </span>
        </span>
        <span className="text-graphite line-clamp-2 text-xs text-pretty">
          {specimen.description ?? "No description."}
        </span>
        <span className="max-h-5 overflow-clip">
          <RepositoryTopics specimen={specimen} />
        </span>
        <span className="mt-auto grid grid-cols-4 gap-2">
          <LabelFact label="Lang">
            <span className="flex items-center gap-1">
              <span
                className={cn(
                  swatchClassNames[specimen.swatch],
                  "size-2 shrink-0 border"
                )}
              />
              <span className="truncate">{specimen.languageCode}</span>
            </span>
          </LabelFact>
          <LabelFact label="Stars">★{specimen.stars}</LabelFact>
          <LabelFact label="Forks">{specimen.forks}</LabelFact>
          <LabelFact label="Pushed">{specimen.pushed}</LabelFact>
        </span>
      </span>
    </span>
  </span>
);

const DriveBar = ({
  children,
  isLoaded,
}: {
  children: ReactNode;
  isLoaded: boolean;
}) => (
  <span className="border-ink bg-paper-deep flex h-12 items-center gap-3 border px-3">
    <span
      className={cn(
        "border-ink size-2 shrink-0 border",
        isLoaded ? "bg-ink" : "bg-paper"
      )}
    />
    <span className="label text-ink shrink-0">A:</span>
    <span className="bg-ink h-1 w-12 shrink-0" />
    <span className="label text-graphite min-w-0 truncate normal-case">
      {children}
    </span>
  </span>
);

const DriveLayout = ({
  controls,
  disk,
  drive,
}: {
  controls: ReactNode;
  disk: ReactNode;
  drive: ReactNode;
}) => (
  <div className="flex w-full flex-col gap-3">
    <div className="relative aspect-square w-full max-w-80">{disk}</div>
    {drive}
    <div className="flex min-h-8 items-center">{controls}</div>
  </div>
);

const EmptyDrive = () => (
  <DriveLayout
    controls={
      <span className="label text-mist ease-out-quart opacity-0 transition-opacity duration-200 group-data-empty/stage:opacity-100">
        Pick a disk · Esc puts it back
      </span>
    }
    disk={
      <span className="ease-out-quart absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-data-empty/stage:opacity-100">
        <DiskBody className="stroke-rule fill-none" path={FACING_BODY} />
        <span className="label text-mist">No disk</span>
      </span>
    }
    drive={<DriveBar isLoaded={false}>Empty</DriveBar>}
  />
);

const EjectedDisk = ({ specimen }: { specimen: RepositorySpecimen }) => (
  <DriveLayout
    controls={<PullControls putBack="Put back" specimen={specimen} />}
    disk={
      <span className="ease-out-quart absolute inset-0 origin-bottom translate-y-10 scale-95 rotate-6 opacity-0 transition-[translate,rotate,scale,opacity] duration-450 group-data-open/reveal:translate-y-0 group-data-open/reveal:scale-100 group-data-open/reveal:rotate-0 group-data-open/reveal:opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:rotate-0 motion-reduce:transition-opacity">
        <FacingDisk specimen={specimen} />
      </span>
    }
    drive={
      <DriveBar isLoaded>
        {specimen.owner}/{specimen.name}
      </DriveBar>
    }
  />
);

export const FloppyRack = ({
  specimens,
}: {
  specimens: readonly RepositorySpecimen[];
}) => (
  <PullRack
    classNames={{
      item: "relative px-1.5 pt-6",
      list: "grid min-w-0 grid-cols-2 gap-y-2 sm:grid-cols-3 lg:flex-1",
      reveal: "w-full max-lg:order-first lg:w-80 lg:shrink-0",
      root: "flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-10",
    }}
    items={specimens.map((specimen) => ({
      id: specimen.id,
      node: (
        <>
          <HeldDisk specimen={specimen} />
          <span
            aria-hidden
            className="border-ink bg-paper-deep pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/4 border-y"
          />
        </>
      ),
    }))}
    label="Pinned repositories as floppy disks in a desk holder. Arrow keys move, Enter ejects one."
    panels={specimens.map((specimen) => ({
      id: specimen.id,
      node: <EjectedDisk specimen={specimen} />,
    }))}
    revealLabel="Ejected disk"
    revealOn="open"
    under={<EmptyDrive />}
  />
);
