import type { ReactNode } from "react";

import { CornerMarks } from "@/components/site/corner-marks";
import { DocumentSection } from "@/components/site/document-section";
import { padCount } from "@/lib/design-system/format";
import { principles } from "@/lib/design-system/philosophy";
import type { PrincipleId } from "@/lib/design-system/philosophy";
import { sectionById } from "@/lib/design-system/sections";
import { sectionScripts } from "@/lib/site/section-scripts";

const inkCells = [
  "ink-1",
  "ink-2",
  "ink-3",
  "ink-4",
  "ink-5",
  "ink-6",
] as const;

const glyphs = {
  companion: (
    <div className="border-ink relative flex size-full items-end justify-center border pb-2">
      <CornerMarks />
      <span className="bg-clay h-4 w-3" />
    </div>
  ),
  hairlines: (
    <div className="border-ink flex size-full items-center justify-center border p-3">
      <div className="border-rule-strong flex size-full items-center justify-center border p-3">
        <div className="border-rule size-full border" />
      </div>
    </div>
  ),
  ink: (
    <div className="flex items-center gap-1">
      {inkCells.map((cell) => (
        <span className="bg-ink size-3" key={cell} />
      ))}
      <span className="bg-clay size-3" />
    </div>
  ),
  motion: (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1">
        <span className="bg-ink size-2 opacity-20" />
        <span className="bg-ink size-2 opacity-40" />
        <span className="bg-ink size-2 opacity-70" />
        <span className="bg-ink size-2" />
      </div>
      <div className="flex items-center gap-1">
        <span className="bg-ink ml-6 size-2" />
      </div>
    </div>
  ),
  paper: (
    <div className="bg-paper border-rule-strong relative size-full border">
      <span className="label text-mist absolute top-2 left-2">[ 01 ]</span>
      <span className="bg-rule-strong absolute inset-x-3 bottom-3 h-px" />
      <span className="bg-rule absolute inset-x-3 bottom-6 h-px" />
    </div>
  ),
  restraint: (
    <div className="flex w-full flex-col gap-2">
      <div className="border-ink flex h-4 w-full border">
        <span className="hatch flex-1" />
        <span className="bg-ink w-1/5" />
      </div>
      <p className="label text-mist flex justify-between tabular-nums">
        <span>80</span>
        <span>20</span>
      </p>
    </div>
  ),
} as const satisfies Record<PrincipleId, ReactNode>;

export const PhilosophySection = () => {
  const section = sectionById("philosophy");
  return (
    <DocumentSection
      aside={`${padCount(principles.length)} rules`}
      id={section.id}
      index={section.index}
      label={section.label}
      script={sectionScripts.designPhilosophy}
    >
      <ol className="border-rule border-t">
        {principles.map((principle, index) => (
          <li
            className="border-rule grid grid-cols-[6rem_1fr] items-center gap-x-4 gap-y-2 border-b py-4 md:grid-cols-[8rem_1fr] md:gap-x-6"
            key={principle.id}
          >
            <div
              aria-hidden
              className="border-rule bg-paper-deep/40 flex h-16 items-center justify-center overflow-hidden border p-2"
            >
              {glyphs[principle.id]}
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <p className="label text-mist tabular-nums">
                P-{padCount(index + 1)}
              </p>
              <h3 className="text-ink text-xl leading-tight font-light tracking-tight text-balance">
                {principle.title}
              </h3>
              <p className="text-graphite max-w-prose text-sm leading-relaxed text-pretty">
                {principle.rule}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </DocumentSection>
  );
};
