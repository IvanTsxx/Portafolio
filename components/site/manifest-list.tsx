import {
  ArrowUpRightIcon,
  FileCssIcon,
  FileIcon,
  FileMdIcon,
  FileTsIcon,
  FileTsxIcon,
  PackageIcon,
  PuzzlePieceIcon,
} from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";

import { ScrollFade } from "@/components/site/scroll-fade";
import { focusRingClassName } from "@/components/site/styles";
import { glyphOf } from "@/lib/site/manifest";
import type { ManifestEntry, ManifestGlyph } from "@/lib/site/manifest";
import { cn } from "@/lib/utils";

const glyphClassName =
  "text-faint group-hover/entry:text-foreground size-4 shrink-0 transition-colors duration-200";

const glyphs = {
  css: <FileCssIcon aria-hidden className={glyphClassName} weight="light" />,
  file: <FileIcon aria-hidden className={glyphClassName} weight="light" />,
  md: <FileMdIcon aria-hidden className={glyphClassName} weight="light" />,
  package: (
    <PackageIcon aria-hidden className={glyphClassName} weight="light" />
  ),
  registry: (
    <PuzzlePieceIcon aria-hidden className={glyphClassName} weight="light" />
  ),
  ts: <FileTsIcon aria-hidden className={glyphClassName} weight="light" />,
  tsx: <FileTsxIcon aria-hidden className={glyphClassName} weight="light" />,
} as const satisfies Record<ManifestGlyph, ReactNode>;

const EntryBody = ({ entry }: { entry: ManifestEntry }) => (
  <>
    {glyphs[glyphOf(entry)]}
    <span className="text-foreground mr-auto min-w-0 truncate font-mono text-xs">
      {entry.name}
    </span>
    {entry.detail ? (
      <span className="text-faint min-w-0 shrink-0 truncate text-right font-mono text-xs">
        {entry.detail}
      </span>
    ) : null}
    {entry.href ? (
      <ArrowUpRightIcon
        aria-hidden
        className="text-faint group-hover/entry:text-foreground ease-out-quart size-3 shrink-0 transition-transform duration-200 group-hover/entry:translate-x-0.5 group-hover/entry:-translate-y-0.5"
      />
    ) : null}
  </>
);

const rowClassName =
  "group/entry flex min-h-10 items-center gap-3 px-3 py-2 transition-colors duration-200";

export const ManifestList = ({
  className,
  entries,
  title,
}: {
  className?: string;
  entries: readonly ManifestEntry[];
  title?: string;
}) => (
  <section className={cn("flex min-w-0 flex-col gap-2", className)}>
    {title ? (
      <header className="label text-faint flex items-baseline justify-between gap-4">
        <h3>{title}</h3>
        <span className="tabular-nums">
          {String(entries.length).padStart(2, "0")}
        </span>
      </header>
    ) : null}
    <div className="border-border bg-surface/40 overflow-hidden rounded-sm border">
      <ScrollFade className="max-h-96">
        <ul className="divide-border divide-y">
          {entries.map((entry) => (
            <li key={`${entry.name}-${entry.detail ?? ""}`}>
              {entry.href ? (
                <a
                  className={cn(
                    rowClassName,
                    "hover:bg-surface",
                    focusRingClassName
                  )}
                  href={entry.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <EntryBody entry={entry} />
                </a>
              ) : (
                <div className={cn(rowClassName, "hover:bg-surface")}>
                  <EntryBody entry={entry} />
                </div>
              )}
            </li>
          ))}
        </ul>
      </ScrollFade>
    </div>
  </section>
);
