import type { StormDither } from "@/registry/ivan/components/storm-print/storm-print-material";
import type { OrderedDither } from "@/registry/ivan/lib/ordered-print";

export const orderedDitherOptions = [
  { label: "2×2", value: "bayer-2" },
  { label: "4×4", value: "bayer-4" },
  { label: "8×8", value: "bayer-8" },
  { label: "Blue", value: "blue-noise" },
] as const satisfies readonly { label: string; value: OrderedDither }[];

export const stormDitherOptions = [
  ...orderedDitherOptions,
  { label: "Dots", value: "halftone" },
] as const satisfies readonly { label: string; value: StormDither }[];
