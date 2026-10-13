import type { DossierFile } from "@/components/profile/dossier-file";
import { fileCode, hostOf } from "@/components/profile/dossier-file";
import { isRedacted } from "@/lib/github/privacy";
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
    const isEmployerOnly = isRedacted(job.company) || isRedacted(job.id);
    return {
      company: job.company,
      dates: formatDates(job.start, job.end),
      endMonth,
      id: job.id,
      isCurrent: job.end === null,
      months: endMonth - startMonth,
      role: job.role,
      stack: isEmployerOnly ? [] : job.stack,
      startMonth,
      step,
      summary: isEmployerOnly ? null : job.summary,
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

export const lineText = (tenure: Tenure) =>
  tenure.summary ? `${tenure.role} · ${tenure.summary}` : tenure.role;

const lengthText = (tenure: Tenure) =>
  `${tenure.months} ${tenure.months === 1 ? "month" : "months"}${tenure.isCurrent ? " so far" : ""}`;

export const tenureFile = (
  tenure: Tenure,
  section: string,
  count: number
): DossierFile => ({
  chips:
    tenure.stack.length > 0 ? { items: tenure.stack, label: "Stack" } : null,
  code: fileCode(section, tenure.step, count),
  fields: [
    { label: "Dates", span: "full", value: tenure.dates },
    { label: "Type", value: tenure.type },
    { label: "Length", value: lengthText(tenure) },
  ],
  kicker: tenure.role,
  links: tenure.website
    ? [{ href: tenure.website, label: hostOf(tenure.website) }]
    : [],
  note: tenure.summary ? { label: "Summary", text: tenure.summary } : null,
  title: tenure.company,
});

export const currentMonthStamp = () => monthStampOf(new Date());
