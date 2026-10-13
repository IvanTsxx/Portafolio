import type { Tenure } from "./career";
import { lineText, spanText } from "./career";

export type Shown =
  | { kind: "idle" }
  | { job: number; kind: "peek" }
  | { job: number; kind: "moving" }
  | { job: number; kind: "held" };

export interface ClockReading {
  href: string | null;
  key: string;
  lead: string;
  trail: string;
}

const startOf = (tenure: Tenure) => tenure.dates.split(" → ")[0] ?? "";

export const readingOf = (
  shown: Shown,
  tenures: readonly Tenure[],
  current: Tenure | undefined
): ClockReading => {
  const tenure = shown.kind === "idle" ? undefined : tenures[shown.job];
  if (tenure && shown.kind === "held") {
    return {
      href: tenure.website,
      key: `held-${tenure.id}`,
      lead: tenure.company,
      trail: `${tenure.dates} · ${spanText(tenure)}`,
    };
  }
  if (tenure) {
    return {
      href: null,
      key: `line-${tenure.id}`,
      lead: tenure.company,
      trail: lineText(tenure),
    };
  }
  return {
    href: null,
    key: "idle",
    lead: current?.company ?? `${tenures.length} cards`,
    trail: current ? `Since ${startOf(current)}` : "",
  };
};
