import { CodeBlock } from "@/components/registry-docs/code-block";
import { DocumentSection } from "@/components/site/document-section";
import { LeaderList, LeaderRow } from "@/components/site/leader-list";
import { padCount } from "@/lib/design-system/format";
import type { DesignSystem } from "@/lib/design-system/model";
import { sectionById } from "@/lib/design-system/sections";
import {
  agentMotionSpecs,
  componentMotionSpecs,
} from "@/lib/design-system/specs";
import { highlightCode } from "@/lib/registry/highlight";
import { sectionScripts } from "@/lib/site/section-scripts";

import { MotionLab } from "./motion-lab";
import { SubHeading } from "./spec-frame";

export const MotionSection = async ({ system }: { system: DesignSystem }) => {
  const section = sectionById("motion");
  const reducedMotionLines = await highlightCode(
    system.reducedMotionCss,
    "css"
  );
  return (
    <DocumentSection
      aside={`${padCount(system.easings.length)} easings`}
      id={section.id}
      index={section.index}
      label={section.label}
      script={sectionScripts.designMotion}
    >
      <div className="flex flex-col gap-3">
        <SubHeading label="Easings and durations" />
        <MotionLab durations={system.durations} easings={system.easings} />
      </div>
      <div className="flex flex-col gap-3">
        <SubHeading label="Reduced motion" aside="globals.css" />
        <div className="border-rule-strong bg-popover border">
          <CodeBlock lines={reducedMotionLines} />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <SubHeading label="Agent motion" />
        <LeaderList>
          {agentMotionSpecs.map((spec) => (
            <LeaderRow key={spec.label} label={spec.label}>
              {spec.value}
            </LeaderRow>
          ))}
        </LeaderList>
      </div>
      <div className="flex flex-col gap-3">
        <SubHeading label="Component motion" />
        <LeaderList>
          {componentMotionSpecs.map((spec) => (
            <LeaderRow key={spec.label} label={spec.label}>
              {spec.value}
            </LeaderRow>
          ))}
        </LeaderList>
      </div>
    </DocumentSection>
  );
};
