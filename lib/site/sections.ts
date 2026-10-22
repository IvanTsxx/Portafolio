import { getExperiment } from "@/lib/lab/experiments";

type Experiment = NonNullable<ReturnType<typeof getExperiment>>;

export const registrySections = [
  { id: "preview", label: "Preview" },
  { id: "installation", label: "Installation" },
  { id: "usage", label: "Usage" },
  { id: "props", label: "Props" },
  { id: "accessibility", label: "Accessibility" },
  { id: "animation", label: "Animation" },
  { id: "dependencies", label: "Dependencies" },
] as const satisfies readonly { id: string; label: string }[];

export type RegistrySectionId = (typeof registrySections)[number]["id"];

export const skillSections = [
  { id: "installation", label: "Installation" },
  { id: "instructions", label: "Instructions" },
  { id: "files", label: "Files" },
] as const satisfies readonly { id: string; label: string }[];

export type SkillSectionId = (typeof skillSections)[number]["id"];

export const relatedExperimentsOf = (experiment: Experiment) =>
  experiment.related
    .map((relatedSlug) => getExperiment(relatedSlug))
    .filter((entry) => entry !== undefined);
