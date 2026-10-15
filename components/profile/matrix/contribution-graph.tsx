"use client";

import { cva } from "class-variance-authority";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type {
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
} from "react";

import { FigurePlate, FigureReadout } from "@/components/profile/figure-plate";
import type { ContributionLevel } from "@/lib/github/model";
import { contributionLevels } from "@/lib/github/model";

import {
  contributionsText,
  dayAt,
  dayReadout,
  graphYearOf,
  lastDayOf,
  restReadout,
  spokenDay,
  stepCell,
} from "./contribution-model";
import type {
  CellPosition,
  GraphDay,
  GraphSource,
  GraphYear,
} from "./contribution-model";
import { useGraphCompanion } from "./use-graph-companion";
import { useGraphMotion } from "./use-graph-motion";
import { YearKeys } from "./year-keys";

const fillVariants = cva("pointer-events-none absolute inset-0 bg-current", {
  variants: {
    level: {
      0: "opacity-10",
      1: "opacity-30",
      2: "opacity-50",
      3: "opacity-75",
      4: "opacity-100",
    },
  },
});

const weekdayMarks = ["", "Mon", "", "Wed", "", "Fri", ""] as const;

const columnClassName = "flex min-w-0 flex-1 flex-col gap-0.5 sm:gap-1";

const cellClassName =
  "text-ink ease-mechanical relative block aspect-square w-full cursor-default outline-clay transition-colors duration-100 outline-offset-1 group-focus-within/week:text-clay focus-visible:outline-1 pointer-fine:group-hover/week:text-clay pointer-fine:hover:outline-1";

export type GraphSources = readonly [GraphSource, ...GraphSource[]];

const positionOf = (element: Element | null): CellPosition | null => {
  const cell = element?.closest<HTMLElement>("[data-cell]");
  if (!cell) {
    return null;
  }
  return {
    week: Number(cell.dataset.week),
    weekday: Number(cell.dataset.weekday),
  };
};

const cellElementOf = (element: Element | null) =>
  element?.closest<HTMLElement>("[data-cell]") ?? null;

const focusCell = (event: MouseEvent<HTMLButtonElement>) => {
  event.currentTarget.focus();
};

const GraphCells = ({
  onStep,
  tabStop,
  year,
}: {
  onStep: (event: KeyboardEvent<HTMLButtonElement>) => void;
  tabStop: CellPosition | null;
  year: GraphYear;
}) => (
  <>
    {year.weeks.map((days, week) => (
      <div
        className={`group/week ${columnClassName}`}
        key={`${year.year}-${week}`}
        data-week={week}
      >
        {days.map((day, weekday) =>
          day ? (
            <button
              aria-label={spokenDay(day)}
              className={cellClassName}
              data-cell
              data-week={week}
              data-weekday={weekday}
              key={day.date}
              onClick={focusCell}
              onKeyDown={onStep}
              tabIndex={
                tabStop?.week === week && tabStop.weekday === weekday ? 0 : -1
              }
              type="button"
            >
              <span className={fillVariants({ level: day.level })} data-fill />
            </button>
          ) : (
            <span
              aria-hidden
              className="block aspect-square w-full"
              key={`blank-${weekday}`}
            />
          )
        )}
      </div>
    ))}
  </>
);

const MonthRow = ({ year }: { year: GraphYear }) => {
  const labels = new Map(year.months.map((mark) => [mark.week, mark.label]));
  return (
    <div aria-hidden className="flex gap-0.5 sm:gap-1">
      <span className="bg-paper sticky left-0 z-10 w-8 flex-none" />
      {year.weeks.map((_, week) => (
        <span
          className="label text-graphite min-w-0 flex-1 overflow-visible whitespace-nowrap"
          key={`month-${week}`}
        >
          {labels.get(week) ?? ""}
        </span>
      ))}
    </div>
  );
};

const WeekdayColumn = () => (
  <div
    aria-hidden
    className="bg-paper sticky left-0 z-10 flex w-8 flex-none flex-col gap-0.5 sm:gap-1"
  >
    {weekdayMarks.map((mark, weekday) => (
      <span className="relative min-h-0 flex-1" key={`weekday-${weekday}`}>
        <span className="label text-graphite absolute top-1/2 left-0 -translate-y-1/2">
          {mark}
        </span>
      </span>
    ))}
  </div>
);

