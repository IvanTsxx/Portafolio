import { DocumentSection } from "@/components/site/document-section";
import { formatTiming } from "@/lib/design-system/model";
import type { DesignSystem } from "@/lib/design-system/model";
import { sectionById } from "@/lib/design-system/sections";

import { SpecList, SpecRow, SubHeading } from "./spec-list";

export const MotionSection = ({ system }: { system: DesignSystem }) => {
  const section = sectionById("motion");
  const animations = system.utilities.filter(
    (utility) => utility.group === "motion"
  );
  return (
    <DocumentSection
      aside="transform and opacity"
      id={section.id}
      index={section.index}
      label={section.label}
    >
      <div className="flex flex-col gap-3">
        <SubHeading label="Easings" />
        <SpecList>
          {system.easings.map((easing) => (
            <SpecRow
              aside={easing.curve}
              key={easing.name}
              name={easing.className}
            >
              {easing.use}
            </SpecRow>
          ))}
        </SpecList>
      </div>
      <div className="flex flex-col gap-3">
        <SubHeading label="Durations" />
        <SpecList>
          {system.durations.map((duration) => (
            <SpecRow
              aside={`${duration.ms}ms`}
              key={duration.className}
              name={duration.className}
            >
              {duration.use}
            </SpecRow>
          ))}
        </SpecList>
      </div>
      <div className="flex flex-col gap-3">
        <SubHeading label="Animation" />
        <SpecList>
          {animations.map((utility) => (
            <SpecRow
              aside={[formatTiming(utility.timing), utility.variable]
                .filter(Boolean)
                .join(" · ")}
              key={utility.name}
              name={utility.name}
            >
              {utility.summary}
            </SpecRow>
          ))}
        </SpecList>
      </div>
      <p className="label text-faint normal-case">
        Under prefers-reduced-motion every animation and transition snaps in
        0.01ms.
      </p>
    </DocumentSection>
  );
};
