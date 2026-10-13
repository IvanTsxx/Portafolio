import {
  cellOf,
  DAYS,
  dayText,
  restText,
  sweepText,
  weekText,
} from "./loom-model";
import type { LoomYear, ReadoutText } from "./loom-model";
import { weekOfCell } from "./loom-motion";

export interface Sweeping {
  setSoFar: number;
  year: LoomYear;
}

export type KeyAction =
  | { cell: number; type: "cursor" }
  | { type: "clear" }
  | { type: "pin"; week: number }
  | { by: number; type: "year" }
  | { type: "none" };

const steps = new Map<string, number>([
  ["ArrowDown", 1],
  ["ArrowLeft", -DAYS],
  ["ArrowRight", DAYS],
  ["ArrowUp", -1],
]);

const weekOf = (year: LoomYear, week: number | null) =>
  week === null
    ? null
    : (year.weeks.find((entry) => entry.week === week) ?? null);

const dayOf = (year: LoomYear, cell: number | null) =>
  cell === null ? null : (year.cells[cell] ?? null);

export const filledCellsOf = (year: LoomYear) =>
  year.cells.flatMap((entry, index) => (entry ? [index] : []));

export const readoutOf = (
  year: LoomYear,
  cell: number | null,
  pinned: number | null,
  sweeping: Sweeping | null
): ReadoutText => {
  const day = dayOf(year, cell);
  if (day) {
    return dayText(day);
  }
  const week = weekOf(year, pinned);
  if (week) {
    return weekText(week);
  }
  if (sweeping) {
    return sweepText(sweeping.year, sweeping.setSoFar);
  }
  return restText(year);
};

export const litCellsOf = (year: LoomYear, pinned: number | null) => {
  const lit = new Set<number>();
  if (pinned !== null) {
    for (let day = 0; day < DAYS; day += 1) {
      if (year.cells[cellOf(pinned, day)]) {
        lit.add(cellOf(pinned, day));
      }
    }
  }
  return lit;
};

const arrowTo = (year: LoomYear, active: number, step: number) => {
  const next = active + step;
  const keepsWeek =
    Math.abs(step) !== 1 || weekOfCell(next) === weekOfCell(active);
  return keepsWeek && year.cells[next] ? next : active;
};

export const keyActionOf = (
  key: string,
  year: LoomYear,
  active: number
): KeyAction => {
  const step = steps.get(key);
  if (step !== undefined) {
    return { cell: arrowTo(year, active, step), type: "cursor" };
  }
  const filled = filledCellsOf(year);
  const table = new Map<string, KeyAction>([
    [" ", { type: "pin", week: weekOfCell(active) }],
    ["End", { cell: filled.at(-1) ?? active, type: "cursor" }],
    ["Enter", { type: "pin", week: weekOfCell(active) }],
    ["Escape", { type: "clear" }],
    ["Home", { cell: filled[0] ?? active, type: "cursor" }],
    ["PageDown", { by: 1, type: "year" }],
    ["PageUp", { by: -1, type: "year" }],
  ]);
  return table.get(key) ?? { type: "none" };
};

export const writeReadout = (
  main: HTMLElement | null,
  detail: HTMLElement | null,
  text: ReadoutText
) => {
  if (main) {
    main.textContent = text.main;
  }
  if (detail) {
    detail.textContent = text.detail;
  }
};

export const markCells = (
  svg: SVGSVGElement | null,
  mark: "cursor" | "on",
  next: ReadonlySet<number>,
  previous: ReadonlySet<number>
) => {
  for (const cell of previous) {
    const pin = svg?.querySelector<SVGGElement>(`[data-cell="${cell}"]`);
    if (pin && !next.has(cell)) {
      pin.removeAttribute(`data-${mark}`);
    }
  }
  for (const cell of next) {
    const pin = svg?.querySelector<SVGGElement>(`[data-cell="${cell}"]`);
    if (pin) {
      pin.setAttribute(`data-${mark}`, "");
    }
  }
};

export const markPart = (
  svg: SVGSVGElement | null,
  selector: string,
  isOn: boolean
) => {
  const part = svg?.querySelector<SVGGElement>(selector);
  if (!part) {
    return;
  }
  if (isOn) {
    part.dataset.on = "";
  } else {
    delete part.dataset.on;
  }
};

export const pressYearKey = (svg: SVGSVGElement | null, year: number) => {
  for (const key of svg?.querySelectorAll<SVGGElement>("[data-year]") ?? []) {
    if (Number(key.dataset.year) === year) {
      key.dataset.pressed = "";
    } else {
      delete key.dataset.pressed;
    }
  }
};
