export const sectionSpecs = [
  { id: "philosophy", index: "DS-01", label: "Philosophy" },
  { id: "color", index: "DS-02", label: "Color" },
  { id: "typography", index: "DS-03", label: "Type" },
  { id: "spacing", index: "DS-04", label: "Spacing and layout" },
  { id: "motion", index: "DS-05", label: "Motion" },
  { id: "utilities", index: "DS-06", label: "Utilities" },
] as const;

export type SectionId = (typeof sectionSpecs)[number]["id"];

export const sectionById = (id: SectionId) => {
  const section = sectionSpecs.find((candidate) => candidate.id === id);
  if (!section) {
    throw new Error(`Unknown design system section ${id}`);
  }
  return section;
};

export const documentCode = "DS-00";

export const rawMarkdownPath = "/design-system/design.md";
