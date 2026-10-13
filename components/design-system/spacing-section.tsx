import { DocumentSection } from "@/components/site/document-section";
import { padCount } from "@/lib/design-system/format";
import type { DesignSystem } from "@/lib/design-system/model";
import { sectionById } from "@/lib/design-system/sections";
import { documentGridSpec, spacingSpecs } from "@/lib/design-system/specs";
import { sectionScripts } from "@/lib/site/section-scripts";

import { ClassTag, SubHeading } from "./spec-frame";

const SpacingScale = () => (
  <ol className="border-rule border-t">
    {spacingSpecs.map((step) => (
      <li
        className="label border-rule grid grid-cols-[2rem_3.5rem_1fr] items-center gap-x-3 gap-y-1 border-b py-2 md:grid-cols-[2rem_3.5rem_6rem_1fr]"
        key={step.step}
      >
        <span className="text-mist tabular-nums">{step.step}</span>
        <span className="text-ink tabular-nums">{step.px}px</span>
        <span
          aria-hidden
          className="bg-ink block h-2"
          style={{ width: step.px }}
        />
        <span className="text-graphite col-span-3 normal-case md:col-span-1">
          {step.use}
        </span>
      </li>
    ))}
  </ol>
);

const DossierDiagram = () => (
  <div className="border-rule flex flex-col gap-2 border p-3 md:p-4">
    <span className="border-rule-strong label text-mist flex h-6 items-center border-b">
      Top line 48
    </span>
    <div className="grid grid-cols-[1.5rem_1fr_1.5rem] gap-x-1.5 md:gap-x-3">
      <span className="border-rule-strong/50 bg-paper-deep label text-graphite flex h-28 items-center justify-center border [writing-mode:vertical-rl]">
        Tabs
      </span>
      <div className="relative">
        <span
          aria-hidden
          className="bg-paper-deep border-rule-strong/40 hatch absolute inset-0 translate-x-1.5 translate-y-1.5 border"
        />
        <span
          aria-hidden
          className="bg-paper-deep border-rule-strong/40 absolute inset-0 translate-x-0.5 translate-y-0.5 border"
        />
        <span className="border-rule-strong/50 bg-paper label text-ink relative flex h-28 items-center justify-center border text-center">
          Sheet · {documentGridSpec.columnWidth}
        </span>
      </div>
      <span className="border-rule label text-mist flex h-28 items-center justify-center border border-dashed [writing-mode:vertical-rl]">
        Notches
      </span>
    </div>
    <p className="label text-mist flex flex-wrap justify-between gap-x-4 gap-y-1 pt-2 normal-case">
      <span>Back cover</span>
      <span>
        {documentGridSpec.sheetInset} · {documentGridSpec.sectionGap}
      </span>
    </p>
  </div>
);

export const SpacingSection = ({
  radius,
}: {
  radius: DesignSystem["radius"];
}) => {
  const section = sectionById("spacing");
  return (
    <DocumentSection
      aside="4px base"
      id={section.id}
      index={section.index}
      label={section.label}
      script={sectionScripts.designSpacing}
    >
      <div className="flex flex-col gap-3">
        <SubHeading aside={padCount(spacingSpecs.length)} label="Spacing" />
        <SpacingScale />
      </div>
      <div className="flex flex-col gap-3">
        <SubHeading
          aside={
            <ClassTag>{documentGridSpec.containerClasses.join(" ")}</ClassTag>
          }
          label="Dossier"
        />
        <DossierDiagram />
      </div>
      <SubHeading aside={`${radius.baseVar}: ${radius.base}`} label="Radius" />
    </DocumentSection>
  );
};
