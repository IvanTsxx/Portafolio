import { buildNoteJsonLd } from "@/lib/content/metadata";
import type { FieldNote } from "@/lib/content/note-domain";

export const NoteJsonLd = ({ note }: { note: FieldNote }) => (
  <script type="application/ld+json">
    {JSON.stringify(buildNoteJsonLd(note)).replaceAll("<", String.raw`\u003c`)}
  </script>
);
