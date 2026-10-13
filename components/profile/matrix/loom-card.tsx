"use client";

import type { ReactNode, RefObject } from "react";

import { CornerMarks } from "@/components/site/corner-marks";
import { cn } from "@/lib/utils";

import type { LoomYear, ReadoutText } from "./loom-model";

export const LoomCard = ({
  children,
  detailRef,
  hint,
  mainRef,
  rest,
  title,
}: {
  children: ReactNode;
  detailRef: RefObject<HTMLSpanElement | null>;
  hint: string;
  mainRef: RefObject<HTMLSpanElement | null>;
  rest: ReadoutText;
  title: string;
}) => (
  <div className="border-rule-strong bg-paper has-[input:focus-visible]:outline-ink relative flex flex-col border outline-offset-4 has-[input:focus-visible]:outline-1">
    <CornerMarks />
    <div className="label text-graphite flex items-start justify-between gap-4 px-4 pt-3">
      <span className="tabular-nums">Fig 05</span>
      <span className="text-ink">{title}</span>
    </div>
    {children}
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1 px-4 pb-3">
      <span className="label text-mist">{hint}</span>
      <span className="ml-auto flex flex-col items-end text-right" data-readout>
        <span
          className="text-ink text-sm leading-tight font-medium tracking-tight tabular-nums"
          ref={mainRef}
        >
          {rest.main}
        </span>
        <span className="label text-graphite tabular-nums" ref={detailRef}>
          {rest.detail}
        </span>
      </span>
    </div>
  </div>
);

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
          "label border-rule-strong text-graphite hover:border-ink hover:text-ink flex items-center gap-1.5 border px-2 py-1 tabular-nums transition-colors duration-100",
          index === shown && "border-ink bg-ink text-paper hover:text-paper"
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
