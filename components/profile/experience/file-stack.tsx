"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import { CornerMarks } from "@/components/site/corner-marks";
import { focusRingClassName } from "@/components/site/styles";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

import { cardPose, stepKeys, useScrollIndex } from "./card-stack-motion";
import { OpenFile } from "./file-desk";
import type { LedgerEntry } from "./ledger";

const DateStamp = ({ dates }: { dates: string }) => (
  <span className="label border-ink text-ink outline-ink/40 inline-block -rotate-3 border-2 px-2 py-1 tabular-nums outline outline-offset-1">
    {dates}
  </span>
);

const FileCard = ({ entry }: { entry: LedgerEntry }) => (
  <span className="relative flex h-full flex-col">
    <CornerMarks />
    <span className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
      <span className="label text-mist tabular-nums">{entry.file.code}</span>
      <DateStamp dates={entry.dates} />
    </span>
    <span className="flex flex-1 flex-col gap-2 px-5 pt-6 pb-6 sm:px-6 sm:pt-10">
      <span className="text-ink font-mono text-4xl leading-none tracking-tight text-balance sm:text-5xl">
        {entry.company}
      </span>
      <span className="label text-graphite">{entry.role}</span>
    </span>
    <span className="label border-rule bg-rule grid grid-cols-3 gap-px border-t tabular-nums">
      <span className="bg-paper text-graphite px-5 py-3 sm:px-6">
        {entry.type}
      </span>
      <span className="bg-paper text-graphite px-5 py-3 sm:px-6">
        {entry.length}
      </span>
      <span className="bg-paper text-ink px-5 py-3 text-right sm:px-6">
        Open ↗
      </span>
    </span>
  </span>
);

export const FileStack = ({ entries }: { entries: readonly LedgerEntry[] }) => {
  const root = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [isEngaged, setIsEngaged] = useState(false);
  const isReduced = useReducedMotion();

  useScrollIndex(root, entries.length, !isEngaged && !isReduced, setActive);

  const select = (index: number) => {
    setIsEngaged(true);
    setActive(index);
  };

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const by = stepKeys.get(event.key);
    if (by === undefined) {
      return;
    }
    event.preventDefault();
    const next = (active + by + entries.length) % entries.length;
    select(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="flex flex-col" data-build-block ref={root}>
      <div
        aria-label="Employment files"
        className="flex gap-1 pr-6"
        role="tablist"
      >
        {entries.map((entry, index) => (
          <button
            aria-controls={`file-card-${entry.id}`}
            aria-selected={index === active}
            className={cn(
              "label border-rule-strong ease-out-quart flex h-11 min-w-0 flex-1 cursor-pointer items-center gap-2 border border-b-0 px-3 tabular-nums transition-colors duration-150",
              "text-graphite bg-paper-deep pointer-fine:hover:text-ink aria-selected:bg-ink aria-selected:text-paper",
              focusRingClassName
            )}
            id={`file-tab-${entry.id}`}
            key={entry.id}
            onClick={() => select(index)}
            onFocus={() => select(index)}
            onKeyDown={onTabKey}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") {
                select(index);
              }
            }}
            ref={(node) => {
              tabs.current[index] = node;
            }}
            role="tab"
            tabIndex={index === active ? 0 : -1}
            type="button"
          >
            <span>{entry.ordinal}</span>
            <span className="truncate max-sm:hidden">{entry.company}</span>
            <span className="ml-auto sm:hidden">{entry.year}</span>
          </button>
        ))}
      </div>
      <div className="grid pr-6 pb-6">
        {entries.map((entry, index) => {
          const depth = index - active;
          return (
            <div
              aria-hidden={depth !== 0}
              aria-labelledby={`file-tab-${entry.id}`}
              className="ease-out-quart col-start-1 row-start-1 transition-[transform,opacity] duration-300"
              id={`file-card-${entry.id}`}
              inert={depth !== 0}
              key={entry.id}
              role="tabpanel"
              style={cardPose(depth)}
            >
              <OpenFile
                className={cn(
                  "bg-paper border-rule-strong block size-full cursor-pointer border text-left transition-transform duration-150 active:scale-99",
                  focusRingClassName
                )}
                file={entry.file}
              >
                <FileCard entry={entry} />
              </OpenFile>
            </div>
          );
        })}
      </div>
      <p className="label text-mist flex justify-between gap-4">
        <span>
          {entries.length} files · {entries.at(-1)?.year} → now
        </span>
        <span>Hover a tab · open the file</span>
      </p>
    </div>
  );
};
