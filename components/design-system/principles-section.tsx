import { DocumentSection } from "@/components/site/document-section";
import { principles } from "@/lib/design-system/philosophy";
import { sectionById } from "@/lib/design-system/sections";

import { SpecList, SpecRow } from "./spec-list";

export const PrinciplesSection = () => {
  const section = sectionById("principles");
  return (
    <DocumentSection
      id={section.id}
      index={section.index}
      label={section.label}
    >
      <SpecList>
        {principles.map((principle) => (
          <SpecRow key={principle.title} name={principle.title}>
            {principle.rule}
          </SpecRow>
        ))}
      </SpecList>
    </DocumentSection>
  );
};
