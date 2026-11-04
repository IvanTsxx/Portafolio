import Link from "next/link";

import { PhaseGlyph } from "@/components/site/phase-glyph";
import { focusRingClassName } from "@/components/site/styles";
import type { HomeRow } from "@/lib/site/home-sections";
import { cn } from "@/lib/utils";

export const SectionMark = ({
  id,
  label,
  phase,
}: {
  id: string;
  label: string;
  phase: number;
}) => (
  <h2
    className="label text-muted-foreground flex items-center gap-3"
    id={`${id}-label`}
  >
    <PhaseGlyph
      className="bg-background ring-background ring-4 lg:-ml-2"
      phase={phase}
    />
    <span>{label}</span>
    <span aria-hidden className="bg-border hidden h-px flex-1 lg:block" />
  </h2>
);

export const LeaderRows = ({
  more,
  rows,
}: {
  more?: { href: string; label: string };
  rows: readonly HomeRow[];
}) => (
  <div className="flex flex-col gap-1">
    <ol className="flex flex-col">
      {rows.map((row, position) => (
        <li key={row.href + row.title}>
          <Link
            className={cn(
              "group/row grid-leader lg:grid-leader-gutter grid items-baseline gap-x-3 py-2 lg:-ml-10 lg:gap-x-0",
              focusRingClassName
            )}
            href={row.href}
            rel={row.external ? "noopener" : undefined}
            target={row.external ? "_blank" : undefined}
          >
            <span className="label text-faint tabular-nums lg:pl-3">
              {String(position + 1).padStart(2, "0")}
            </span>
            <span className="flex min-w-0 items-baseline gap-3">
              <span className="text-foreground group-hover/row:text-signal shrink-0 text-base transition-colors duration-200">
                {row.title}
              </span>
              {row.description ? (
                <span className="text-muted-foreground hidden truncate text-sm sm:inline">
                  {row.description}
                </span>
              ) : null}
            </span>
            <span
              aria-hidden
              className="border-border-strong group-hover/row:border-signal min-w-4 -translate-y-1 self-end border-b border-dotted transition-colors duration-200 lg:mx-3"
            />
            <span className="label text-faint group-hover/row:text-foreground tabular-nums transition-colors duration-200">
              {row.meta}
            </span>
          </Link>
        </li>
      ))}
    </ol>
    {more ? (
      <Link
        className={cn(
          "group/more label text-faint hover:text-foreground mt-2 flex min-h-9 w-fit items-center gap-2 transition-colors duration-200",
          focusRingClassName
        )}
        href={more.href}
      >
        {more.label}
        <span
          aria-hidden
          className="ease-out-expo transition-transform duration-300 group-hover/more:translate-x-1"
        >
          →
        </span>
      </Link>
    ) : null}
  </div>
);
