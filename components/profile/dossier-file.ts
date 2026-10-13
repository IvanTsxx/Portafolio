import { formatMonth } from "@/lib/site/experience";

export interface FileField {
  label: string;
  span?: "full" | "half";
  value: string;
}

export interface FileLink {
  href: string;
  label: string;
}

export interface DossierFile {
  chips: { items: readonly string[]; label: string } | null;
  code: string;
  fields: readonly FileField[];
  kicker: string;
  links: readonly FileLink[];
  note: { label: string; text: string } | null;
  title: string;
}

export const fileCode = (section: string, index: number, count: number) =>
  `${section} · File ${String(index + 1).padStart(2, "0")}/${String(count).padStart(2, "0")}`;

export const formatDay = (isoDate: string) => {
  const [year = "", month = "1", day = ""] = isoDate.split("-");
  return `${Number(day)} ${formatMonth(`${year}-${month}`)}`;
};

export const hostOf = (url: string) =>
  url.replace(/^https?:\/\/(?:www\.)?/u, "").replace(/\/$/u, "");
