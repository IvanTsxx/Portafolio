"use client";

import {
  PrintFigure,
  usePrintLook,
} from "@/components/registry-docs/demos/print-figure";
import type { SpeedSmearProps } from "@/registry/ivan/components/speed-smear/speed-smear";
import { speedSmearDefaults } from "@/registry/ivan/components/speed-smear/speed-smear-material";
import { SpeedSmearScene } from "@/registry/ivan/components/speed-smear/speed-smear-scene";

const defaultLabel =
  "A picture smeared sideways around the pointer, like a head turning fast";

export const SpeedSmear = ({
  className,
  label = defaultLabel,
  ink,
  paper,
  paused = speedSmearDefaults.paused,
  ...sceneProps
}: SpeedSmearProps) => {
  const look = usePrintLook({ ink, paper, paused });
  return (
    <PrintFigure background={look.ink} className={className} label={label}>
      <SpeedSmearScene
        {...sceneProps}
        ink={look.ink}
        paper={look.paper}
        paused={look.paused}
      />
    </PrintFigure>
  );
};
