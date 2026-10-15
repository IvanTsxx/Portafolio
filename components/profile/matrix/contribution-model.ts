import type {
  ContributionCalendar,
  ContributionLevel,
} from "@/lib/github/model";

export const WEEKDAYS = 7;

export interface GraphDay {
  count: number;
  date: string;
  level: ContributionLevel;
  week: number;
  weekday: number;
}

export type GraphWeek = readonly (GraphDay | null)[];

export interface MonthMark {
  label: string;
  week: number;
}

export interface GraphYear {
  busiest: GraphDay | null;
  caption: string;
  latestWeek: number;
  months: readonly MonthMark[];
  range: ContributionCalendar["range"];
  total: number;
  weeks: readonly GraphWeek[];
  year: number;
}

export interface CellPosition {
  week: number;
  weekday: number;
}

export interface ReadoutText {
  detail: string;
  main: string;
}

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const crowdedMonthWeeks = 3;

const countFormat = new Intl.NumberFormat("en-US");

const timeOf = (date: string) => {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

export const formatDay = (date: string) => {
  const time = timeOf(date);
  return `${weekdayNames[time.getUTCDay()]} ${monthNames[time.getUTCMonth()]} ${time.getUTCDate()}, ${time.getUTCFullYear()}`;
};

export const formatShortDay = (date: string) => {
  const time = timeOf(date);
  return `${monthNames[time.getUTCMonth()]} ${time.getUTCDate()}`;
};

export const contributionsText = (count: number) =>
  `${countFormat.format(count)} ${count === 1 ? "contribution" : "contributions"}`;

export const levelOf = (
  count: number,
  level: ContributionLevel
): ContributionLevel => {
  if (count <= 0) {
    return 0;
  }
  return level === 0 ? 1 : level;
};

const monthsOf = (weeks: readonly GraphWeek[]): MonthMark[] => {
  const marks: MonthMark[] = [];
  let lastMonth: number | null = null;
  for (const [week, days] of weeks.entries()) {
    const first = days.find((day) => day !== null);
    if (!first) {
      continue;
    }
    const month = timeOf(first.date).getUTCMonth();
    if (month !== lastMonth) {
      marks.push({ label: monthNames[month] ?? "", week });
      lastMonth = month;
    }
  }
  const [head, next] = marks;
  if (head && next && next.week - head.week < crowdedMonthWeeks) {
    return marks.slice(1);
  }
  return marks;
};

export interface GraphSource {
  counts: readonly (number | null)[];
  levels: string;
  range: ContributionCalendar["range"];
  start: string;
  total: number;
  year: number;
}

const dayMs = 86_400_000;

const stampOf = (time: number) => new Date(time).toISOString().slice(0, 10);

const isLevel = (value: number): value is ContributionLevel =>
  value >= 0 && value <= 4;

export const graphSourceOf = (calendar: ContributionCalendar): GraphSource => {
  const counts: (number | null)[] = [];
  let levels = "";
  let start: string | null = null;
  for (const days of calendar.weeks) {
    for (let weekday = 0; weekday < WEEKDAYS; weekday += 1) {
      const entry = days[weekday] ?? null;
      const cell = counts.length;
      counts.push(entry ? entry.count : null);
      levels += entry ? String(levelOf(entry.count, entry.level)) : "0";
      if (entry && start === null) {
        start = stampOf(timeOf(entry.date).getTime() - cell * dayMs);
      }
    }
  }
  return {
    counts,
    levels,
    range: calendar.range,
    start: start ?? `${calendar.year}-01-01`,
    total: calendar.total,
    year: calendar.year,
  };
};

export const graphSourcesOf = (calendars: readonly ContributionCalendar[]) =>
  calendars.toSorted((a, b) => a.year - b.year).map(graphSourceOf);

export const graphYearOf = (source: GraphSource): GraphYear => {
  const origin = timeOf(source.start).getTime();
  const weekCount = Math.ceil(source.counts.length / WEEKDAYS);
  const weeks = Array.from({ length: weekCount }, (_, week) =>
    Array.from({ length: WEEKDAYS }, (__, weekday): GraphDay | null => {
      const cell = week * WEEKDAYS + weekday;
      const count = source.counts[cell];
      if (count === null || count === undefined) {
        return null;
      }
      const level = Number(source.levels[cell] ?? 0);
      return {
        count,
        date: stampOf(origin + cell * dayMs),
        level: levelOf(count, isLevel(level) ? level : 0),
        week,
        weekday,
      };
    })
  );
  let busiest: GraphDay | null = null;
  let latestWeek = 0;
  for (const [week, days] of weeks.entries()) {
    for (const day of days) {
      if (day) {
        latestWeek = week;
        if (day.count > (busiest?.count ?? 0)) {
          busiest = day;
        }
      }
    }
  }
  return {
    busiest,
    caption:
      source.range === "last-year" ? "in the last year" : `in ${source.year}`,
    latestWeek,
    months: monthsOf(weeks),
    range: source.range,
    total: source.total,
    weeks,
    year: source.year,
  };
};

export const dayAt = (year: GraphYear, { week, weekday }: CellPosition) =>
  year.weeks[week]?.[weekday] ?? null;

const daysInOrder = (year: GraphYear) =>
  year.weeks.flatMap((days) =>
    days.filter((day): day is GraphDay => day !== null)
  );

export const firstDayOf = (year: GraphYear) => daysInOrder(year)[0] ?? null;

export const lastDayOf = (year: GraphYear) => daysInOrder(year).at(-1) ?? null;

const arrowSteps = new Map<string, CellPosition>([
  ["ArrowDown", { week: 0, weekday: 1 }],
  ["ArrowLeft", { week: -1, weekday: 0 }],
  ["ArrowRight", { week: 1, weekday: 0 }],
  ["ArrowUp", { week: 0, weekday: -1 }],
]);

export const stepCell = (
  year: GraphYear,
  from: CellPosition,
  key: string
): GraphDay | null => {
  if (key === "Home") {
    return firstDayOf(year);
  }
  if (key === "End") {
    return lastDayOf(year);
  }
  const step = arrowSteps.get(key);
  if (!step) {
    return null;
  }
  let week = from.week + step.week;
  let weekday = from.weekday + step.weekday;
  while (
    week >= 0 &&
    week < year.weeks.length &&
    weekday >= 0 &&
    weekday < WEEKDAYS
  ) {
    const day = dayAt(year, { week, weekday });
    if (day) {
      return day;
    }
    week += step.week;
    weekday += step.weekday;
  }
  return null;
};

export const restReadout = (year: GraphYear): ReadoutText => ({
  detail: [
    year.range === "last-year"
      ? `${year.caption} · ${year.year}`
      : year.caption,
    ...(year.busiest && year.busiest.count > 0
      ? [
          `Busiest ${formatShortDay(year.busiest.date)} · ${countFormat.format(year.busiest.count)}`,
        ]
      : []),
  ].join(" · "),
  main: contributionsText(year.total),
});

export const dayReadout = (day: GraphDay): ReadoutText => ({
  detail: formatDay(day.date),
  main: contributionsText(day.count),
});

export const spokenDay = (day: GraphDay) =>
  `${formatDay(day.date)}, ${contributionsText(day.count)}`;

export const gazeYaw = (targetX: number, standX: number, span: number) => {
  const share =
    span > 0 ? Math.min(1, Math.max(0, (standX - targetX) / span)) : 0;
  return -0.2 - share * 0.9;
};
