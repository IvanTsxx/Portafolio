"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";

import { contributionLevels } from "@/lib/github/model";
import type {
  ContributionCalendar,
  ContributionLevel,
} from "@/lib/github/model";
import { cn } from "@/lib/utils";

import { ContributionStatsReadout } from "./contribution-stats";
import {
  calendarCaption,
  formatDayLabel,
  monthLabelsFor,
} from "./contributions";
import { SectionFrame } from "./section-frame";
import { TechnicalButton } from "./technical-button";

interface CellPosition {
  week: number;
  day: number;
}

const CELL = 10;
const PITCH = 13;
const GUTTER_LEFT = 28;
const GUTTER_TOP = 16;
const DAYS_PER_WEEK = 7;
const AXIS_FONT_SIZE = 8;

const levelFills: Record<ContributionLevel, string> = {
  0: "fill-graphite/10",
  1: "fill-graphite/30",
  2: "fill-graphite/55",
  3: "fill-graphite/85",
  4: "fill-ink",
};

const levelSwatches: Record<ContributionLevel, string> = {
  0: "bg-graphite/10",
  1: "bg-graphite/30",
  2: "bg-graphite/55",
  3: "bg-graphite/85",
  4: "bg-ink",
};

const rowLabels = [
  { day: 1, label: "Mon" },
  { day: 3, label: "Wed" },
  { day: 5, label: "Fri" },
] as const;

const arrowSteps = new Map<string, CellPosition>([
  ["ArrowDown", { day: 1, week: 0 }],
  ["ArrowLeft", { day: 0, week: -1 }],
  ["ArrowRight", { day: 0, week: 1 }],
  ["ArrowUp", { day: -1, week: 0 }],
]);

const countFormat = new Intl.NumberFormat("en-US");

const filledPositions = (calendar: ContributionCalendar) =>
  calendar.weeks.flatMap((week, weekIndex) =>
    week.flatMap((day, dayIndex) =>
      day ? [{ day: dayIndex, week: weekIndex }] : []
    )
  );

const dayAt = (calendar: ContributionCalendar, position: CellPosition) =>
  calendar.weeks[position.week]?.[position.day] ?? null;

const scrollToLatest = (node: HTMLDivElement | null) => {
  if (node) {
    node.scrollLeft = node.scrollWidth;
  }
};

const origin: CellPosition = { day: 0, week: 0 };

interface ContributionMatrixProps {
  calendars: readonly [ContributionCalendar, ...ContributionCalendar[]];
}

