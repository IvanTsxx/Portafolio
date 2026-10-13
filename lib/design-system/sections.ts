export const sectionSpecs = [
  { id: "philosophy", index: "DS-01", label: "Philosophy" },
  { id: "color", index: "DS-02", label: "Color tokens" },
  { id: "typography", index: "DS-03", label: "Typography" },
  {
    id: "spacing",
    index: "DS-04",
    label: "Spacing and grid",
  },
  { id: "utilities", index: "DS-05", label: "Utilities" },
  { id: "motion", index: "DS-06", label: "Motion" },
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
