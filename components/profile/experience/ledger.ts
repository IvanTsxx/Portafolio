import type { DossierFile, FileField } from "@/components/profile/dossier-file";
import { fileCode, hostOf } from "@/components/profile/dossier-file";
import { isRedacted } from "@/lib/github/privacy";
import type { Experience } from "@/lib/site/experience";
import { formatMonth } from "@/lib/site/experience";

export interface LedgerDetail {
  stack: readonly string[];
  summary: string | null;
}

export interface LedgerEntry {
  company: string;
  dates: string;
  detail: LedgerDetail | null;
  file: DossierFile;
  id: string;
  isCurrent: boolean;
  length: string;
  logo: string;
  ordinal: string;
  role: string;
  type: Experience["type"];
  year: string;
  years: string;
}

export type FiledFacts = Pick<
  LedgerEntry,
  | "company"
  | "dates"
  | "file"
  | "id"
  | "isCurrent"
  | "length"
  | "logo"
  | "ordinal"
  | "role"
  | "type"
  | "year"
  | "years"
>;

export interface Ledger {
  entries: readonly LedgerEntry[];
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

export const detailOf = (job: Experience): LedgerDetail | null =>
  isRedacted(job.company) || isRedacted(job.id)
    ? null
    : { stack: job.stack, summary: job.summary };

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
  const entries = newestFirst.map((job, index): LedgerEntry => {
    const startMonth = monthIndex(job.start, firstYear);
    const endMonth = monthIndex(job.end ?? nowStamp, firstYear) + 1;
    const isOpen = job.end === null;
    const detail = detailOf(job);
    const dates = formatDates(job.start, job.end);
    const length = durationText(endMonth - startMonth);
    return {
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
      isCurrent: isOpen,
      length,
      logo: job.logo,
      ordinal: String(newestFirst.length - index).padStart(2, "0"),
      role: job.role,
      type: job.type,
      year: job.start.slice(0, 4),
      years: `${job.start.slice(0, 4)}–${job.end ? job.end.slice(0, 4) : "now"}`,
    };
  });
  return { entries };
};

export const openingEntryOf = (
  entries: readonly Pick<LedgerEntry, "isCurrent">[]
) => {
  const index = entries.findIndex((entry) => entry.isCurrent);
  return index === -1 ? null : index;
};
