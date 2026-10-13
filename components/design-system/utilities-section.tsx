import type { ReactNode } from "react";

import { DocumentSection } from "@/components/site/document-section";
import { padCount } from "@/lib/design-system/format";
import type { UtilityDoc } from "@/lib/design-system/model";
import { sectionById } from "@/lib/design-system/sections";
import type { UtilityName } from "@/lib/design-system/specs";
import { sectionScripts } from "@/lib/site/section-scripts";

import { PreviewBox, SpecCell, SpecGrid } from "./spec-frame";

const previews = {
  "blueprint-dots": (
    <div className="blueprint-dots absolute inset-0 [--grid-size:12px]" />
  ),
  "blueprint-grid": (
    <div className="blueprint-grid absolute inset-0 [--grid-size:16px]" />
  ),
  display: <p className="display text-ink text-6xl">Ivo</p>,
  hatch: (
    <div className="hatch border-rule-strong absolute inset-3 border border-dashed" />
  ),
  "hazard-stripe": <span className="hazard-stripe text-ink block h-3 w-full" />,
  "ink-underline": (
    <a className="group/ink label text-ink" href="#utilities">
      <span className="ink-underline">Hover to draw</span>
    </a>
  ),
  jp: <p className="jp text-graphite text-2xl font-light">イヴォ</p>,
  label: <p className="label text-ink">Label 0123</p>,
  "scroll-reveal": (
    <div className="scroll-reveal border-ink absolute inset-x-3 bottom-3 grid size-8 place-items-center border">
      <span className="bg-ink h-3 w-px" />
    </div>
  ),
  "stamp-press": (
    <div className="stamp-press border-ink absolute inset-3 border p-1 motion-reduce:animate-none">
      <div className="border-ink/60 h-full border" />
    </div>
  ),
} as const satisfies Record<UtilityName, ReactNode>;

export const UtilitiesSection = ({
  utilities,
}: {
  utilities: readonly UtilityDoc[];
}) => {
  const section = sectionById("utilities");
  return (
    <DocumentSection
      aside={`${padCount(utilities.length)} utilities`}
      id={section.id}
      index={section.index}
      label={section.label}
      script={sectionScripts.designUtilities}
    >
      <SpecGrid className="grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-3">
        {utilities.map((utility, index) => (
          <SpecCell
            code={`U-${padCount(index + 1)}`}
            footer={utility.variable}
            key={utility.name}
            name={utility.name}
          >
            <PreviewBox>{previews[utility.name]}</PreviewBox>
            <p className="text-graphite text-sm leading-snug text-pretty">
              {utility.summary}
            </p>
          </SpecCell>
        ))}
      </SpecGrid>
    </DocumentSection>
  );
};
