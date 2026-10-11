"use client";

import type { CSSProperties } from "react";

import type { Timeline } from "@/lib/timeline/timeline";
import {
  assignPointLanes,
  formatStamp,
  laneCount,
} from "@/lib/timeline/timeline";
import { cn } from "@/lib/utils";

import type { TimelineItemHandlers } from "./timeline-index";

const monthRem = 2.5;
const pointRem = 5;
const spanRowRem = 2.5;
const pointRowRem = 3.25;
const edgeRem = 1;

export const TimelineRail = ({
  className,
  controls,
  onSelect,
  selectedId,
  timeline,
}: Pick<TimelineItemHandlers, "onSelect" | "selectedId"> & {
  className?: string;
  controls: string;
  timeline: Timeline;
}) => {
  const months = timeline.range.to - timeline.range.from;
  const leftOf = (at: number) =>
    `${((at - timeline.range.from) / months) * 100}%`;
  const points = assignPointLanes(timeline.points, pointRem / monthRem);
  const pointLanes = laneCount(points);
  const baselineRem = edgeRem + timeline.spanLanes * spanRowRem + 0.75;
  const pointsRem = baselineRem + 2;
  const heightRem = pointsRem + pointLanes * pointRowRem + 0.5;
  const trackStyle: CSSProperties = {
    height: `${heightRem}rem`,
    width: `${months * monthRem}rem`,
  };

  return (
    <div
      className={cn(
        "border-rule snap-x snap-mandatory [scrollbar-width:thin] overflow-x-auto overscroll-x-contain border-y",
        className
      )}
    >
      <ol
        aria-label="Timeline entries"
        className="relative m-0 min-w-full list-none p-0"
        style={trackStyle}
      >
        <li
          aria-hidden
          className="border-ink absolute inset-x-0 border-t"
          style={{ top: `${baselineRem}rem` }}
        />
        {timeline.ticks.map((tick) => (
          <li
            aria-hidden
            className="label text-ink border-ink absolute border-l pl-1"
            key={tick.year}
            style={{ left: leftOf(tick.at), top: `${baselineRem - 0.5}rem` }}
          >
            <span className="relative top-2">{tick.year}</span>
          </li>
        ))}
        <li
          aria-hidden
          className="text-graphite absolute border-l border-current"
          style={{
            height: `${baselineRem - edgeRem + 0.75}rem`,
            left: leftOf(timeline.now.at),
            top: `${edgeRem - 0.25}rem`,
          }}
        >
          <span className="label absolute top-full left-1 -mt-3.5">
            Present
          </span>
        </li>
        {points.map((point) => (
          <li
            aria-hidden
            className="border-ink absolute h-2 border-l"
            key={`${point.id}-tick`}
            style={{ left: leftOf(point.at), top: `${baselineRem}rem` }}
          />
        ))}
        {timeline.spans.map((span) => (
          <li
            className="absolute snap-start scroll-ml-4"
            key={span.id}
            style={{
              left: leftOf(span.from),
              top: `${edgeRem + span.lane * spanRowRem}rem`,
              width: `calc(${((span.to - span.from) / months) * 100}% - 0.25rem)`,
            }}
          >
            <button
              aria-controls={controls}
              aria-expanded={span.id === selectedId}
              className={cn(
                "label flex h-8 w-full items-center gap-1.5 overflow-hidden border px-2 text-left whitespace-nowrap transition-colors duration-100",
                span.isCurrent
                  ? "border-ink bg-ink text-paper"
                  : "border-ink bg-paper text-ink",
                span.id === selectedId &&
                  "outline-ink outline-2 outline-offset-2"
              )}
              onClick={() => onSelect(span.id)}
              type="button"
            >
              <span className="truncate">{span.company}</span>
              <span className="sr-only">, {span.role}</span>
            </button>
          </li>
        ))}
        {points.map((point) => (
          <li
            className="absolute snap-start scroll-ml-4"
            key={point.id}
            style={{
              left: leftOf(point.at),
              top: `${pointsRem + point.lane * pointRowRem}rem`,
              width: `${pointRem - 0.25}rem`,
            }}
          >
            <button
              aria-controls={controls}
              aria-expanded={point.id === selectedId}
              className={cn(
                "border-ink bg-paper text-ink flex h-11 w-full flex-col justify-between border px-1.5 py-1 text-left transition-colors duration-100",
                point.id === selectedId &&
                  "outline-ink outline-2 outline-offset-2"
              )}
              onClick={() => onSelect(point.id)}
              type="button"
            >
              <span className="label w-full truncate">{point.name}</span>
              <span className="label text-graphite tabular-nums">
                {formatStamp(point.createdAt)}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
};
