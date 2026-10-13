import { getExperiment } from "@/lib/lab/experiments";

type Experiment = NonNullable<ReturnType<typeof getExperiment>>;

export const registrySectionAnnotations = {
  accessibility: "配慮",
  animation: "動作",
  dependencies: "依存",
  installation: "導入",
  preview: "見本",
  props: "属性",
  usage: "用法",
} as const;

export type RegistrySectionId = keyof typeof registrySectionAnnotations;

export const registrySections: readonly {
  id: RegistrySectionId;
  label: string;
}[] = [
  { id: "preview", label: "Preview" },
  { id: "installation", label: "Installation" },
  { id: "usage", label: "Usage" },
  { id: "props", label: "Props" },
  { id: "accessibility", label: "Accessibility" },
  { id: "animation", label: "Animation" },
  { id: "dependencies", label: "Dependencies" },
];

export const relatedExperimentsOf = (experiment: Experiment) =>
  experiment.related
    .map((relatedSlug) => getExperiment(relatedSlug))
    .filter((entry) => entry !== undefined);
