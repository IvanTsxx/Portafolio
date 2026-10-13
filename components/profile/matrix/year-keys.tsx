"use client";

import { cn } from "@/lib/utils";

import type { LoomYear } from "./loom-model";

export const YearKeys = ({
  onPick,
  shown,
  years,
}: {
  onPick: (index: number) => void;
  shown: number;
  years: readonly LoomYear[];
}) => (
  <fieldset className="m-0 flex flex-wrap gap-1 border-0 p-0">
    <legend className="sr-only">Contribution year</legend>
    {years.map((year, index) => (
      <button
        aria-pressed={index === shown}
        className={cn(
          "label border-rule-strong text-graphite ease-mechanical pointer-fine:hover:border-ink pointer-fine:hover:text-ink flex min-h-8 items-center gap-1.5 border px-2 tabular-nums transition-colors duration-150",
          index === shown &&
            "border-ink bg-ink text-paper pointer-fine:hover:text-paper"
        )}
        data-build-block
        key={year.year}
        onClick={() => onPick(index)}
        type="button"
      >
        <span>{year.year}</span>
        <span className="text-current/60">{year.total}</span>
        <span className="sr-only"> contributions {year.caption}</span>
      </button>
    ))}
  </fieldset>
);
