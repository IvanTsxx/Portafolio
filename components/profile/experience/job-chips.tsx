"use client";

import { cn } from "@/lib/utils";

import type { Tenure } from "./career";

export const JobChips = ({
  committed,
  onCommit,
  onPreview,
  shown,
  tenures,
}: {
  committed: number;
  onCommit: (index: number) => void;
  onPreview: (index: number | null) => void;
  shown: number;
  tenures: readonly Tenure[];
}) => (
  <ol aria-label="Jobs" className="m-0 flex list-none flex-wrap gap-1 p-0">
    {tenures.map((job, index) => (
      <li data-build-block key={job.id}>
        <button
          aria-current={index === shown ? "step" : undefined}
          aria-pressed={index === committed}
          className={cn(
            "label border-rule-strong text-graphite hover:border-ink hover:text-ink flex items-center gap-1.5 border px-2 py-1 tabular-nums transition-colors duration-100",
            index === shown && "border-ink bg-ink text-paper hover:text-paper"
          )}
          onBlur={() => onPreview(null)}
          onClick={() => onCommit(index)}
          onFocus={(event) => {
            if (event.currentTarget.matches(":focus-visible")) {
              onPreview(index);
            }
          }}
          onPointerEnter={() => onPreview(index)}
          onPointerLeave={() => onPreview(null)}
          type="button"
        >
          <span className="whitespace-nowrap">{job.company}</span>
          <span className="text-current/60">{job.year}</span>
          <span className="sr-only">
            , {job.role}, {job.dates}, {job.type}
          </span>
        </button>
      </li>
    ))}
  </ol>
);
