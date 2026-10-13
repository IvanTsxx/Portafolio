import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  AdjacentLink,
  CaseStudyLinks,
  CaseStudySections,
} from "@/components/content/note-detail";
import { NoteRow } from "@/components/content/note-row";
import { SampleBadge } from "@/components/content/sample-badge";
import { DocumentHero } from "@/components/site/document-hero";
import { DocumentSection } from "@/components/site/document-section";
import { JsonLd } from "@/components/site/json-ld";
import { OpenInMenu } from "@/components/site/open-in-menu";
import { chipClassName } from "@/components/site/styles";
import { buildNoteMetadata } from "@/lib/content/metadata";
import {
  formatNoteCode,
  leadSectionCount,
  noteKinds,
  notePath,
  noteSource,
  stampOf,
  toNoteIndexItem,
} from "@/lib/content/note-domain";
import {
  getAdjacentNotes,
  getNote,
  getNotes,
  getNoteSlugs,
  getRelatedNotes,
} from "@/lib/content/notes";
import { markdownPathOf } from "@/lib/markdown/paths";
import { sectionScripts } from "@/lib/site/section-scripts";
import { noteJsonLd } from "@/lib/site/structured-data";

export const dynamicParams = false;

export const generateStaticParams = async () => {
  const slugs = await getNoteSlugs();
  return slugs.map((slug) => ({ slug }));
};

export const generateMetadata = async ({
  params,
}: PageProps<"/notes/[slug]">): Promise<Metadata> => {
  const { slug } = await params;
  const document = await getNote(slug);
  return document ? buildNoteMetadata(document.entry) : {};
};

const pad = (value: number) => String(value).padStart(2, "0");

const NotePage = async ({ params }: PageProps<"/notes/[slug]">) => {
  const { slug } = await params;
  const document = await getNote(slug);
  if (!document) {
    notFound();
  }

  const { Content, entry: note } = document;
  const [notes, adjacent] = await Promise.all([
    getNotes(),
    getAdjacentNotes(note.slug),
  ]);
  const related = await getRelatedNotes(note, {
    exclude: [adjacent.newer?.slug, adjacent.older?.slug].filter(
      (adjacentSlug) => adjacentSlug !== undefined
    ),
  });
  const code = formatNoteCode(notes.findIndex((item) => item.slug === slug));
  const kind = noteKinds[note.kind];
  const { stack, tags } = toNoteIndexItem(note);
  const topicLinks = [
    ...tags.map((topic) => ({ param: "tag", topic })),
    ...stack.map((topic) => ({ param: "stack", topic })),
  ];
  const proseSectionCount = note.kind === "note" ? 1 : 0;
  const relatedIndex = `${code}.${leadSectionCount(note) + proseSectionCount + 1}`;

  return (
    <>
      <DocumentHero
        back={{ href: "/notes", label: "Notes" }}
        code={code}
        meta={[
          { label: "Kind", value: kind.label },
          { label: "Stamp", value: stampOf(note).label },
          { label: "Read", value: `${pad(note.readingTimeMinutes)} min` },
        ]}
        size="title"
        title={note.title}
      >
        <p className="text-graphite max-w-prose text-base text-pretty">
          {note.summary}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {note.sample ? <SampleBadge source={noteSource(note.slug)} /> : null}
          <ul className="flex flex-wrap gap-2">
            {topicLinks.map(({ param, topic }) => (
              <li key={topic}>
                <Link
                  className={chipClassName}
                  href={`/notes?${param}=${encodeURIComponent(topic)}`}
                >
                  {topic}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {note.kind === "case-study" ? (
          <CaseStudyLinks caseStudy={note} />
        ) : null}
        <OpenInMenu markdownPath={markdownPathOf(notePath(note.slug))} />
      </DocumentHero>
      <JsonLd data={noteJsonLd(note)} />
      {note.kind === "case-study" ? (
        <CaseStudySections caseStudy={note} code={code} />
      ) : null}

      {note.kind === "case-study" ? (
        <div
          className="group/prose max-w-3xl min-w-0 [counter-reset:section] [&_img]:h-auto [&_img]:max-w-full"
          data-numbered
        >
          <Content />
        </div>
      ) : (
        <DocumentSection
          id="text"
          index={`${code}.1`}
          label="Text"
          script={sectionScripts.noteText}
        >
          <div className="max-w-3xl min-w-0 [&_img]:h-auto [&_img]:max-w-full">
            <Content />
          </div>
        </DocumentSection>
      )}

      {adjacent.newer || adjacent.older ? (
        <nav aria-label="More notes" className="grid gap-4 md:grid-cols-2">
          <AdjacentLink direction="newer" note={adjacent.newer} />
          <AdjacentLink direction="older" note={adjacent.older} />
        </nav>
      ) : null}

      {related.length > 0 ? (
        <DocumentSection
          aside={pad(related.length)}
          id="related"
          index={relatedIndex}
          label="Related"
        >
          <ul className="border-rule border-t">
            {related.map((item) => (
              <NoteRow
                code={formatNoteCode(
                  notes.findIndex((entry) => entry.slug === item.slug)
                )}
                density="compact"
                key={item.slug}
                note={toNoteIndexItem(item)}
              />
            ))}
          </ul>
        </DocumentSection>
      ) : null}
    </>
  );
};

export default NotePage;
