import type { SwatchTone } from "./repositories";

export const swatchClassNames = {
  graphite: "bg-graphite border-graphite text-paper",
  hollow: "bg-paper border-ink text-ink",
  ink: "bg-ink border-ink text-paper",
  mist: "bg-mist border-mist text-paper",
} as const satisfies Record<SwatchTone, string>;

export const swatchFillClassNames = {
  graphite: "fill-graphite",
  hollow: "fill-paper",
  ink: "fill-ink",
  mist: "fill-mist",
} as const satisfies Record<SwatchTone, string>;

export const swatchBandClassNames = {
  graphite: "bg-graphite",
  hollow: "bg-paper-deep",
  ink: "bg-ink",
  mist: "bg-mist",
} as const satisfies Record<SwatchTone, string>;
