import type { DossierFile, FileField } from "@/components/profile/dossier-file";
import { fileCode, hostOf } from "@/components/profile/dossier-file";
import { isRedacted } from "@/lib/github/privacy";
import type { Experience } from "@/lib/site/experience";
import { formatMonth } from "@/lib/site/experience";

const RULER_LABEL_GAP = 0.1;

export interface LedgerBar {
  isOpen: boolean;
  span: number;
  start: number;
}

export interface LedgerDetail {
  stack: readonly string[];
  summary: string | null;
}

export interface LedgerEntry {
  bar: LedgerBar;
  company: string;
  dates: string;
  detail: LedgerDetail | null;
  file: DossierFile;
  id: string;
  length: string;
  months: number;
  ordinal: string;
  role: string;
  spoken: string;
  startMonth: number;
}

export interface RulerMark {
  at: number;
  label: string;
}

export interface Ledger {
  entries: readonly LedgerEntry[];
  firstYear: number;
  ruler: readonly RulerMark[];
  gridlines: readonly number[];
  scaleMonths: number;
}

const yearOf = (stamp: string) => Number(stamp.slice(0, 4));

const monthOf = (stamp: string) => Number(stamp.slice(5, 7)) || 1;

const monthIndex = (stamp: string, firstYear: number) =>
  (yearOf(stamp) - firstYear) * 12 + monthOf(stamp) - 1;

export const monthStampOf = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export const currentMonthStamp = () => monthStampOf(new Date());

export const formatDates = (start: string, end: string | null) =>
  `${formatMonth(start)} → ${end ? formatMonth(end) : "now"}`;

export const durationText = (months: number) => {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) {
    return `${rest} mo`;
  }
  return rest === 0 ? `${years} yr` : `${years} yr ${rest} mo`;
};

const spokenDuration = (months: number) => {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [
    years > 0 ? `${years} ${years === 1 ? "year" : "years"}` : null,
    rest > 0 ? `${rest} ${rest === 1 ? "month" : "months"}` : null,
  ].filter((part) => part !== null);
  return parts.join(" ");
};

export const detailOf = (job: Experience): LedgerDetail | null =>
  isRedacted(job.company) || isRedacted(job.id)
    ? null
    : { stack: job.stack, summary: job.summary };

export const barOf = (
  startMonth: number,
  endMonth: number,
  scaleMonths: number,
  isOpen: boolean
): LedgerBar => ({
  isOpen,
  span: (endMonth - startMonth) / scaleMonths,
  start: startMonth / scaleMonths,
});

export const rulerOf = (
  firstYear: number,
  scaleMonths: number
): RulerMark[] => {
  const years: RulerMark[] = [];
  for (let month = 0; month < scaleMonths; month += 12) {
    years.push({
      at: month / scaleMonths,
      label: String(firstYear + month / 12),
    });
  }
  return [
    ...years.filter((mark) => mark.at <= 1 - RULER_LABEL_GAP),
    { at: 1, label: "Now" },
  ];
};

const fileOf = (
  job: Experience,
  detail: LedgerDetail | null,
  length: string,
  code: string
): DossierFile => {
  const fields: FileField[] = [
    { label: "Dates", span: "full", value: formatDates(job.start, job.end) },
    { label: "Type", value: job.type },
    { label: "Length", value: length },
  ];
  return {
    chips:
      detail && detail.stack.length > 0
        ? { items: detail.stack, label: "Stack" }
        : null,
    code,
    fields,
    kicker: job.role,
    links: job.website
      ? [{ href: job.website, label: hostOf(job.website) }]
      : [],
    note: detail?.summary ? { label: "Summary", text: detail.summary } : null,
    title: job.company,
  };
};

export const ledgerOf = (
  jobs: readonly Experience[],
  nowStamp: string,
  section: string
): Ledger => {
  const newestFirst = jobs.toSorted((first, second) =>
    second.start.localeCompare(first.start)
  );
  const firstYear = yearOf(newestFirst.at(-1)?.start ?? nowStamp);
  const scaleMonths = monthIndex(nowStamp, firstYear) + 1;
  const entries = newestFirst.map((job, index): LedgerEntry => {
    const startMonth = monthIndex(job.start, firstYear);
    const endMonth = monthIndex(job.end ?? nowStamp, firstYear) + 1;
    const months = endMonth - startMonth;
    const isOpen = job.end === null;
    const detail = detailOf(job);
    const dates = formatDates(job.start, job.end);
    const length = durationText(months);
    return {
      bar: barOf(startMonth, endMonth, scaleMonths, isOpen),
      company: job.company,
      dates,
      detail,
      file: fileOf(
        job,
        detail,
        isOpen ? `${length} so far` : length,
        fileCode(section, newestFirst.length - 1 - index, newestFirst.length)
      ),
      id: job.id,
      length,
      months,
      ordinal: String(newestFirst.length - index).padStart(2, "0"),
      role: job.role,
      spoken: `${job.company}, ${job.role}, ${dates.replace("→", "to")}, ${spokenDuration(months)}, ${job.type}`,
      startMonth,
    };
  });
  return {
    entries,
    firstYear,
    gridlines: Array.from(
      { length: Math.ceil(scaleMonths / 12) },
      (_, index) => (index * 12) / scaleMonths
    ),
    ruler: rulerOf(firstYear, scaleMonths),
    scaleMonths,
  };
};
