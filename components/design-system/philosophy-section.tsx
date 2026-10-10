import type { ReactNode } from "react";

import { CornerMarks } from "@/components/site/corner-marks";
import { DocumentSection } from "@/components/site/document-section";
import { principles } from "@/lib/design-system/philosophy";
import type { PrincipleId } from "@/lib/design-system/philosophy";
import { sectionById } from "@/lib/design-system/sections";

import { padCount } from "./spec-frame";

const inkCells = [
  "ink-1",
  "ink-2",
  "ink-3",
  "ink-4",
  "ink-5",
  "ink-6",
] as const;

const glyphs = {
  canvas: (
    <div className="border-ink relative size-full border">
      <CornerMarks />
      <span className="border-rule-strong absolute top-3 left-3 h-6 w-10 border border-dashed" />
      <span className="border-rule-strong absolute right-3 bottom-3 h-8 w-12 border border-dashed" />
      <span className="border-rule-strong absolute top-4 right-6 size-4 border border-dashed" />
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
    <div className="grain bg-paper border-rule-strong relative size-full border">
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
  visuals: (
    <div className="flex w-full items-end gap-2">
      <span className="hatch border-rule-strong h-10 flex-1 border" />
      <span className="bg-ink mb-1 h-px w-6" />
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
      jp={section.jp}
      label={section.label}
    >
      <ol className="border-rule border-t">
        {principles.map((principle, index) => (
          <li
            className="border-rule grid grid-cols-[6rem_1fr] items-center gap-x-4 gap-y-2 border-b py-4 md:grid-cols-[8rem_1fr_auto] md:gap-x-6"
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
            <span
              aria-hidden
              className="jp text-graphite/25 hidden text-6xl leading-none font-light select-none md:block"
            >
              {principle.jp}
            </span>
          </li>
        ))}
      </ol>
    </DocumentSection>
  );
};
