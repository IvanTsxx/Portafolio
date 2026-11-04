export const sectionSpecs = [
  { id: "principles", index: "DS-01", label: "Principles" },
  { id: "color", index: "DS-02", label: "Color" },
  { id: "type", index: "DS-03", label: "Type" },
  { id: "layout", index: "DS-04", label: "Layout" },
  { id: "motion", index: "DS-05", label: "Motion" },
  { id: "components", index: "DS-06", label: "Components" },
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
