import { BlastPrint } from "@/components/registry-docs/demos/blast-print-view";

export const Example = () => (
  <BlastPrint
    auraRadius={1.4}
    cell={4}
    className="w-full max-w-xl"
    dither="bayer-4"
    src="/examples/dusk.jpg"
  />
);
