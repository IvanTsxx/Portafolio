"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useFigureStation } from "@/components/iso/figure-stations";
import { FigurePlate, FigureReadout } from "@/components/profile/figure-plate";

import type { LoomParts } from "./loom-art";
import { LoomDrawing } from "./loom-drawing";
import type { LoomControl } from "./loom-drawing";
import type { LoomSignals } from "./loom-engine";
import { loomLayoutOf } from "./loom-layout";
import {
  loadedText,
  loomYearOf,
  restText,
  spokenDay,
  weekRangeText,
  weekText,
} from "./loom-model";
import type { LoomSource, LoomYear } from "./loom-model";
import { weekOfCell } from "./loom-motion";
import { pinFieldOf, pinShadesOf } from "./loom-pins";
import {
  filledCellsOf,
  keyActionOf,
  litCellsOf,
  markCells,
  markPart,
  pressYearKey,
  readoutOf,
  writeReadout,
} from "./loom-view";
import type { Sweeping } from "./loom-view";
import { useLoomMotion } from "./use-loom-motion";
import { useLoomTour } from "./use-loom-tour";
import { YearKeys } from "./year-keys";

const STATION_ID = "contribution-loom";
const STATION_TITLE = "Pin loom";

const CONTROLS = [
  { id: "previous-year", label: "Previous year" },
  { id: "next-year", label: "Next year" },
  { id: "sweep", label: "Sweep the year again" },
  { id: "busiest", label: "Pin the busiest week" },
] as const;

export type LoomSources = readonly [LoomSource, ...LoomSource[]];

const yearsOf = (sources: LoomSources): [LoomYear, ...LoomYear[]] => {
  const [head, ...rest] = sources;
  return [loomYearOf(head), ...rest.map(loomYearOf)];
};

const pinnedLineOf = (year: LoomYear, week: number) => {
  const entry = year.weeks.find((candidate) => candidate.week === week);
  return entry
    ? `Week of ${weekRangeText(entry)} pinned, ${weekText(entry).main}`
    : "";
};

export interface LoomLiveProps {
  caption: string;
  initial: number;
  label: string;
  parts: LoomParts;
  sources: LoomSources;
  tallest: number;
  weekCount: number;
}

