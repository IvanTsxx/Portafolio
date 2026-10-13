import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import Link from "next/link";

import { SampleBadge } from "@/components/content/sample-badge";
import { CornerMarks } from "@/components/site/corner-marks";
import { hoverRowClassName } from "@/components/site/styles";
import { noteKinds, notePath, noteSource } from "@/lib/content/note-domain";
import type { NoteIndexItem } from "@/lib/content/note-domain";
import { cn } from "@/lib/utils";

const noteTitleVariants = cva("display text-ink text-balance", {
  defaultVariants: { density: "roomy" },
  variants: {
    density: {
      compact: "text-2xl",
      roomy: "text-3xl lg:text-4xl",
    },
  },
});

const kindBadgeVariants = cva("label w-fit border px-1.5 py-0.5", {
  variants: {
    kind: {
      "case-study": "border-ink bg-ink text-paper",
      note: "border-rule-strong text-graphite",
    } satisfies Record<NoteIndexItem["kind"], string>,
  },
});

const visibleTopicCount = 4;

export const NoteRow = ({
  code,
  density,
  note,
}: {
  code: string;
  note: NoteIndexItem;
} & VariantProps<typeof noteTitleVariants>) => {
  const kind = noteKinds[note.kind];
  const topics = note.kind === "note" ? note.tags : note.stack;
  const hiddenTopicCount = Math.max(0, topics.length - visibleTopicCount);

  return (
    <li
      className={cn(
        "group/marks border-rule relative border-b",
        hoverRowClassName
      )}
    >
      <CornerMarks reveal="hover" />
      <div className="grid gap-x-4 gap-y-4 p-4 md:p-5 lg:grid-cols-12">
        <div className="label text-mist flex flex-wrap items-center gap-x-4 gap-y-2 lg:col-span-3 lg:flex-col lg:items-start">
          <span className="tabular-nums">{code}</span>
          <time className="tabular-nums" dateTime={note.stamp.dateTime}>
            {note.stamp.label}
          </time>
          <span className={kindBadgeVariants({ kind: note.kind })}>
            {kind.label}
          </span>
        </div>
        <div className="flex flex-col items-start gap-3 lg:col-span-9">
          <h3 className={cn(noteTitleVariants({ density }), "w-full")}>
            <Link
              className="flex items-start justify-between gap-4 outline-none after:absolute after:inset-0"
              href={notePath(note.slug)}
            >
              <span>{note.title}</span>
              <ArrowUpRightIcon
                aria-hidden
                className="text-ink ease-out-quart mt-1 hidden size-6 shrink-0 -translate-x-2 opacity-0 transition-[opacity,translate] duration-300 group-focus-within/marks:translate-x-0 group-focus-within/marks:opacity-100 group-hover/marks:translate-x-0 group-hover/marks:opacity-100 lg:block"
              />
            </Link>
          </h3>
          <p className="text-graphite max-w-prose text-sm text-pretty">
            {note.summary}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <ul className="flex flex-wrap gap-2">
              {topics.slice(0, visibleTopicCount).map((topic) => (
                <li
                  className="label border-rule-strong text-graphite border px-2 py-1"
                  key={topic}
                >
                  {topic}
                </li>
              ))}
              {hiddenTopicCount > 0 ? (
                <li className="label text-mist px-1 py-1 tabular-nums">
                  +{String(hiddenTopicCount).padStart(2, "0")}
                </li>
              ) : null}
            </ul>
            <span className="label text-mist tabular-nums">
              {String(note.readingTimeMinutes).padStart(2, "0")} min
            </span>
            {note.sample ? (
              <SampleBadge source={noteSource(note.slug)} />
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
};
