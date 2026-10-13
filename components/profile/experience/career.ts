import type { Experience } from "@/lib/site/experience";
import { formatMonth } from "@/lib/site/experience";

export interface Tenure {
  company: string;
  dates: string;
  endMonth: number;
  id: string;
  isCurrent: boolean;
  months: number;
  role: string;
  stack: readonly string[];
  startMonth: number;
  step: number;
  summary: string | null;
  type: Experience["type"];
  website: string | null;
  year: string;
}

export interface Career {
  firstYear: number;
  months: number;
  tenures: readonly Tenure[];
}

const yearOf = (stamp: string) => Number(stamp.slice(0, 4));

const monthOf = (stamp: string) => Number(stamp.slice(5, 7)) || 1;

export const monthIndex = (stamp: string, firstYear: number) =>
  (yearOf(stamp) - firstYear) * 12 + monthOf(stamp) - 1;

export const monthStampOf = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export const formatDates = (start: string, end: string | null) =>
  `${formatMonth(start)} → ${end ? formatMonth(end) : "now"}`;

export const careerOf = (
  jobs: readonly Experience[],
  nowStamp: string
): Career => {
  const sorted = jobs.toSorted((first, second) =>
    first.start.localeCompare(second.start)
  );
  const firstYear = yearOf(sorted[0]?.start ?? nowStamp);
  const tenures = sorted.map((job, step): Tenure => {
    const startMonth = monthIndex(job.start, firstYear);
    const endMonth = monthIndex(job.end ?? nowStamp, firstYear) + 1;
    return {
      company: job.company,
      dates: formatDates(job.start, job.end),
      endMonth,
      id: job.id,
      isCurrent: job.end === null,
      months: endMonth - startMonth,
      role: job.role,
      stack: job.stack,
      startMonth,
      step,
      summary: job.summary,
      type: job.type,
      website: job.website,
      year: job.start.slice(0, 4),
    };
  });
  const lastMonth = Math.max(
    monthIndex(nowStamp, firstYear) + 1,
    ...tenures.map((tenure) => tenure.endMonth)
  );
  return {
    firstYear,
    months: Math.ceil(lastMonth / 12) * 12,
    tenures,
  };
};

export const spanText = (tenure: Tenure) =>
  `${tenure.months} mo${tenure.isCurrent ? " so far" : ""}`;

export const detailText = (tenure: Tenure) =>
  `${tenure.role} · ${tenure.dates} · ${spanText(tenure)}`;

export const spokenText = (tenure: Tenure) =>
  `${tenure.company}, ${tenure.role}, ${tenure.dates.replace("→", "to")}, ${spanText(tenure)}, ${tenure.type}`;

export const glanceText = (tenure: Tenure) =>
  tenure.summary ?? (tenure.isCurrent ? `${tenure.role}, now` : tenure.role);

export const hostOf = (website: string) =>
  website.replace(/^https?:\/\/(?:www\.)?/u, "").replace(/\/$/u, "");

export const currentMonthStamp = () => monthStampOf(new Date());