export const LoomLive = ({
  caption,
  initial,
  label,
  parts,
  sources,
  tallest,
  weekCount,
}: LoomLiveProps) => {
  const years = useMemo(() => yearsOf(sources), [sources]);
  const layout = useMemo(
    () => loomLayoutOf(weekCount, tallest),
    [weekCount, tallest]
  );
  const field = useMemo(() => pinFieldOf(layout), [layout]);
  const shades = useMemo(() => pinShadesOf(layout), [layout]);
  const root = useRef<HTMLElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const consoleRef = useRef<SVGGElement>(null);
  const mainRef = useRef<HTMLSpanElement>(null);
  const detailRef = useRef<HTMLSpanElement>(null);
  const lit = useRef<ReadonlySet<number>>(new Set());
  const cursor = useRef<ReadonlySet<number>>(new Set());
  const sweeping = useRef<Sweeping | null>(null);
  const lastTouch = useRef(Number.NEGATIVE_INFINITY);
  const [shown, setShown] = useState(initial);
  const [cell, setCell] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const [isEngaged, setIsEngaged] = useState(false);
  const [isSettled, setIsSettled] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [firstYear] = years;
  const year = years[shown] ?? firstYear;
  const initialYear = years[initial] ?? firstYear;

  const showReadout = () =>
    writeReadout(
      mainRef.current,
      detailRef.current,
      readoutOf(year, cell, pinned, sweeping.current)
    );

  const signals: LoomSignals = {
    onSweep: (sweepYear, setSoFar) => {
      sweeping.current = { setSoFar, year: sweepYear };
      showReadout();
      markPart(svg.current, "[data-lamp]", true);
    },
    onSweepDone: (doneYear) => {
      sweeping.current = null;
      showReadout();
      markPart(svg.current, "[data-lamp]", pinned !== null);
      setIsSettled(true);
      setAnnouncement(loadedText(doneYear));
    },
  };

  const { engine, isReduced, isVisible } = useLoomMotion({
    field,
    initial,
    layout,
    root,
    signals,
    svg,
    years,
  });

  const touch = () => {
    lastTouch.current = performance.now();
  };

  const pickYear = (index: number, isReplay = false) => {
    touch();
    const next = (index + years.length) % years.length;
    setShown(next);
    setCell(null);
    setPinned(null);
    setIsSettled(false);
    engine.loadYear(next, isReplay);
  };

  const pinWeek = (week: number | null) => {
    touch();
    setPinned(week);
    if (week !== null) {
      setAnnouncement(pinnedLineOf(year, week));
    }
  };

  const operate = (controlId: string) => {
    const actions = new Map([
      ["busiest", () => pinWeek(year.busiestWeeks[0] ?? null)],
      ["next-year", () => pickYear(shown + 1)],
      ["previous-year", () => pickYear(shown - 1)],
      ["sweep", () => pickYear(shown, true)],
    ]);
    actions.get(controlId)?.();
  };

  const onControl = (control: LoomControl) => {
    if (control.kind === "year") {
      const index = years.findIndex((entry) => entry.year === control.year);
      if (index !== -1) {
        pickYear(index);
      }
      return;
    }
    operate(control.kind);
  };

  useFigureStation({
    consoleRef,
    controls: CONTROLS,
    figureRef: root,
    id: STATION_ID,
    onOperate: operate,
    title: STATION_TITLE,
  });

  useLoomTour({
    isActive: isVisible && !isReduced && !isEngaged && isSettled,
    lastTouch,
    onStep: setPinned,
    weeks: year.busiestWeeks,
  });

  useEffect(() => {
    engine.seek(pinned);
    markPart(svg.current, "[data-lamp]", pinned !== null);
  }, [engine, pinned]);

  useEffect(() => {
    const nextLit = litCellsOf(year, pinned);
    markCells(svg.current, "on", nextLit, lit.current);
    lit.current = nextLit;
    const nextCursor = new Set(cell === null ? [] : [cell]);
    markCells(svg.current, "cursor", nextCursor, cursor.current);
    cursor.current = nextCursor;
    writeReadout(
      mainRef.current,
      detailRef.current,
      readoutOf(year, cell, pinned, sweeping.current)
    );
  }, [year, cell, pinned]);

  useEffect(() => {
    pressYearKey(svg.current, year.year);
  }, [year]);

  const filled = filledCellsOf(year);
  const active = cell ?? filled.at(-1) ?? 0;
  const activeDay = cell === null ? null : year.cells[cell];

  return (
    <div
      className="flex flex-col gap-3"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsEngaged(false);
          setCell(null);
        }
      }}
      onFocus={() => {
        touch();
        setIsEngaged(true);
      }}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") {
          touch();
          setIsEngaged(true);
        }
      }}
      onPointerLeave={() => setIsEngaged(false)}
    >
      <figure className="iso m-0" data-build-block data-build-self ref={root}>
        <FigurePlate
          readout={
            <FigureReadout
              lead={<span ref={mainRef}>{restText(year).main}</span>}
              trail={<span ref={detailRef}>{restText(year).detail}</span>}
            />
          }
        >
          <input
            aria-label={label}
            aria-valuetext={
              activeDay
                ? spokenDay(activeDay)
                : `${restText(year).main} ${year.caption}, no day selected`
            }
            className="sr-only"
            max={Math.max(filled.length - 1, 0)}
            min={0}
            onChange={(event) =>
              setCell(filled[Number(event.target.value)] ?? null)
            }
            onKeyDown={(event) => {
              const action = keyActionOf(event.key, year, active);
              if (action.type === "none") {
                return;
              }
              event.preventDefault();
              touch();
              if (action.type === "cursor") {
                setCell(action.cell);
              } else if (action.type === "pin") {
                pinWeek(pinned === action.week ? null : action.week);
              } else if (action.type === "year") {
                pickYear(shown + action.by);
              } else {
                setCell(null);
                setPinned(null);
              }
            }}
            type="range"
            value={Math.max(filled.indexOf(active), 0)}
          />
          <LoomDrawing
            consoleRef={consoleRef}
            field={field}
            initialYear={initialYear}
            layout={layout}
            onCell={(next) => {
              if (next !== cell) {
                touch();
                setCell(next);
              }
            }}
            onControl={onControl}
            onPick={(picked) => {
              const week = weekOfCell(picked);
              setCell(picked);
              pinWeek(pinned === week ? null : week);
            }}
            parts={parts}
            shades={shades}
            svgRef={svg}
            year={year}
          />
        </FigurePlate>
        <figcaption className="sr-only">{caption}</figcaption>
      </figure>
      <YearKeys
        onPick={(index) => pickYear(index)}
        shown={shown}
        years={years}
      />
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
};
