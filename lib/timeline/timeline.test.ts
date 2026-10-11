import { describe, expect, test } from "bun:test";

import type { PinnedRepository } from "@/lib/github/model";
import type { Experience } from "@/lib/site/experience";
import { experience } from "@/lib/site/experience";

import {
  assignPointLanes,
  assignSpanLanes,
  buildTimeline,
  formatTenure,
  monthPosition,
  spanDates,
  yearTicks,
} from "./timeline";

const now = new Date("2026-10-10T12:00:00Z");

const job = (overrides: Partial<Experience>): Experience => ({
  company: "Company",
  end: "2024-01",
  id: "job",
  logo: "/logos/x.webp",
  role: "Frontend Developer",
  stack: [],
  start: "2023-01",
  summary: null,
  type: "Full-time",
  website: null,
  ...overrides,
});

const repository = (name: string, createdAt: string): PinnedRepository => ({
  createdAt,
  description: null,
  language: "TypeScript",
  name,
  nameWithOwner: `IvanTsxx/${name}`,
  stars: 1,
  visibility: "public",
});

describe("buildTimeline", () => {
  test("orders experience and repositories by date", () => {
    const timeline = buildTimeline({
      experience: [
        job({ end: null, id: "now", start: "2025-06" }),
        job({ end: "2023-06", id: "first", start: "2023-01" }),
      ],
      now,
      repositories: [
        repository("late", "2026-02-14"),
        repository("early", "2023-03-02"),
      ],
    });

    expect(timeline.entries.map((entry) => entry.id)).toEqual([
      "first",
      "IvanTsxx/early",
      "now",
      "IvanTsxx/late",
    ]);
  });

  test("a current role runs to today and is marked present", () => {
    const timeline = buildTimeline({
      experience: [job({ end: null, id: "now", start: "2026-04" })],
      now,
      repositories: [],
    });
    const [span] = timeline.spans;

    expect(span?.isCurrent).toBe(true);
    expect(span?.to).toBe(monthPosition("2026-10-10"));
    expect(span?.tenureMonths).toBe(7);
    expect(span ? spanDates(span) : null).toBe("2026.04 → Present");
    expect(timeline.now.date).toBe("2026-10-10");
  });

  test("the range starts in January of the first year and runs past today", () => {
    const timeline = buildTimeline({ experience, now, repositories: [] });

    expect(timeline.range.from).toBe(monthPosition("2023-01"));
    expect(timeline.range.to).toBeGreaterThan(timeline.now.at);
    expect(timeline.ticks.map((tick) => tick.year)).toEqual([
      2023, 2024, 2025, 2026,
    ]);
  });

  test("the real experience fits one lane because handoffs do not overlap", () => {
    const timeline = buildTimeline({ experience, now, repositories: [] });

    expect(timeline.spanLanes).toBe(1);
  });

  test("repositories created close together stack on separate lanes", () => {
    const timeline = buildTimeline({
      experience: [],
      now,
      repositories: [
        repository("a", "2026-04-07"),
        repository("b", "2026-04-18"),
        repository("c", "2026-09-01"),
      ],
    });

    expect(timeline.points.map((point) => [point.name, point.lane])).toEqual([
      ["a", 0],
      ["b", 1],
      ["c", 0],
    ]);
    expect(timeline.pointLanes).toBe(2);
  });
});

describe("assignSpanLanes", () => {
  test("overlapping spans take the lowest free lane", () => {
    const lanes = assignSpanLanes([
      { from: 0, id: "a", to: 10 },
      { from: 5, id: "b", to: 8 },
      { from: 9, id: "c", to: 12 },
      { from: 10, id: "d", to: 14 },
    ]);

    expect(lanes.map((span) => [span.id, span.lane])).toEqual([
      ["a", 0],
      ["b", 1],
      ["c", 1],
      ["d", 0],
    ]);
  });
});

describe("assignPointLanes", () => {
  test("points at least the gap apart share a lane", () => {
    expect(
      assignPointLanes([{ at: 4 }, { at: 0 }, { at: 1 }], 2).map(
        (point) => point.lane
      )
    ).toEqual([0, 1, 0]);
  });
});

describe("yearTicks", () => {
  test("marks every January inside the range", () => {
    expect(
      yearTicks(monthPosition("2023-05"), monthPosition("2025-01"))
    ).toEqual([
      { at: monthPosition("2024-01"), year: 2024 },
      { at: monthPosition("2025-01"), year: 2025 },
    ]);
  });
});

describe("formatTenure", () => {
  test("reads years and months", () => {
    expect(formatTenure(5)).toBe("5 mo");
    expect(formatTenure(12)).toBe("1 yr");
    expect(formatTenure(23)).toBe("1 yr 11 mo");
  });
});
