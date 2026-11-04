import { SpeedSmear } from "@/components/registry-docs/demos/speed-smear-view";

export const Example = () => (
  <SpeedSmear
    angle={24}
    className="w-full max-w-xl"
    dither={false}
    focus={{ x: 0.7, y: 0.5 }}
    reach={0.24}
    smear={0.2}
    src="/examples/dusk.jpg"
  />
);
