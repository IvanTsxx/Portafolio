import type { Heading } from "@/lib/content/text";
import { getExperiment } from "@/lib/lab/experiments";
import type { getRegistryItem } from "@/lib/registry/registry";

type RegistryItem = NonNullable<ReturnType<typeof getRegistryItem>>;
type Experiment = NonNullable<ReturnType<typeof getExperiment>>;

export const registrySectionAnnotations = {
  accessibility: "配慮",
  animation: "動作",
  dependencies: "依存",
  installation: "導入",
  preview: "見本",
  props: "属性",
  usage: "用法",
  variants: "変種",
} as const;

export type RegistrySectionId = keyof typeof registrySectionAnnotations;

export const registrySectionsOf = (
  item: RegistryItem
): { id: RegistrySectionId; label: string }[] => [
  { id: "preview", label: "Preview" },
  { id: "installation", label: "Installation" },
  { id: "usage", label: "Usage" },
  ...(item.meta.docs.variants.length > 0
    ? [{ id: "variants" as const, label: "Variants" }]
    : []),
  { id: "props", label: "Props" },
  { id: "accessibility", label: "Accessibility" },
  { id: "animation", label: "Animation" },
  { id: "dependencies", label: "Dependencies" },
];

export const toHeadings = (
  sections: readonly { id: string; label: string }[]
): Heading[] =>
  sections.map((section) => ({
    depth: 2,
    id: section.id,
    text: section.label,
  }));

export const relatedExperimentsOf = (experiment: Experiment) =>
  experiment.related
    .map((relatedSlug) => getExperiment(relatedSlug))
    .filter((entry) => entry !== undefined);

export const experimentSectionsOf = (experiment: Experiment): Heading[] =>
  toHeadings([
    { id: "preview", label: "Preview" },
    { id: "implementation", label: "Implementation" },
    { id: "notes", label: "Notes" },
    { id: "stack", label: "Stack" },
    ...(relatedExperimentsOf(experiment).length > 0
      ? [{ id: "related", label: "Related" }]
      : []),
  ]);