export const ContributionMatrix = ({ calendars }: ContributionMatrixProps) => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [cursor, setCursor] = useState<CellPosition | null>(null);
  const calendar =
    calendars.find((candidate) => candidate.year === selectedYear) ??
    calendars[0];
  const { year } = calendar;
  const caption = calendarCaption(calendar);
  const months = monthLabelsFor(calendar.weeks);
  const filled = filledPositions(calendar);
  const firstPosition = filled[0] ?? origin;
  const lastPosition = filled.at(-1) ?? origin;
  const active = cursor ?? lastPosition;
  const activeDay = dayAt(calendar, active);
  const activeIndex = filled.findIndex(
    (position) => position.week === active.week && position.day === active.day
  );
  const width = GUTTER_LEFT + calendar.weeks.length * PITCH;
  const height = GUTTER_TOP + DAYS_PER_WEEK * PITCH;

  const selectYear = (next: number) => {
    setSelectedYear(next);
    setCursor(null);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const step = arrowSteps.get(event.key);
    if (step) {
      event.preventDefault();
      const next = {
        day: active.day + step.day,
        week: active.week + step.week,
      };
      if (dayAt(calendar, next)) {
        setCursor(next);
      }
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setCursor(firstPosition);
    }
    if (event.key === "End") {
      event.preventDefault();
      setCursor(lastPosition);
    }
    if (event.key === "Escape") {
      setCursor(null);
    }
  };

  return (
    <SectionFrame
      aside={
        <fieldset className="flex flex-wrap gap-1">
          <legend className="sr-only">Contribution year</legend>
          {calendars.map((option) => (
            <TechnicalButton
              aria-pressed={option.year === year}
              className="h-10 px-3 tabular-nums"
              key={option.year}
              onClick={() => selectYear(option.year)}
              tone={option.year === year ? "selected" : "outline"}
            >
              {option.year}
            </TechnicalButton>
          ))}
        </fieldset>
      }
      id="matrix"
      index="GH-05"
      jp="貢献行列"
      label="Contribution matrix"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <p className="flex flex-col gap-1">
          <span className="text-ink font-mono text-5xl font-light tracking-tight tabular-nums md:text-6xl">
            {countFormat.format(calendar.total)}
          </span>
          <span className="label text-graphite">
            Contributions {caption.en}
            <span className="jp"> / {caption.jp}</span>
          </span>
        </p>
        <div className="flex flex-col gap-1 sm:min-w-48 sm:items-end sm:text-right">
          <span className="text-ink font-mono text-3xl font-light tracking-tight tabular-nums">
            {String(activeDay?.count ?? 0).padStart(2, "0")}
            <span className="text-graphite ml-1 text-xs tracking-widest">
              contrib
            </span>
          </span>
          <span className="label text-graphite tabular-nums">
            {activeDay ? formatDayLabel(activeDay.date) : "—"} · L
            {activeDay?.level ?? 0}
          </span>
        </div>
      </div>

      <div className="border-rule relative border-t border-b py-4">
        <div
          className="has-focus-visible:outline-clay overflow-x-auto outline-offset-2 has-focus-visible:outline-2"
          key={year}
          ref={scrollToLatest}
        >
          <input
            aria-label={`Contribution matrix, ${countFormat.format(calendar.total)} contributions ${caption.en}. Arrow keys read each day, Home and End jump.`}
            aria-valuetext={
              activeDay
                ? `${formatDayLabel(activeDay.date)}, ${activeDay.count} contributions`
                : "No day selected"
            }
            className="sr-only"
            max={Math.max(filled.length - 1, 0)}
            min={0}
            onBlur={() => setCursor(null)}
            onChange={(event) =>
              setCursor(filled[Number(event.target.value)] ?? null)
            }
            onKeyDown={handleKeyDown}
            type="range"
            value={Math.max(activeIndex, 0)}
          />
          <svg
            aria-hidden
            className="block w-full min-w-160 cursor-crosshair"
            viewBox={`0 0 ${width} ${height}`}
          >
            {months.map((month) => (
              <text
                className="fill-graphite font-mono uppercase"
                fontSize={AXIS_FONT_SIZE}
                key={`${month.label}-${month.column}`}
                x={GUTTER_LEFT + month.column * PITCH}
                y={9}
              >
                {month.label}
              </text>
            ))}
            {rowLabels.map((row) => (
              <text
                className="fill-mist font-mono uppercase"
                fontSize={AXIS_FONT_SIZE}
                key={row.label}
                x={0}
                y={GUTTER_TOP + row.day * PITCH + CELL - 1}
              >
                {row.label}
              </text>
            ))}
            <line
              className="stroke-ink/40"
              strokeDasharray="1 2"
              vectorEffect="non-scaling-stroke"
              x1={GUTTER_LEFT + active.week * PITCH + CELL / 2}
              x2={GUTTER_LEFT + active.week * PITCH + CELL / 2}
              y1={GUTTER_TOP - 4}
              y2={height}
            />
            <line
              className="stroke-ink/40"
              strokeDasharray="1 2"
              vectorEffect="non-scaling-stroke"
              x1={GUTTER_LEFT - 4}
              x2={width}
              y1={GUTTER_TOP + active.day * PITCH + CELL / 2}
              y2={GUTTER_TOP + active.day * PITCH + CELL / 2}
            />
            <g onPointerLeave={() => setCursor(null)}>
              {calendar.weeks.map((week, weekIndex) =>
                week.map((day, dayIndex) =>
                  day ? (
                    <rect
                      className={cn(
                        levelFills[day.level],
                        "ease-mechanical transition-[fill] duration-100"
                      )}
                      height={CELL}
                      key={day.date}
                      onPointerEnter={() =>
                        setCursor({ day: dayIndex, week: weekIndex })
                      }
                      width={CELL}
                      x={GUTTER_LEFT + weekIndex * PITCH}
                      y={GUTTER_TOP + dayIndex * PITCH}
                    />
                  ) : null
                )
              )}
            </g>
            <rect
              className="stroke-ink pointer-events-none"
              fill="none"
              height={CELL + 4}
              vectorEffect="non-scaling-stroke"
              width={CELL + 4}
              x={GUTTER_LEFT + active.week * PITCH - 2}
              y={GUTTER_TOP + active.day * PITCH - 2}
            />
          </svg>
        </div>
      </div>

      <div className="label text-mist flex flex-wrap items-center justify-between gap-4">
        <span>Hover or ← → ↑ ↓</span>
        <span className="flex items-center gap-2">
          Less <span className="jp">少</span>
          <span aria-hidden className="flex gap-1">
            {contributionLevels.map((level) => (
              <span
                className={cn("size-2.5", levelSwatches[level])}
                key={level}
              />
            ))}
          </span>
          More <span className="jp">多</span>
        </span>
      </div>

      <ContributionStatsReadout calendar={calendar} />
    </SectionFrame>
  );
};
