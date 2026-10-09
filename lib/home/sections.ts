export const homeSections = [
  { id: "system", index: "01", label: "System entry" },
  { id: "workshop", index: "02", label: "Workshop" },
  { id: "work", index: "03", label: "Selected work" },
  { id: "capabilities", index: "04", label: "Capabilities" },
  { id: "experiments", index: "05", label: "Experiments" },
  { id: "registry", index: "06", label: "Registry" },
  { id: "contact", index: "07", label: "Contact" },
] as const satisfies readonly { id: string; index: string; label: string }[];

export type HomeSection = (typeof homeSections)[number];
export type HomeSectionId = HomeSection["id"];

export const homeSection = (id: HomeSectionId) => {
  const section = homeSections.find((candidate) => candidate.id === id);
  if (!section) {
    throw new Error(`Unknown home section ${id}`);
  }
  return section;
};