const Legend = () => (
  <div aria-hidden className="label text-graphite flex items-center gap-1">
    <span className="mr-1">Less</span>
    {contributionLevels.map((level: ContributionLevel) => (
      <span className="text-ink relative size-3" key={`level-${level}`}>
        <span className={fillVariants({ level })} />
      </span>
    ))}
    <span className="ml-1">More</span>
  </div>
);

export interface ContributionGraphProps {
  caption: string;
  initial: number;
  label: string;
  sources: GraphSources;
}

export const ContributionGraph = ({
  caption,
  initial,
  label,
  sources,
}: ContributionGraphProps) => {
  const years = useMemo(() => sources.map(graphYearOf), [sources]);
  const [shown, setShown] = useState(initial);
  const year = years[shown] ?? years[0];
  const [active, setActive] = useState<GraphDay | null>(null);
  const [tabStop, setTabStop] = useState<CellPosition | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const root = useRef<HTMLElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLFieldSetElement>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const { isReduced, phase } = useGraphMotion({
    grid,
    latestWeek: year?.latestWeek ?? 0,
    root,
    yearKey: year?.year ?? 0,
  });
  const lookAt = useGraphCompanion({ figure: plate, isReduced, phase });

  useLayoutEffect(() => {
    const element = scroller.current;
    if (element) {
      element.scrollLeft = element.scrollWidth;
    }
  }, []);

  if (!year) {
    return null;
  }

  const stop = tabStop ?? lastDayOf(year);
  const readout = active ? dayReadout(active) : restReadout(year);

  const inspect = (element: Element | null) => {
    const position = positionOf(element);
    setActive(position ? dayAt(year, position) : null);
    lookAt(cellElementOf(element));
  };

  const release = () => {
    setActive(null);
    lookAt(null);
  };

  const pickYear = (index: number) => {
    const next = years[index];
    if (!next) {
      return;
    }
    setShown(index);
    setTabStop(null);
    release();
    setAnnouncement(
      `${next.year}, ${contributionsText(next.total)} ${next.caption}`
    );
  };

  const onStep = (event: KeyboardEvent<HTMLButtonElement>) => {
    const from = positionOf(event.currentTarget);
    if (!from) {
      return;
    }
    const next = stepCell(year, from, event.key);
    if (!next) {
      return;
    }
    event.preventDefault();
    setTabStop({ week: next.week, weekday: next.weekday });
    grid.current
      ?.querySelector<HTMLElement>(
        `[data-cell][data-week="${next.week}"][data-weekday="${next.weekday}"]`
      )
      ?.focus();
  };

  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    const position = positionOf(event.target);
    if (position) {
      setTabStop(position);
    }
    inspect(event.target);
  };

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      release();
    }
  };

  const onPointerOver = (event: PointerEvent<HTMLDivElement>) => {
    const { target } = event;
    if (
      event.pointerType === "mouse" &&
      target instanceof Element &&
      positionOf(target)
    ) {
      inspect(target);
    }
  };

  const onPointerLeave = () => {
    if (!grid.current?.contains(document.activeElement)) {
      release();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <figure className="m-0" data-build-block data-build-self ref={root}>
        <div ref={plate}>
          <FigurePlate
            readout={
              <FigureReadout lead={readout.main} trail={readout.detail} />
            }
          >
            <div
              className="touch-pan-x overflow-x-auto overscroll-x-contain pb-3"
              ref={scroller}
            >
              <div className="flex min-w-160 flex-col gap-1 sm:min-w-0">
                <MonthRow year={year} />
                <div
                  className="flex gap-0.5 sm:gap-1"
                  onBlur={onBlur}
                  onFocus={onFocus}
                  onPointerLeave={onPointerLeave}
                  onPointerOver={onPointerOver}
                >
                  <WeekdayColumn />
                  <fieldset
                    aria-label={label}
                    className="m-0 flex min-w-0 flex-1 gap-0.5 border-0 p-0 sm:gap-1"
                    ref={grid}
                  >
                    <GraphCells onStep={onStep} tabStop={stop} year={year} />
                  </fieldset>
                </div>
              </div>
            </div>
          </FigurePlate>
        </div>
        <figcaption className="sr-only">{caption}</figcaption>
      </figure>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <YearKeys onPick={pickYear} shown={shown} years={years} />
        <Legend />
      </div>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
};
