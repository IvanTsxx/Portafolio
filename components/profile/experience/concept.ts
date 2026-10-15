export const experienceConcepts = ["a", "g", "h", "i", "j"] as const;

export type ExperienceConcept = (typeof experienceConcepts)[number];

export const conceptOf = (value: string | null): ExperienceConcept =>
  experienceConcepts.find((concept) => concept === value) ?? "a";
