import { describe, expect, test } from "bun:test";

import { experience } from "@/lib/site/experience";

import { careerOf, detailText, formatDates, monthStampOf } from "./career";

const career = careerOf(experience, "2026-10");

describe("career gauge model", () => {
  test("orders jobs oldest first, one step per job", () => {
    expect(career.tenures.map((tenure) => tenure.company)).toEqual([
      "Doctor Qali",
      "Tensolite SA",
      "Aliva Shop",
      "basement studio",
    ]);
    expect(career.tenures.map((tenure) => tenure.step)).toEqual([0, 1, 2, 3]);
    expect(career.tenures.map((tenure) => tenure.isCurrent)).toEqual([
      false,
      false,
      false,
      true,
    ]);
  });

  test("places each job on a month scale from January of the first year", () => {
    expect(career.firstYear).toBe(2023);
    expect(career.tenures.map((tenure) => tenure.startMonth)).toEqual([
      0, 6, 29, 39,
    ]);
    expect(career.tenures.map((tenure) => tenure.endMonth)).toEqual([
      6, 11, 40, 46,
    ]);
  });

  test("counts both the first and the last month of a job", () => {
    expect(career.tenures.map((tenure) => tenure.months)).toEqual([
      6, 5, 11, 7,
    ]);
  });

  test("runs the scale to the end of the current year", () => {
    expect(career.months).toBe(48);
    expect(careerOf(experience, "2027-02").months).toBe(60);
  });

  test("reads the current job as open ended", () => {
    const current = career.tenures.at(-1);
    expect(current && detailText(current)).toBe(
      "Frontend Developer · Apr 2026 → now · 7 mo so far"
    );
    expect(formatDates("2023-01", "2023-06")).toBe("Jan 2023 → Jun 2023");
  });

  test("stamps a date as year and month", () => {
    expect(monthStampOf(new Date(2026, 9, 12))).toBe("2026-10");
    expect(monthStampOf(new Date(2027, 0, 1))).toBe("2027-01");
  });
});
