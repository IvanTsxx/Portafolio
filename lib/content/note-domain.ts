import type { ContentEntry } from "./collection";
import { countFacets } from "./facets";
import type { FacetCount } from "./facets";
import { formatPostDate } from "./format";
import type { NoteKind, NoteMeta } from "./schema";

export type Note = ContentEntry<NoteMeta>;
export type CaseStudy = Extract<Note, { kind: "case-study" }>;
export type FieldNote = Extract<Note, { kind: "note" }>;

export const noteKinds = {
  "case-study": { label: "Case study", plural: "Case studies" },
  note: { label: "Note", plural: "Notes" },
} as const satisfies Record<NoteKind, { label: string; plural: string }>;

export const noteKindOrder: readonly NoteKind[] = ["case-study", "note"];

export const isNoteKind = (value: string): value is NoteKind =>
  Object.hasOwn(noteKinds, value);

export interface NoteStamp {
  dateTime: string;
  label: string;
}

export interface NoteIndexItem {
  kind: NoteKind;
  readingTimeMinutes: number;
  sample: boolean;
  slug: string;
  stack: readonly string[];
  stamp: NoteStamp;
  summary: string;
  tags: readonly string[];
  title: string;
}

export interface NoteFilter {
  kind?: NoteKind;
  stack?: string;
  tag?: string;
}

export interface AdjacentNotes {
  newer: Note | undefined;
  older: Note | undefined;
}

export interface RelatedNotesOptions {
  exclude?: readonly string[];
  limit?: number;
}

export const notePath = (slug: string) => `/notes/${slug}` as const;

export const noteSource = (slug: string) => `content/notes/${slug}.mdx`;

export const stackOf = (note: Note) =>
  note.kind === "case-study" ? note.stack : [];

export const tagsOf = (note: Note) => (note.kind === "note" ? note.tags : []);

const topicsOf = (note: Note) => [...tagsOf(note), ...stackOf(note)];

const sortKeyOf = (note: Note) => note.date;

export const stampOf = (note: Note): NoteStamp => ({
  dateTime: note.date,
  label: formatPostDate(note.date),
});

export const toNoteIndexItem = (note: Note): NoteIndexItem => ({
  kind: note.kind,
  readingTimeMinutes: note.readingTimeMinutes,
  sample: note.sample,
  slug: note.slug,
  stack: stackOf(note),
  stamp: stampOf(note),
  summary: note.summary,
  tags: tagsOf(note),
  title: note.title,
});

export const compareNotes = (a: Note, b: Note) =>
  sortKeyOf(b).localeCompare(sortKeyOf(a)) || a.title.localeCompare(b.title);

export const matchesNoteFilter = (
  note: Pick<NoteIndexItem, "kind" | "stack" | "tags">,
  filter: NoteFilter
) =>
  (filter.kind === undefined || note.kind === filter.kind) &&
  (filter.tag === undefined || note.tags.includes(filter.tag)) &&
  (filter.stack === undefined || note.stack.includes(filter.stack));

export const findRelationIssues = (notes: readonly Note[]) => {
  const slugs = new Set(notes.map((note) => note.slug));
  return notes.flatMap((note) =>
    note.related.flatMap((related) => {
      if (related === note.slug) {
        return [`${note.slug} lists itself as related`];
      }
      return slugs.has(related)
        ? []
        : [`${note.slug} relates to unknown note "${related}"`];
    })
  );
};

export const pickRelatedNotes = (
  notes: readonly Note[],
  note: Note,
  { exclude = [], limit = 2 }: RelatedNotesOptions = {}
) => {
  const excluded = new Set([note.slug, ...exclude]);
  const listed = note.related.flatMap((slug) => {
    const related = notes.find((candidate) => candidate.slug === slug);
    return related && !excluded.has(related.slug) ? [related] : [];
  });
  const listedSlugs = new Set(listed.map((related) => related.slug));
  const topics = new Set(topicsOf(note));
  const ranked = notes
    .flatMap((candidate) => {
      if (excluded.has(candidate.slug) || listedSlugs.has(candidate.slug)) {
        return [];
      }
      const shared = topicsOf(candidate).filter((topic) =>
        topics.has(topic)
      ).length;
      return shared > 0 ? [{ candidate, shared }] : [];
    })
    .toSorted(
      (a, b) => b.shared - a.shared || compareNotes(a.candidate, b.candidate)
    )
    .map(({ candidate }) => candidate);
  return [...listed, ...ranked].slice(0, limit);
};

export const findAdjacentNotes = (
  notes: readonly Note[],
  slug: string
): AdjacentNotes => {
  const index = notes.findIndex((note) => note.slug === slug);
  if (index === -1) {
    return { newer: undefined, older: undefined };
  }
  return { newer: notes[index - 1], older: notes[index + 1] };
};

export const formatNoteCode = (position: number) =>
  `NT-${String(position + 1).padStart(2, "0")}`;

export interface NoteFacets {
  kinds: readonly { count: number; kind: NoteKind }[];
  stack: readonly FacetCount[];
  tags: readonly FacetCount[];
}

export const countNoteFacets = (notes: readonly Note[]): NoteFacets => ({
  kinds: noteKindOrder.map((kind) => ({
    count: notes.filter((note) => note.kind === kind).length,
    kind,
  })),
  stack: countFacets(notes.map(stackOf)),
  tags: countFacets(notes.map(tagsOf)),
});

export const hasPreviewSection = (caseStudy: CaseStudy) =>
  caseStudy.previews.length > 0 || caseStudy.sample;

export const leadSectionCount = (note: Note) => {
  if (note.kind !== "case-study") {
    return 0;
  }
  return hasPreviewSection(note) ? 2 : 1;
};
