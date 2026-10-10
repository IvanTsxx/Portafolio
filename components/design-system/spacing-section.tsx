import { DocumentSection } from "@/components/site/document-section";
import { padCount } from "@/lib/design-system/format";
import type { DesignSystem } from "@/lib/design-system/model";
import { sectionById } from "@/lib/design-system/sections";
import {
  breakpointSpecs,
  documentGridSpec,
  spacingSpecs,
} from "@/lib/design-system/specs";
import type { RadiusStepName } from "@/lib/design-system/specs";

import { ClassTag, SubHeading } from "./spec-frame";

const radiusClassNames = {
  "2xl": "rounded-2xl",
  lg: "rounded-lg",
  md: "rounded-md",
  sm: "rounded-sm",
  xl: "rounded-xl",
} as const satisfies Record<RadiusStepName, string>;

const columnNumbers = Array.from(
  { length: documentGridSpec.columns },
  (_, index) => index + 1
);

const maxBreakpoint = Math.max(...breakpointSpecs.map(({ px }) => px));

const SpacingScale = () => (
  <ol className="border-rule border-t">
    {spacingSpecs.map((step) => (
      <li
        className="label border-rule grid grid-cols-[2rem_3.5rem_1fr] items-center gap-x-3 gap-y-1 border-b py-2 md:grid-cols-[2rem_3.5rem_8rem_1fr]"
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

const RadiusScale = ({ steps }: { steps: DesignSystem["radius"]["steps"] }) => (
  <ul className="flex flex-wrap gap-6">
    {steps.map((step) => (
      <li className="flex flex-col gap-2" key={step.name}>
        <span
          aria-hidden
          className={`border-ink bg-paper-deep block size-12 border ${radiusClassNames[step.name]}`}
        />
        <span className="label text-ink">{step.name}</span>
        <span className="label text-mist normal-case tabular-nums">
          {step.px}px
        </span>
      </li>
    ))}
  </ul>
);

const GridDiagram = () => (
  <div className="border-rule relative flex flex-col gap-3 border p-3 md:p-4">
    <div className="grid grid-cols-12 gap-x-1.5 md:gap-x-3">
      {columnNumbers.map((column) => (
        <span
          className="label text-mist border-rule bg-paper-deep/40 flex h-12 items-end justify-center border pb-1 tabular-nums"
          key={column}
        >
          {column}
        </span>
      ))}
    </div>
    <div className="grid grid-cols-12 gap-x-1.5 md:gap-x-3">
      <span className="hatch border-rule-strong label text-ink col-span-4 flex h-10 items-center justify-center border border-dashed">
        Dossier {documentGridSpec.dossierSpan}
      </span>
      <span className="border-ink label text-ink col-span-8 flex h-10 items-center justify-center border">
        Content {documentGridSpec.contentSpan}
      </span>
    </div>
    <p className="label text-mist flex flex-wrap justify-between gap-x-4 gap-y-1 normal-case">
      <span>
        {documentGridSpec.columns} columns from lg · {documentGridSpec.gutter}
      </span>
      <span>Sections {documentGridSpec.sectionGap}</span>
    </p>
  </div>
);

const BreakpointRuler = () => (
  <ol className="border-rule border-t">
    {breakpointSpecs.map((breakpoint) => (
      <li
        className="label border-rule grid grid-cols-[2rem_3rem_1fr] items-center gap-x-3 gap-y-1 border-b py-2"
        key={breakpoint.name}
      >
        <span className="text-ink">{breakpoint.name}</span>
        <span className="text-mist tabular-nums">{breakpoint.px}</span>
        <span
          aria-hidden
          className="border-rule-strong relative block h-2 border"
        >
          <span
            className="hatch absolute inset-y-0 left-0 block"
            style={{ width: `${(breakpoint.px / maxBreakpoint) * 100}%` }}
          />
        </span>
        <span className="text-graphite col-span-3 normal-case">
          {breakpoint.changes}
        </span>
      </li>
    ))}
  </ol>
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
      jp={section.jp}
      label={section.label}
    >
      <div className="flex flex-col gap-3">
        <SubHeading
          aside={padCount(spacingSpecs.length)}
          jp="間隔"
          label="Spacing"
        />
        <SpacingScale />
      </div>
      <div className="flex flex-col gap-3">
        <SubHeading
          aside={`${radius.baseVar} ${radius.base}`}
          jp="角丸"
          label="Radius"
        />
        <RadiusScale steps={radius.steps} />
      </div>
      <div className="flex flex-col gap-3">
        <SubHeading
          aside={<ClassTag>{documentGridSpec.container}</ClassTag>}
          jp="格子"
          label="Document grid"
        />
        <GridDiagram />
      </div>
      <div className="flex flex-col gap-3">
        <SubHeading
          aside={`${breakpointSpecs.length} steps`}
          jp="分岐点"
          label="Breakpoints"
        />
        <BreakpointRuler />
      </div>
    </DocumentSection>
  );
};
