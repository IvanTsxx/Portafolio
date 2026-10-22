import { cva } from "class-variance-authority";
import type { ReactNode } from "react";

import { focusRingClassName } from "@/components/site/styles";
import { cn } from "@/lib/utils";

import { DitherLogo } from "./dither-logo";
import { OpenFile } from "./file-desk";
import type { FiledFacts } from "./ledger";

export const TypeStamp = ({
  className,
  type,
}: {
  className?: string;
  type: string;
}) => (
  <span
    className={cn(
      "label border-ink text-ink outline-ink/40 inline-block -rotate-3 border-2 px-2 py-0.5 outline outline-offset-1",
      className
    )}
  >
    {type}
  </span>
);

const sheetEdgeVariants = cva(
  "bg-paper border-ink relative flex size-full flex-col overflow-hidden border text-left",
  {
    variants: {
      edge: {
        letter: "",
        sheet: "",
        ticket: "border-l-0",
      },
    },
  }
);

const SheetCreases = () => (
  <>
    <span
      aria-hidden
      className="border-rule pointer-events-none absolute inset-x-0 top-1/3 border-t border-dashed"
    />
    <span
      aria-hidden
      className="border-rule pointer-events-none absolute inset-x-0 top-2/3 border-t border-dashed"
    />
  </>
);

const TornEdge = () => (
  <span
    aria-hidden
    className="border-ink pointer-events-none absolute inset-y-0 left-0 border-l-2 border-dashed"
  />
);

const sheetActionClassName = cn(
  "label ease-mechanical flex min-h-11 cursor-pointer items-center px-4 transition-colors duration-100 sm:px-6",
  "text-graphite pointer-fine:hover:bg-ink pointer-fine:hover:text-paper",
  focusRingClassName
);

const SheetField = ({ label, value }: { label: string; value: string }) => (
  <span className="bg-paper flex flex-col gap-1 px-4 py-2 sm:px-6">
    <span className="label text-mist">{label}</span>
    <span className="text-ink text-sm tabular-nums">{value}</span>
  </span>
);

export const FiledSheet = ({
  edge,
  entry,
  onReturn,
  returnLabel,
}: {
  edge: "letter" | "sheet" | "ticket";
  entry: FiledFacts;
  onReturn: () => void;
  returnLabel: string;
}) => (
  <article
    aria-label={`${entry.company}, ${entry.role}`}
    className={sheetEdgeVariants({ edge })}
  >
    {edge === "letter" ? <SheetCreases /> : null}
    {edge === "ticket" ? <TornEdge /> : null}
    <span className="label text-mist flex items-start justify-between gap-4 px-4 pt-4 tabular-nums sm:px-6">
      <span>{entry.file.code}</span>
      <span className="flex flex-col items-end gap-2">
        <TypeStamp type={entry.type} />
        {entry.isCurrent ? <TypeStamp type="Current" /> : null}
      </span>
    </span>
    <span className="flex flex-1 items-center gap-4 px-4 py-3 sm:gap-6 sm:px-6">
      <DitherLogo className="size-14 shrink-0 sm:size-20" src={entry.logo} />
      <span className="flex min-w-0 flex-col gap-2">
        <span className="text-ink font-mono text-3xl leading-none tracking-tight text-balance sm:text-4xl">
          {entry.company}
        </span>
        <span className="label text-graphite">{entry.role}</span>
      </span>
    </span>
    <span className="border-rule bg-rule grid grid-cols-3 gap-px border-t">
      <span className="col-span-2 grid">
        <SheetField label="Dates" value={entry.dates} />
      </span>
      <SheetField label="Length" value={entry.length} />
    </span>
    <span className="border-rule flex justify-between border-t">
      <button className={sheetActionClassName} onClick={onReturn} type="button">
        {returnLabel}
      </button>
      <OpenFile className={sheetActionClassName} file={entry.file}>
        Open file ↗
      </OpenFile>
    </span>
  </article>
);

export const sheetRoomClassName = "relative grid h-72 overflow-hidden sm:h-64";

export const RoomPlaceholder = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <span
    aria-hidden
    className={cn(
      "border-rule-strong label text-mist col-start-1 row-start-1 flex items-center justify-center border border-dashed",
      className
    )}
  >
    {children}
  </span>
);
