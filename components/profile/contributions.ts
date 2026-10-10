import type {
  ContributionCalendar,
  ContributionDay,
  ContributionWeek,
} from "@/lib/github/model";

export interface MonthLabel {
  label: string;
  column: number;
}

export interface ContributionStreak {
  length: number;
  start: string | null;
  end: string | null;
}

export interface ContributionStats {
  activeDays: number;
  currentStreak: ContributionStreak;
  longestStreak: ContributionStreak;
  busiestDay: ContributionDay | null;
  busiestWeekday: { label: string; total: number };
  dailyAverage: number;
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

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const kanjiDigits = [
  "〇",
  "一",
  "二",
  "三",
  "四",
  "五",
  "六",
  "七",
  "八",
  "九",
] as const;

const kanjiMonths = [
  "一",
  "二",
  "三",
  "四",
  "五",
  "六",
  "七",
  "八",
  "九",
  "十",
  "十一",
  "十二",
] as const;

const DAYS_PER_WEEK = 7;

const emptyStreak: ContributionStreak = { end: null, length: 0, start: null };

const monthLabelOf = (date: string) =>
  monthLabels[Number(date.slice(5, 7)) - 1] ?? "";

export const calendarCaption = (calendar: ContributionCalendar) =>
  calendar.range === "last-year"
    ? { en: "in the last year", jp: "過去一年" }
    : { en: `in ${calendar.year}`, jp: `${calendar.year}年` };

export const monthLabelsFor = (weeks: readonly ContributionWeek[]) => {
  const labels: MonthLabel[] = [];
  for (const [column, week] of weeks.entries()) {
    const firstOfMonth = week.find((day) => day?.date.endsWith("-01"));
    if (firstOfMonth) {
      labels.push({ column, label: monthLabelOf(firstOfMonth.date) });
    }
  }
  const firstDay = weeks[0]?.find((day) => day !== null);
  const leadingRoom = labels[0]?.column ?? weeks.length;
  if (firstDay && leadingRoom >= 3 && labels[0]?.column !== 0) {
    labels.unshift({ column: 0, label: monthLabelOf(firstDay.date) });
  }
  return labels;
};

const longestRun = (days: readonly ContributionDay[]) => {
  let best = emptyStreak;
  let runStart = 0;
  for (const [index, day] of days.entries()) {
    if (day.count === 0) {
      runStart = index + 1;
    } else if (index - runStart + 1 > best.length) {
      best = {
        end: day.date,
        length: index - runStart + 1,
        start: days[runStart]?.date ?? day.date,
      };
    }
  }
  return best;
};

const trailingRun = (days: readonly ContributionDay[]): ContributionStreak => {
  let index = days.length - 1;
  while (index >= 0 && (days[index]?.count ?? 0) > 0) {
    index -= 1;
  }
  const length = days.length - 1 - index;
  if (length === 0) {
    return emptyStreak;
  }
  return {
    end: days.at(-1)?.date ?? null,
    length,
    start: days[index + 1]?.date ?? null,
  };
};

export const contributionStats = (
  calendar: ContributionCalendar
): ContributionStats => {
  const days = calendar.weeks
    .flat()
    .filter((day): day is ContributionDay => day !== null);
  const weekdayTotals = Array.from({ length: DAYS_PER_WEEK }, () => 0);
  for (const week of calendar.weeks) {
    for (const [weekday, day] of week.entries()) {
      weekdayTotals[weekday] =
        (weekdayTotals[weekday] ?? 0) + (day?.count ?? 0);
    }
  }
  const busiestWeekdayIndex = weekdayTotals.indexOf(Math.max(...weekdayTotals));
  let busiestDay: ContributionDay | null = null;
  for (const day of days) {
    if (day.count > (busiestDay?.count ?? 0)) {
      busiestDay = day;
    }
  }
  return {
    activeDays: days.filter((day) => day.count > 0).length,
    busiestDay,
    busiestWeekday: {
      label: weekdayLabels[busiestWeekdayIndex] ?? "",
      total: weekdayTotals[busiestWeekdayIndex] ?? 0,
    },
    currentStreak: trailingRun(days),
    dailyAverage: days.length === 0 ? 0 : calendar.total / days.length,
    longestStreak: longestRun(days),
  };
};

export const formatDayLabel = (date: string) => {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  const time = new Date(Date.UTC(year, month - 1, day));
  return `${weekdayLabels[time.getUTCDay()]} ${monthLabels[time.getUTCMonth()]} ${time.getUTCDate()}, ${time.getUTCFullYear()}`;
};

export const formatShortDay = (date: string) =>
  `${monthLabelOf(date)} ${Number(date.slice(8, 10))}`;

export const formatMonth = (year: number, month: number) => {
  const kanjiYear = [...String(year)]
    .map((digit) => kanjiDigits[Number(digit)])
    .join("");
  return {
    en: `${monthNames[month - 1]} ${year}`,
    jp: `${kanjiYear}年${kanjiMonths[month - 1]}月`,
  };
};
