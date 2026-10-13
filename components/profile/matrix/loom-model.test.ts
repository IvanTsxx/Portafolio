import { describe, expect, test } from "bun:test";

import type { ContributionCalendar } from "@/lib/github/model";

import {
  cellOf,
  dayText,
  loomSourceOf,
  loomSourcesOf,
  loomYearOf,
  pinHeightOf,
  PIN_RISE,
  sweepText,
  weekText,
} from "./loom-model";

const calendar: ContributionCalendar = {
  range: "calendar-year",
  total: 31,
  weeks: [
    [
      null,
      null,
      null,
      { count: 4, date: "2025-01-01", level: 2 },
      { count: 0, date: "2025-01-02", level: 0 },
      { count: 1, date: "2025-01-03", level: 1 },
      { count: 0, date: "2025-01-04", level: 0 },
    ],
    [
      { count: 9, date: "2025-01-05", level: 3 },
      { count: 16, date: "2025-01-06", level: 4 },
      { count: 0, date: "2025-01-07", level: 0 },
      { count: 1, date: "2025-01-08", level: 1 },
      null,
      null,
      null,
    ],
  ],
  year: 2025,
};

describe("pin loom model", () => {
  test("dates every slot from the first filled day, gaps included", () => {
    const source = loomSourceOf(calendar, 3);
    expect(source.firstDate).toBe("2024-12-29");
    const year = loomYearOf(source);
    expect(year.cells[cellOf(1, 3)]?.date).toBe("2025-01-08");
  });

  test("places each day in its week and weekday slot, leaving gaps empty", () => {
    const year = loomYearOf(loomSourceOf(calendar, 3));
    expect(year.cells).toHaveLength(21);
    expect(year.cells[cellOf(0, 0)]).toBeNull();
    expect(year.cells[cellOf(0, 3)]?.date).toBe("2025-01-01");
    expect(year.cells[cellOf(1, 1)]?.count).toBe(16);
    expect(year.cells[cellOf(2, 0)]).toBeNull();
  });

  test("raises each pin by the square root of its count, flat at zero", () => {
    expect(pinHeightOf(0)).toBe(0);
    expect(pinHeightOf(1)).toBe(PIN_RISE);
    expect(pinHeightOf(16)).toBe(PIN_RISE * 4);
    const year = loomYearOf(loomSourceOf(calendar, 2));
    expect(year.heights[cellOf(1, 1)]).toBe(PIN_RISE * 4);
    expect(year.heights[cellOf(0, 4)]).toBe(0);
  });

  test("sums weeks and ranks the busiest ones", () => {
    const year = loomYearOf(loomSourceOf(calendar, 2));
    expect(year.weeks.map((week) => week.total)).toEqual([5, 26]);
    expect(year.busiestWeeks).toEqual([1, 0]);
    expect(year.busiest?.date).toBe("2025-01-06");
    const [, busy] = year.weeks;
    expect(busy && weekText(busy)).toEqual({
      detail: "Week of Jan 5 – Jan 8, 2025",
      main: "26 contributions",
    });
  });

  test("reads a day and a running sweep in true numbers", () => {
    const year = loomYearOf(loomSourceOf(calendar, 2));
    const day = year.cells[cellOf(0, 5)];
    expect(day && dayText(day)).toEqual({
      detail: "Fri Jan 3, 2025",
      main: "1 contribution",
    });
    expect(sweepText(year, 5)).toEqual({
      detail: "Setting 2025 · 5 of 31",
      main: "5 contributions",
    });
  });

  test("orders years oldest first on a shared week count", () => {
    const later = { ...calendar, weeks: [...calendar.weeks, []], year: 2026 };
    const sources = loomSourcesOf([later, calendar]);
    expect(sources.map((source) => source.year)).toEqual([2025, 2026]);
    expect(sources.every((source) => source.counts.length === 21)).toBe(true);
  });
});
