import { DocumentSection } from "@/components/site/document-section";
import { LeaderList, LeaderRow } from "@/components/site/leader-list";
import { padCount } from "@/lib/design-system/format";
import { sectionById } from "@/lib/design-system/sections";
import { componentSpecs } from "@/lib/design-system/specs";
import { sectionScripts } from "@/lib/site/section-scripts";

export const ComponentsSection = () => {
  const section = sectionById("components");
  return (
    <DocumentSection
      aside={`${padCount(componentSpecs.length)} components`}
      id={section.id}
      index={section.index}
      label={section.label}
      script={sectionScripts.designComponents}
    >
      <LeaderList>
        {componentSpecs.map((spec) => (
          <LeaderRow key={spec.name} label={spec.name}>
            {spec.summary}
          </LeaderRow>
        ))}
      </LeaderList>
    </DocumentSection>
  );
};
