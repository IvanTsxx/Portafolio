export const sectionSpecs = [
  { id: "philosophy", index: "DS-01", jp: "哲学", label: "Philosophy" },
  { id: "color", index: "DS-02", jp: "色彩", label: "Color tokens" },
  { id: "typography", index: "DS-03", jp: "書体", label: "Typography" },
  {
    id: "spacing",
    index: "DS-04",
    jp: "間隔と格子",
    label: "Spacing and grid",
  },
  { id: "utilities", index: "DS-05", jp: "ユーティリティ", label: "Utilities" },
  { id: "primitives", index: "DS-06", jp: "基本部品", label: "Primitives" },
  {
    id: "components",
    index: "DS-07",
    jp: "構成部品",
    label: "Site components",
  },
  { id: "motion", index: "DS-08", jp: "動作", label: "Motion" },
  { id: "agents", index: "DS-09", jp: "エージェント", label: "3D agents" },
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
