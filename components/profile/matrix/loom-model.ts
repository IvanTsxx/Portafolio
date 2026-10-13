import type { ContributionCalendar } from "@/lib/github/model";

export const DAYS = 7;
export const PIN_RISE = 3;

export interface LoomDay {
  count: number;
  date: string;
  day: number;
  week: number;
}

export interface LoomWeek {
  first: string;
  last: string;
  total: number;
  week: number;
}

export interface LoomYear {
  busiest: LoomDay | null;
  busiestWeeks: readonly number[];
  caption: string;
  cells: readonly (LoomDay | null)[];
  heights: readonly number[];
  range: ContributionCalendar["range"];
  total: number;
  weekTotals: readonly number[];
  weeks: readonly LoomWeek[];
  year: number;
}

const weekdayLabels = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

const monthLabels = [
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

const TOUR_WEEKS = 3;

const countFormat = new Intl.NumberFormat("en-US");

export const cellOf = (week: number, day: number) => week * DAYS + day;

export const pinHeightOf = (count: number) =>
  count > 0 ? PIN_RISE * Math.sqrt(count) : 0;

export const weekCountOf = (calendars: readonly ContributionCalendar[]) =>
  Math.max(1, ...calendars.map((calendar) => calendar.weeks.length));

const partsOf = (date: string) => {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

export const formatDay = (date: string) => {
  const time = partsOf(date);
  return `${weekdayLabels[time.getUTCDay()]} ${monthLabels[time.getUTCMonth()]} ${time.getUTCDate()}, ${time.getUTCFullYear()}`;
};

export const formatShortDay = (date: string) => {
  const time = partsOf(date);
  return `${monthLabels[time.getUTCMonth()]} ${time.getUTCDate()}`;
};

export const formatCount = (count: number) => countFormat.format(count);

export const contributionsText = (count: number) =>
  `${formatCount(count)} ${count === 1 ? "contribution" : "contributions"}`;

const weekOf = (
  cells: readonly (LoomDay | null)[],
  week: number
): LoomWeek | null => {
  const days = cells
    .slice(cellOf(week, 0), cellOf(week + 1, 0))
    .filter((day): day is LoomDay => day !== null);
  const [first] = days;
  const last = days.at(-1);
  if (!(first && last)) {
    return null;
  }
  return {
    first: first.date,
    last: last.date,
    total: days.reduce((sum, day) => sum + day.count, 0),
    week,
  };
};

export interface LoomSource {
  counts: readonly (number | null)[];
  firstDate: string;
  range: ContributionCalendar["range"];
  total: number;
  year: number;
}

const DAY_MS = 86_400_000;

const stampOf = (time: number) => new Date(time).toISOString().slice(0, 10);

export const loomSourceOf = (
  calendar: ContributionCalendar,
  weekCount: number
): LoomSource => {
  const counts: (number | null)[] = Array.from(
    { length: weekCount * DAYS },
    () => null
  );
  let firstDate: string | null = null;
  for (const [week, days] of calendar.weeks.entries()) {
    for (const [day, entry] of days.entries()) {
      if (entry && week < weekCount && day < DAYS) {
        const cell = cellOf(week, day);
        counts[cell] = entry.count;
        firstDate ??= stampOf(partsOf(entry.date).getTime() - cell * DAY_MS);
      }
    }
  }
  return {
    counts,
    firstDate: firstDate ?? `${calendar.year}-01-01`,
    range: calendar.range,
    total: calendar.total,
    year: calendar.year,
  };
};

export const loomSourcesOf = (calendars: readonly ContributionCalendar[]) => {
  const weekCount = weekCountOf(calendars);
  return calendars
    .map((calendar) => loomSourceOf(calendar, weekCount))
    .toSorted((a, b) => a.year - b.year);
};

export const loomYearOf = (source: LoomSource): LoomYear => {
  const start = partsOf(source.firstDate).getTime();
  const cells = source.counts.map((count, cell): LoomDay | null =>
    count === null
      ? null
      : {
          count,
          date: stampOf(start + cell * DAY_MS),
          day: cell % DAYS,
          week: Math.floor(cell / DAYS),
        }
  );
  const weekCount = Math.ceil(cells.length / DAYS);
  const weeks = Array.from({ length: weekCount }, (_, week) =>
    weekOf(cells, week)
  ).filter((week): week is LoomWeek => week !== null);
  let busiest: LoomDay | null = null;
  for (const cell of cells) {
    if (cell && cell.count > (busiest?.count ?? 0)) {
      busiest = cell;
    }
  }
  const busiestWeeks = weeks
    .filter((week) => week.total > 0)
    .toSorted((a, b) => b.total - a.total || a.week - b.week)
    .slice(0, TOUR_WEEKS)
    .map((week) => week.week);
  return {
    busiest,
    busiestWeeks,
    caption:
      source.range === "last-year" ? "in the last year" : `in ${source.year}`,
    cells,
    heights: cells.map((cell) => pinHeightOf(cell?.count ?? 0)),
    range: source.range,
    total: source.total,
    weekTotals: Array.from({ length: weekCount }, (_, week) =>
      cells
        .slice(cellOf(week, 0), cellOf(week + 1, 0))
        .reduce((sum, cell) => sum + (cell?.count ?? 0), 0)
    ),
    weeks,
    year: source.year,
  };
};

export const weekRangeText = (week: LoomWeek) =>
  `${formatShortDay(week.first)} – ${formatShortDay(week.last)}, ${partsOf(week.last).getUTCFullYear()}`;

export interface ReadoutText {
  detail: string;
  main: string;
}

const peakText = (year: LoomYear) =>
  year.busiest
    ? [`Peak ${formatShortDay(year.busiest.date)} · ${year.busiest.count}`]
    : [];

export const restText = (year: LoomYear): ReadoutText => ({
  detail: [
    year.range === "last-year"
      ? `${year.caption} · ${year.year}`
      : year.caption,
    ...peakText(year),
  ].join(" · "),
  main: contributionsText(year.total),
});

export const dayText = (day: LoomDay): ReadoutText => ({
  detail: formatDay(day.date),
  main: contributionsText(day.count),
});

export const weekText = (week: LoomWeek): ReadoutText => ({
  detail: `Week of ${weekRangeText(week)}`,
  main: contributionsText(week.total),
});

export const sweepText = (year: LoomYear, setSoFar: number): ReadoutText => ({
  detail: `Setting ${year.year} · ${formatCount(setSoFar)} of ${formatCount(year.total)}`,
  main: contributionsText(setSoFar),
});

export const spokenDay = (day: LoomDay) =>
  `${formatDay(day.date)}, ${contributionsText(day.count)}`;

export const loadedText = (year: LoomYear) =>
  `${year.year} loaded, ${contributionsText(year.total)} ${year.caption}`;
