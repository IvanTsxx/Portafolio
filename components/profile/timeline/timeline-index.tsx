"use client";

import type { FocusEvent } from "react";

import type { Timeline, TimelineEntry } from "@/lib/timeline/timeline";
import { formatStamp } from "@/lib/timeline/timeline";
import { cn } from "@/lib/utils";

export interface TimelineItemHandlers {
  activeId: string | null;
  selectedId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  onKeyboardFocus?: (entry: TimelineEntry) => void;
}

const stampOf = (entry: TimelineEntry) =>
  formatStamp(entry.kind === "experience" ? entry.start : entry.createdAt);

const nameOf = (entry: TimelineEntry) =>
  entry.kind === "experience" ? entry.company : entry.name;

export const TimelineIndex = ({
  activeId,
  className,
  controls,
  onHover,
  onKeyboardFocus,
  onSelect,
  selectedId,
  timeline,
}: TimelineItemHandlers & {
  className?: string;
  controls: string;
  timeline: Timeline;
}) => (
  <ol
    aria-label="Timeline entries"
    className={cn(
      "relative m-0 flex [scrollbar-width:none] list-none gap-1 overflow-x-auto p-0 pb-1",
      className
    )}
  >
    {timeline.entries.map((entry) => {
      const isActive = entry.id === activeId;
      return (
        <li className="shrink-0" key={entry.id}>
          <button
            aria-controls={controls}
            aria-expanded={entry.id === selectedId}
            className={cn(
              "label border-rule-strong text-graphite hover:border-ink hover:text-ink flex items-center gap-1.5 border px-2 py-1 transition-colors duration-100",
              isActive && "border-ink bg-ink text-paper hover:text-paper"
            )}
            onBlur={() => onHover(null)}
            onClick={() => onSelect(entry.id)}
            onFocus={(event: FocusEvent<HTMLButtonElement>) => {
              if (event.currentTarget.matches(":focus-visible")) {
                onHover(entry.id);
                onKeyboardFocus?.(entry);
              }
            }}
            onPointerEnter={() => onHover(entry.id)}
            onPointerLeave={() => onHover(null)}
            type="button"
          >
            <span
              aria-hidden
              className={cn(
                "size-1.5 shrink-0 border border-current",
                entry.kind === "repository" && "rounded-full",
                entry.kind === "experience" && entry.isCurrent && "bg-current"
              )}
            />
            <span className="whitespace-nowrap">{nameOf(entry)}</span>
            <span className="sr-only">, {stampOf(entry)}</span>
            <span className="sr-only">
              {entry.kind === "experience"
                ? `, ${entry.role}${entry.isCurrent ? ", current" : ""}`
                : ", repository"}
            </span>
          </button>
        </li>
      );
    })}
  </ol>
);
