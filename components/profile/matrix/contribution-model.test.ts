import { describe, expect, test } from "bun:test";

import type { ContributionCalendar } from "@/lib/github/model";

import {
  dayAt,
  dayReadout,
  gazeYaw,
  graphSourceOf,
  graphSourcesOf,
  graphYearOf,
  levelOf,
  restReadout,
  spokenDay,
  stepCell,
} from "./contribution-model";

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
      { count: 2, date: "2025-01-05", level: 1 },
      { count: 0, date: "2025-01-06", level: 0 },
      { count: 9, date: "2025-01-07", level: 4 },
      { count: 0, date: "2025-01-08", level: 0 },
      { count: 3, date: "2025-01-09", level: 0 },
      { count: 0, date: "2025-01-10", level: 3 },
      { count: 1, date: "2025-01-11", level: 1 },
    ],
    [
      { count: 11, date: "2025-01-12", level: 4 },
      { count: 0, date: "2025-01-13", level: 0 },
      null,
      null,
      null,
      null,
      null,
    ],
  ],
  year: 2025,
};

const year = graphYearOf(graphSourceOf(calendar));

describe("levelOf", () => {
  test("keeps the calendar's own bucket for active days", () => {
    expect(levelOf(4, 2)).toBe(2);
    expect(levelOf(9, 4)).toBe(4);
  });

  test("never shows an active day as empty or an empty day as active", () => {
    expect(levelOf(3, 0)).toBe(1);
    expect(levelOf(0, 3)).toBe(0);
  });

  test("carries the corrected level through the compact source", () => {
    expect(dayAt(year, { week: 1, weekday: 4 })?.level).toBe(1);
    expect(dayAt(year, { week: 1, weekday: 5 })?.level).toBe(0);
    expect(dayAt(year, { week: 1, weekday: 2 })?.level).toBe(4);
  });
});

describe("week layout", () => {
  test("places every day at its week and weekday with its own date", () => {
    expect(year.weeks).toHaveLength(3);
    expect(year.weeks.every((week) => week.length === 7)).toBe(true);
    expect(dayAt(year, { week: 0, weekday: 3 })).toEqual({
      count: 4,
      date: "2025-01-01",
      level: 2,
      week: 0,
      weekday: 3,
    });
    expect(dayAt(year, { week: 2, weekday: 1 })?.date).toBe("2025-01-13");
  });

  test("keeps days outside the range blank", () => {
    expect(dayAt(year, { week: 0, weekday: 0 })).toBeNull();
    expect(dayAt(year, { week: 2, weekday: 2 })).toBeNull();
  });

  test("finds the busiest day and the latest week", () => {
    expect(year.busiest?.date).toBe("2025-01-12");
    expect(year.latestWeek).toBe(2);
  });

  test("labels each month once at its first week", () => {
    expect(year.months).toEqual([{ label: "Jan", week: 0 }]);
  });

  test("drops a leading month label that would collide with the next", () => {
    const rolling = graphYearOf(
      graphSourceOf({
        range: "last-year",
        total: 1,
        weeks: [
          [
            { count: 0, date: "2025-12-28", level: 0 },
            null,
            null,
            null,
            null,
            null,
            null,
          ],
          [
            { count: 1, date: "2026-01-04", level: 1 },
            null,
            null,
            null,
            null,
            null,
            null,
          ],
        ],
        year: 2026,
      })
    );
    expect(rolling.months).toEqual([{ label: "Jan", week: 1 }]);
  });

  test("orders years oldest first", () => {
    const sources = graphSourcesOf([
      { ...calendar, year: 2025 },
      { ...calendar, year: 2023 },
    ]);
    expect(sources.map((source) => source.year)).toEqual([2023, 2025]);
  });
});

describe("stepCell", () => {
  test("moves by week sideways and by weekday vertically", () => {
    const from = { week: 1, weekday: 2 };
    expect(stepCell(year, { week: 1, weekday: 0 }, "ArrowRight")?.date).toBe(
      "2025-01-12"
    );
    expect(stepCell(year, from, "ArrowDown")?.date).toBe("2025-01-08");
    expect(stepCell(year, from, "ArrowUp")?.date).toBe("2025-01-06");
    expect(stepCell(year, { week: 1, weekday: 3 }, "ArrowLeft")?.date).toBe(
      "2025-01-01"
    );
  });

  test("skips blank cells and stops at the edges", () => {
    expect(stepCell(year, { week: 1, weekday: 0 }, "ArrowLeft")).toBeNull();
    expect(stepCell(year, { week: 1, weekday: 4 }, "ArrowRight")).toBeNull();
    expect(stepCell(year, { week: 0, weekday: 3 }, "ArrowUp")).toBeNull();
    expect(stepCell(year, { week: 1, weekday: 6 }, "ArrowDown")).toBeNull();
  });

  test("jumps to the first and latest day", () => {
    const from = { week: 1, weekday: 3 };
    expect(stepCell(year, from, "Home")?.date).toBe("2025-01-01");
    expect(stepCell(year, from, "End")?.date).toBe("2025-01-13");
  });

  test("ignores other keys", () => {
    expect(stepCell(year, { week: 1, weekday: 3 }, "Enter")).toBeNull();
  });
});

describe("readout", () => {
  test("shows the total and the busiest day at rest", () => {
    expect(restReadout(year)).toEqual({
      detail: "in 2025 · Busiest Jan 12 · 11",
      main: "31 contributions",
    });
  });

  test("names the rolling year for the last-year range", () => {
    expect(
      restReadout({
        ...year,
        busiest: null,
        caption: "in the last year",
        range: "last-year",
      })
    ).toEqual({
      detail: "in the last year · 2025",
      main: "31 contributions",
    });
  });

  test("shows the hovered day's date and count", () => {
    const day = dayAt(year, { week: 0, weekday: 5 });
    if (!day) {
      throw new Error("missing day");
    }
    expect(dayReadout(day)).toEqual({
      detail: "Fri Jan 3, 2025",
      main: "1 contribution",
    });
    expect(spokenDay(day)).toBe("Fri Jan 3, 2025, 1 contribution");
  });
});

describe("gazeYaw", () => {
  test("turns further left the further the day is from the companion", () => {
    const near = gazeYaw(900, 920, 900);
    const far = gazeYaw(20, 920, 900);
    expect(far).toBeLessThan(near);
    expect(near).toBeLessThan(0);
  });
});
