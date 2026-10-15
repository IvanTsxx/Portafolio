"use client";

import { useRef } from "react";
import type { KeyboardEvent } from "react";

import { focusRingClassName } from "@/components/site/styles";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

import { DitherLogo } from "./dither-logo";
import { OpenFile } from "./file-desk";
import type { LedgerEntry } from "./ledger";
import { sheetPose } from "./poses";
import { useDeck } from "./use-deck";

const RING_COUNT = 3;

const SheetField = ({ label, value }: { label: string; value: string }) => (
  <span className="bg-paper flex flex-col gap-1 px-4 py-3 sm:px-6">
    <span className="label text-mist">{label}</span>
    <span className="text-ink text-sm tabular-nums">{value}</span>
  </span>
);

const Sheet = ({ entry }: { entry: LedgerEntry }) => (
  <span className="flex h-full flex-col">
    <span className="label text-mist flex justify-between gap-4 px-4 pt-4 tabular-nums sm:px-6 sm:pt-5">
      <span>{entry.file.code}</span>
      <span>Divider {entry.ordinal}</span>
    </span>
    <span className="flex flex-1 items-center gap-4 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8">
      <DitherLogo className="size-16 shrink-0 sm:size-24" src={entry.logo} />
      <span className="flex min-w-0 flex-col gap-2">
        <span className="text-ink font-mono text-3xl leading-none tracking-tight text-balance sm:text-5xl">
          {entry.company}
        </span>
        <span className="label text-graphite">{entry.role}</span>
      </span>
    </span>
    <span className="border-rule bg-rule grid grid-cols-2 gap-px border-t sm:grid-cols-4">
      <span className="col-span-2 grid">
        <SheetField label="Dates" value={entry.dates} />
      </span>
      <SheetField label="Length" value={entry.length} />
      <SheetField label="Type" value={entry.type} />
    </span>
    <span className="label border-rule text-ink border-t px-4 py-3 text-right sm:px-6">
      Open sheet ↗
    </span>
  </span>
);

const BinderRings = () => (
  <span
    aria-hidden
    className="border-ink bg-paper-deep relative z-40 -mr-3 flex w-8 shrink-0 flex-col items-center justify-around border border-r-0 py-8 sm:w-10"
  >
    {Array.from({ length: RING_COUNT }, (_, ring) => (
      <svg className="text-ink h-5 w-9 sm:w-10" key={ring} viewBox="0 0 40 20">
        <ellipse
          cx="20"
          cy="10"
          fill="none"
          rx="17"
          ry="7"
          stroke="currentColor"
          strokeWidth="2.5"
        />
      </svg>
    ))}
  </span>
);

export const RingBinder = ({
  entries,
}: {
  entries: readonly LedgerEntry[];
}) => {
  const { active, itemProps } = useDeck(entries.length);
  const sheets = useRef<(HTMLButtonElement | null)[]>([]);
  const isReduced = useReducedMotion();

  const openOnEnter = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      sheets.current[active]?.click();
    }
  };

  return (
    <div className="flex flex-col gap-3" data-build-block>
      <div className="flex items-stretch">
        <BinderRings />
        <div className="grid min-w-0 flex-1 pb-6">
          {entries.map((entry, index) => {
            const depth = index - active;
            return (
              <div
                aria-hidden={depth !== 0}
                aria-labelledby={`binder-tab-${entry.id}`}
                className="ease-out-quart col-start-1 row-start-1 origin-left transition-[transform,opacity] duration-400 motion-reduce:transition-opacity motion-reduce:duration-200"
                id={`binder-sheet-${entry.id}`}
                inert={depth !== 0}
                key={entry.id}
                role="tabpanel"
                style={sheetPose(depth, isReduced)}
              >
                <OpenFile
                  className={cn(
                    "bg-paper border-ink block size-full cursor-pointer border pl-3 text-left transition-transform duration-150 active:scale-99",
                    focusRingClassName
                  )}
                  file={entry.file}
                  ref={(node) => {
                    sheets.current[index] = node;
                  }}
                  tabIndex={-1}
                >
                  <Sheet entry={entry} />
                </OpenFile>
              </div>
            );
          })}
        </div>
        <div
          aria-label="Employment dividers"
          aria-orientation="vertical"
          className="flex w-14 shrink-0 flex-col gap-1 pt-6 sm:w-44"
          role="tablist"
        >
          {entries.map((entry, index) => {
            const { ref, ...tab } = itemProps(index);
            return (
              <button
                {...tab}
                aria-controls={`binder-sheet-${entry.id}`}
                aria-selected={index === active}
                className={cn(
                  "label border-ink ease-out-quart -ml-px flex h-14 cursor-pointer flex-col justify-center gap-1 border px-2 text-left tabular-nums transition-[translate,background-color,color] duration-200 sm:px-3",
                  "bg-paper-deep text-graphite aria-selected:bg-ink aria-selected:text-paper motion-safe:aria-selected:translate-x-1.5 motion-safe:pointer-fine:hover:translate-x-1.5",
                  focusRingClassName
                )}
                id={`binder-tab-${entry.id}`}
                key={entry.id}
                onKeyDown={(event) => {
                  tab.onKeyDown(event);
                  openOnEnter(event);
                }}
                ref={ref}
                role="tab"
                type="button"
              >
                <span>{entry.ordinal}</span>
                <span className="truncate max-sm:hidden">{entry.company}</span>
                <span className="sm:hidden">{entry.year}</span>
              </button>
            );
          })}
        </div>
      </div>
      <p className="label text-mist flex justify-between gap-4">
        <span>
          {entries.length} dividers · {entries.at(-1)?.year} → now
        </span>
        <span>Pick a divider · Enter opens</span>
      </p>
    </div>
  );
};
