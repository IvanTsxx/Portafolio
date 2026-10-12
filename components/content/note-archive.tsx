"use client";

import { NoteRow } from "@/components/content/note-row";
import { useNoteFilter } from "@/components/content/use-note-filter";
import { DocumentSection } from "@/components/site/document-section";
import { chipClassName } from "@/components/site/styles";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { formatNoteCode, matchesNoteFilter } from "@/lib/content/note-domain";
import type { NoteFacets, NoteIndexItem } from "@/lib/content/note-domain";
import { sectionScripts } from "@/lib/site/section-scripts";
import { cn } from "@/lib/utils";

const pad = (value: number) => String(value).padStart(2, "0");

export const NoteArchive = ({
  facets,
  notes,
}: {
  facets: NoteFacets;
  notes: readonly NoteIndexItem[];
}) => {
  const { clear, filter } = useNoteFilter(facets);
  const visibleNotes = notes.filter((note) => matchesNoteFilter(note, filter));

  return (
    <DocumentSection
      aside={`${pad(visibleNotes.length)} / ${pad(notes.length)}`}
      id="archive"
      index="NT-03"
      jp="記録"
      label="Archive"
      script={sectionScripts.notesArchive}
    >
      <output aria-live="polite" className="sr-only">
        Showing {visibleNotes.length} of {notes.length}
      </output>
      {visibleNotes.length > 0 ? (
        <ul className="border-rule border-t">
          {visibleNotes.map((note) => (
            <NoteRow
              code={formatNoteCode(notes.indexOf(note))}
              key={note.slug}
              note={note}
            />
          ))}
        </ul>
      ) : (
        <Empty className="border-rule-strong border py-16">
          <EmptyHeader>
            <EmptyTitle className="label text-ink">No match</EmptyTitle>
            <EmptyDescription className="label text-graphite">
              Nothing fits that combination of filters.
            </EmptyDescription>
          </EmptyHeader>
          <button
            className={cn(chipClassName, "justify-center")}
            onClick={clear}
            type="button"
          >
            Clear filters
          </button>
        </Empty>
      )}
    </DocumentSection>
  );
};
