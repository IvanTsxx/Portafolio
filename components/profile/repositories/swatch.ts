import type { SwatchTone } from "./repositories";

export const swatchClassNames = {
  graphite: "bg-graphite border-graphite text-paper",
  hollow: "bg-paper border-ink text-ink",
  ink: "bg-ink border-ink text-paper",
  mist: "bg-mist border-mist text-paper",
} as const satisfies Record<SwatchTone, string>;
