import { DocumentSection } from "@/components/site/document-section";
import { padCount } from "@/lib/design-system/format";
import { sectionById } from "@/lib/design-system/sections";
import { componentSpecs } from "@/lib/design-system/specs";

import { SpecList, SpecRow } from "./spec-list";

export const ComponentsSection = () => {
  const section = sectionById("components");
  return (
    <DocumentSection
      aside={`${padCount(componentSpecs.length)} components`}
      id={section.id}
      index={section.index}
      label={section.label}
    >
      <SpecList>
        {componentSpecs.map((spec) => (
          <SpecRow aside={spec.file} key={spec.name} name={spec.name}>
            {spec.summary}
          </SpecRow>
        ))}
      </SpecList>
    </DocumentSection>
  );
};
