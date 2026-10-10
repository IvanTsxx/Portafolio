export const searchGroupOrder = [
  "pages",
  "sections",
  "notes",
  "lab",
  "registry",
  "channels",
] as const;

export type SearchGroupId = (typeof searchGroupOrder)[number];

export const searchGroups = {
  channels: { jp: "経路", label: "Channels" },
  lab: { jp: "実験", label: "Lab" },
  notes: { jp: "手記", label: "Notes" },
  pages: { jp: "頁", label: "Pages" },
  registry: { jp: "登録簿", label: "Registry" },
  sections: { jp: "節", label: "Sections" },
} as const satisfies Record<SearchGroupId, { jp: string; label: string }>;

export type SearchAction =
  | { type: "route"; href: string }
  | { type: "external"; href: string }
  | { type: "copy"; value: string };

export interface SearchEntry {
  action: SearchAction;
  code: string;
  detail: string;
  group: SearchGroupId;
  id: string;
  keywords: readonly string[];
  title: string;
}
