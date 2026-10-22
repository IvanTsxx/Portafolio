export const searchGroupOrder = [
  "pages",
  "sections",
  "notes",
  "experiments",
  "registry",
  "skills",
  "channels",
] as const;

export type SearchGroupId = (typeof searchGroupOrder)[number];

export const searchGroups = {
  channels: { label: "Channels" },
  experiments: { label: "Experiments" },
  notes: { label: "Notes" },
  pages: { label: "Pages" },
  registry: { label: "Registry" },
  sections: { label: "Sections" },
  skills: { label: "Skills" },
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
