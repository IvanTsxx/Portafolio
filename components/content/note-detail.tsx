import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { Figure } from "@/components/content/figure";
import { Video } from "@/components/content/video";
import { CornerMarks } from "@/components/site/corner-marks";
import { DocumentSection } from "@/components/site/document-section";
import { focusRingClassName, linkClassName } from "@/components/site/styles";
import {
  hasPreviewSection,
  noteKinds,
  notePath,
} from "@/lib/content/note-domain";
import type { CaseStudy, Note } from "@/lib/content/note-domain";
import { sectionScripts } from "@/lib/site/section-scripts";
import { cn } from "@/lib/utils";

const pad = (value: number) => String(value).padStart(2, "0");

const Previews = ({ caseStudy }: { caseStudy: CaseStudy }) => {
  if (caseStudy.previews.length === 0) {
    return (
      <div className="hatch border-rule-strong bg-popover relative grid min-h-48 place-items-center border md:min-h-72">
        <CornerMarks />
        <p className="label text-graphite">Preview slot</p>
      </div>
    );
  }
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {caseStudy.previews.map((preview, index) => (
        <div
          className={cn(index === 0 && "md:col-span-2")}
          key={`${preview.kind}-${preview.src}`}
        >
          {preview.kind === "image" ? (
            <Figure
              alt={preview.alt}
              caption={preview.caption}
              className="my-0"
              height={preview.height}
              priority={index === 0}
              sizes="(min-width: 1024px) 60vw, 100vw"
              src={preview.src}
              width={preview.width}
            />
          ) : (
            <Video
              alt={preview.alt}
              caption={preview.caption}
              className="my-0"
              height={preview.height}
              poster={preview.poster}
              src={preview.src}
              width={preview.width}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export const AdjacentLink = ({
  direction,
  note,
}: {
  direction: "newer" | "older";
  note: Note | undefined;
}) => {
  if (!note) {
    return <div />;
  }
  const isNewer = direction === "newer";
  return (
    <Link
      className={cn(
        "group/marks border-rule-strong ease-mechanical hover:bg-paper-deep/60 relative flex min-h-11 flex-col gap-3 border p-5 transition-colors duration-100 md:p-6",
        focusRingClassName,
        !isNewer && "md:items-end md:text-right"
      )}
      href={notePath(note.slug)}
    >
      <CornerMarks reveal="hover" />
      <span className="label text-mist group-hover/marks:text-ink flex items-center gap-2 transition-colors">
        {isNewer ? <ArrowLeftIcon aria-hidden className="size-4" /> : null}
        {isNewer ? "Newer" : "Older"} · {noteKinds[note.kind].label}
        {isNewer ? null : <ArrowRightIcon aria-hidden className="size-4" />}
      </span>
      <span className="display text-ink text-2xl text-balance">
        {note.title}
      </span>
    </Link>
  );
};

export const CaseStudySections = ({
  caseStudy,
  code,
}: {
  caseStudy: CaseStudy;
  code: string;
}) => (
  <>
    <DocumentSection
      aside={pad(caseStudy.responsibilities.length)}
      id="responsibilities"
      index={`${code}.1`}
      label="Responsibilities"
      script={sectionScripts.noteResponsibilities}
    >
      <ul className="grid gap-x-8 sm:grid-cols-2">
        {caseStudy.responsibilities.map((responsibility) => (
          <li
            className="border-rule text-ink flex gap-3 border-b border-dotted py-3 text-sm text-pretty"
            key={responsibility}
          >
            <span aria-hidden className="bg-ink mt-1.5 size-1.5 shrink-0" />
            {responsibility}
          </li>
        ))}
      </ul>
    </DocumentSection>
    {hasPreviewSection(caseStudy) ? (
      <DocumentSection id="preview" index={`${code}.2`} label="Preview">
        <Previews caseStudy={caseStudy} />
      </DocumentSection>
    ) : null}
  </>
);

export const CaseStudyLinks = ({ caseStudy }: { caseStudy: CaseStudy }) =>
  caseStudy.links.length > 0 ? (
    <ul className="flex flex-wrap gap-x-6">
      {caseStudy.links.map((link) => (
        <li key={link.href}>
          <a
            className={cn(
              linkClassName,
              "text-ink inline-flex min-h-11 items-center gap-1 text-sm"
            )}
            href={link.href}
            rel="noopener noreferrer"
            target="_blank"
          >
            {link.label}
            <ArrowUpRightIcon aria-hidden className="size-3.5" />
          </a>
        </li>
      ))}
    </ul>
  ) : null;
