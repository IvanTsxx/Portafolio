import type { CSSProperties, ReactNode } from "react";

import { DocumentSection } from "@/components/site/document-section";
import type { DesignSystem } from "@/lib/design-system/model";
import { sectionById } from "@/lib/design-system/sections";
import {
  documentGridSpec,
  spacingSpecs,
  stepPx,
  utilitiesIn,
} from "@/lib/design-system/specs";
import type { RadiusStepName, UtilityOf } from "@/lib/design-system/specs";
import { cn } from "@/lib/utils";

import { ClassTag, SpecList, SpecRow, SubHeading } from "./spec-list";

const radiusClassNames = {
  lg: "rounded-lg",
  md: "rounded-md",
  pill: "rounded-pill",
  sm: "rounded-sm",
} as const satisfies Record<RadiusStepName, string>;

const guidePreviewPointer: CSSProperties = {
  "--guide-near": 1,
  "--guide-x": "0px",
  "--guide-y": "24px",
};

const markPreviews = {
  "blueprint-dots": (
    <span className="blueprint-dots border-border-strong block h-12 w-32 border" />
  ),
  grain: (
    <span className="bg-muted-foreground relative block h-8 w-32">
      <span className="grain absolute inset-0 block" />
    </span>
  ),
  "guide-glow": (
    <span
      className="border-border relative block h-12 w-32 border-x"
      style={guidePreviewPointer}
    >
      <span className="guide-glow absolute -inset-x-px inset-y-0 block" />
    </span>
  ),
  "hairline-x": <span className="hairline-x block h-px w-32" />,
  hatch: <span className="hatch border-border-strong block h-8 w-32 border" />,
  "hazard-stripe": (
    <span className="hazard-stripe text-foreground block h-3 w-32" />
  ),
} as const satisfies Record<UtilityOf<"mark">["name"], ReactNode>;

const gutterText = documentGridSpec.gutters
  .map((gutter) => `${stepPx(gutter)}px`)
  .join(", ");

const FrameFacts = ({
  containers,
}: {
  containers: DesignSystem["containers"];
}) => (
  <SpecList>
    {containers.map((container) => (
      <SpecRow
        aside={container.width}
        key={container.name}
        name={container.className}
      >
        {container.use}
      </SpecRow>
    ))}
    <SpecRow aside={gutterText} name={documentGridSpec.gutters.join(" ")}>
      Page gutters, phone and from md
    </SpecRow>
    <SpecRow
      aside={`${stepPx(documentGridSpec.sectionGap)}px`}
      name={documentGridSpec.sectionGap}
    >
      Between sections
    </SpecRow>
    <SpecRow
      aside={documentGridSpec.measure.width}
      name={documentGridSpec.measure.className}
    >
      Reading measure
    </SpecRow>
  </SpecList>
);

const SpacingScale = () => (
  <ol className="border-border border-t">
    {spacingSpecs.map((step) => (
      <li
        className="label border-border grid grid-cols-[2rem_3.5rem_1fr] items-center gap-x-3 gap-y-1 border-b py-2 md:grid-cols-[2rem_3.5rem_8rem_1fr]"
        key={step.step}
      >
        <span className="text-faint tabular-nums">{step.step}</span>
        <span className="text-foreground tabular-nums">{step.px}px</span>
        <span
          aria-hidden
          className="bg-foreground block h-2"
          style={{ width: step.px }}
        />
        <span className="text-muted-foreground col-span-3 normal-case md:col-span-1">
          {"use" in step ? step.use : ""}
        </span>
      </li>
    ))}
  </ol>
);

const RadiusScale = ({ radius }: { radius: DesignSystem["radius"] }) => (
  <ul className="grid grid-cols-4 gap-6">
    {radius.steps.map((step) => (
      <li className="flex flex-col gap-2" key={step.name}>
        <span
          aria-hidden
          className={cn(
            "border-border-strong bg-surface block h-16 border",
            radiusClassNames[step.name]
          )}
        />
        <p className="label flex flex-col gap-0.5 normal-case">
          <span className="text-foreground">{step.className}</span>
          <span className="text-faint tabular-nums">{step.px}px</span>
        </p>
      </li>
    ))}
  </ul>
);

const markUtilities = utilitiesIn("mark");
const layoutUtilities = utilitiesIn("layout");

export const LayoutSection = ({ system }: { system: DesignSystem }) => {
  const section = sectionById("layout");
  return (
    <DocumentSection
      aside="4px base"
      id={section.id}
      index={section.index}
      label={section.label}
    >
      <div className="flex flex-col gap-3">
        <SubHeading label="Frame" />
        <FrameFacts containers={system.containers} />
      </div>
      <div className="flex flex-col gap-3">
        <SubHeading label="Spacing" />
        <SpacingScale />
      </div>
      <div className="flex flex-col gap-3">
        <SubHeading
          aside={
            <ClassTag>{`${system.radius.baseVar}: ${system.radius.base}`}</ClassTag>
          }
          label="Radius"
        />
        <RadiusScale radius={system.radius} />
      </div>
      <div className="flex flex-col gap-3">
        <SubHeading label="Marks" />
        <SpecList>
          {markUtilities.map((utility) => (
            <SpecRow
              aside={markPreviews[utility.name]}
              key={utility.name}
              name={utility.name}
            >
              {utility.summary}
            </SpecRow>
          ))}
        </SpecList>
      </div>
      <div className="flex flex-col gap-3">
        <SubHeading label="Helpers" />
        <SpecList>
          {layoutUtilities.map((utility) => (
            <SpecRow key={utility.name} name={utility.name}>
              {utility.summary}
            </SpecRow>
          ))}
        </SpecList>
      </div>
    </DocumentSection>
  );
};
