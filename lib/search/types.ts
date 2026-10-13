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
  channels: { label: "Channels" },
  lab: { label: "Lab" },
  notes: { label: "Notes" },
  pages: { label: "Pages" },
  registry: { label: "Registry" },
  sections: { label: "Sections" },
} as const satisfies Record<SearchGroupId, { label: string }>;

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
