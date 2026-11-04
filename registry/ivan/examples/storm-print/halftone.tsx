import { StormPrint } from "@/components/registry-docs/demos/storm-print-view";

export const Example = () => (
  <StormPrint
    cell={4}
    className="w-full max-w-xl"
    colorHold={Infinity}
    dither="halftone"
    frequency={0.2}
    rain={0}
    src="/examples/dusk.jpg"
  />
);
