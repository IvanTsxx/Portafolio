import type { PinnedRepository } from "@/lib/github/model";
import { experience as experienceEntries } from "@/lib/site/experience";
import type { Experience } from "@/lib/site/experience";

export interface TimelineSpan {
  kind: "experience";
  id: string;
  company: string;
  role: string;
  type: Experience["type"];
  logo: string;
  website: string | null;
  summary: string | null;
  stack: readonly string[];
  start: string;
  end: string | null;
  from: number;
  to: number;
  tenureMonths: number;
  isCurrent: boolean;
  lane: number;
}

export interface TimelinePoint {
  kind: "repository";
  id: string;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  visibility: PinnedRepository["visibility"];
  createdAt: string;
  url: string;
  at: number;
  lane: number;
}

export type TimelineEntry = TimelineSpan | TimelinePoint;

export interface YearTick {
  year: number;
  at: number;
}

export interface Timeline {
  entries: readonly TimelineEntry[];
  spans: readonly TimelineSpan[];
  points: readonly TimelinePoint[];
  ticks: readonly YearTick[];
  range: { from: number; to: number };
  now: { at: number; date: string };
  spanLanes: number;
  pointLanes: number;
}

export interface TimelineSources {
  experience: readonly Experience[];
  repositories: readonly PinnedRepository[];
  now: Date;
  pointGapMonths?: number;
  tailMonths?: number;
}

const monthsPerYear = 12;

const parseStamp = (stamp: string) => {
  const [year = 0, month = 1, day = 1] = stamp.split("-").map(Number);
  return { day, month, year };
};

const daysInMonth = (year: number, month: number) =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

export const monthPosition = (stamp: string) => {
  const { day, month, year } = parseStamp(stamp);
  return (
    year * monthsPerYear + (month - 1) + (day - 1) / daysInMonth(year, month)
  );
};

export const startOfEntry = (entry: TimelineEntry) =>
  entry.kind === "experience" ? entry.from : entry.at;

export const endOfEntry = (entry: TimelineEntry) =>
  entry.kind === "experience" ? entry.to : entry.at;

const monthIndex = (stamp: string) => {
  const { month, year } = parseStamp(stamp);
  return year * monthsPerYear + (month - 1);
};

export const assignSpanLanes = <Span extends { from: number; to: number }>(
  spans: readonly Span[]
) => {
  const laneEnds: number[] = [];
  return spans
    .toSorted((a, b) => a.from - b.from || a.to - b.to)
    .map((span) => {
      const free = laneEnds.findIndex((end) => end <= span.from);
      const lane = free === -1 ? laneEnds.length : free;
      laneEnds[lane] = span.to;
      return { ...span, lane };
    });
};

export const assignPointLanes = <Point extends { at: number }>(
  points: readonly Point[],
  gapMonths: number
) => {
  const laneLast: number[] = [];
  return points
    .toSorted((a, b) => a.at - b.at)
    .map((point) => {
      const free = laneLast.findIndex((last) => point.at - last >= gapMonths);
      const lane = free === -1 ? laneLast.length : free;
      laneLast[lane] = point.at;
      return { ...point, lane };
    });
};

export const yearTicks = (from: number, to: number): YearTick[] => {
  const ticks: YearTick[] = [];
  for (
    let year = Math.ceil(from / monthsPerYear);
    year * monthsPerYear <= to;
    year += 1
  ) {
    ticks.push({ at: year * monthsPerYear, year });
  }
  return ticks;
};

const toSpan = (
  entry: Experience,
  nowAt: number,
  nowStamp: string
): Omit<TimelineSpan, "lane"> => {
  const from = monthPosition(entry.start);
  const to = entry.end === null ? nowAt : monthPosition(entry.end);
  return {
    company: entry.company,
    end: entry.end,
    from,
    id: entry.id,
    isCurrent: entry.end === null,
    kind: "experience",
    logo: entry.logo,
    role: entry.role,
    stack: entry.stack,
    start: entry.start,
    summary: entry.summary,
    tenureMonths:
      monthIndex(entry.end ?? nowStamp) - monthIndex(entry.start) + 1,
    to: Math.max(to, from + 1),
    type: entry.type,
    website: entry.website,
  };
};

const toPoint = (
  repository: PinnedRepository
): Omit<TimelinePoint, "lane"> => ({
  at: monthPosition(repository.createdAt),
  createdAt: repository.createdAt,
  description: repository.description,
  id: repository.nameWithOwner,
  kind: "repository",
  language: repository.language,
  name: repository.name,
  stars: repository.stars,
  url: `https://github.com/${repository.nameWithOwner}`,
  visibility: repository.visibility,
});

export const laneCount = (entries: readonly { lane: number }[]) => {
  let count = 0;
  for (const entry of entries) {
    count = Math.max(count, entry.lane + 1);
  }
  return count;
};

const kindOrder = {
  experience: 0,
  repository: 1,
} as const satisfies Record<TimelineEntry["kind"], number>;

export const buildTimeline = ({
  experience,
  repositories,
  now,
  pointGapMonths = 1.5,
  tailMonths = 2,
}: TimelineSources): Timeline => {
  const nowDate = now.toISOString().slice(0, 10);
  const nowAt = monthPosition(nowDate);
  const spans = assignSpanLanes(
    experience.map((entry) => toSpan(entry, nowAt, nowDate))
  );
  const points = assignPointLanes(repositories.map(toPoint), pointGapMonths);
  const entries = [...spans, ...points].toSorted(
    (a, b) =>
      startOfEntry(a) - startOfEntry(b) || kindOrder[a.kind] - kindOrder[b.kind]
  );
  const earliest = Math.min(nowAt, ...entries.map(startOfEntry));
  const latest = Math.max(nowAt, ...entries.map(endOfEntry));
  const from = Math.floor(earliest / monthsPerYear) * monthsPerYear;
  const to = latest + tailMonths;

  return {
    entries,
    now: { at: nowAt, date: nowDate },
    pointLanes: laneCount(points),
    points,
    range: { from, to },
    spanLanes: laneCount(spans),
    spans,
    ticks: yearTicks(from, to),
  };
};

export const formatStamp = (stamp: string) =>
  stamp.slice(0, 7).replace("-", ".");

export const formatTenure = (months: number) => {
  const years = Math.floor(months / monthsPerYear);
  const rest = months % monthsPerYear;
  return [years > 0 ? `${years} yr` : null, rest > 0 ? `${rest} mo` : null]
    .filter(Boolean)
    .join(" ");
};

export const spanDates = (span: TimelineSpan) =>
  `${formatStamp(span.start)} → ${span.end ? formatStamp(span.end) : "Present"}`;

export const loadTimeline = (repositories: readonly PinnedRepository[]) =>
  buildTimeline({
    experience: experienceEntries,
    now: new Date(),
    repositories,
  });
