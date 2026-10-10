import { CodeBlock } from "@/components/registry-docs/code-block";
import { DocumentSection } from "@/components/site/document-section";
import { LeaderList, LeaderRow } from "@/components/site/leader-list";
import type { DesignSystem } from "@/lib/design-system/model";
import { sectionById } from "@/lib/design-system/sections";
import { agentMotionSpecs } from "@/lib/design-system/specs";
import { highlightCode } from "@/lib/registry/highlight";

import { MotionLab } from "./motion-lab";
import { SubHeading, padCount } from "./spec-frame";

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
      jp={section.jp}
      label={section.label}
    >
      <div className="flex flex-col gap-3">
        <SubHeading jp="緩急と時間" label="Easings and durations" />
        <MotionLab durations={system.durations} easings={system.easings} />
      </div>
      <div className="flex flex-col gap-3">
        <SubHeading jp="配慮" label="Reduced motion" aside="globals.css" />
        <div className="border-rule-strong bg-popover border">
          <CodeBlock lines={reducedMotionLines} />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <SubHeading jp="代理の動き" label="Agent motion" />
        <LeaderList>
          {agentMotionSpecs.map((spec) => (
            <LeaderRow jp={spec.jp} key={spec.label} label={spec.label}>
              {spec.value}
            </LeaderRow>
          ))}
        </LeaderList>
      </div>
    </DocumentSection>
  );
};
