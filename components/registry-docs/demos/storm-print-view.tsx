"use client";

import {
  PrintFigure,
  usePrintLook,
} from "@/components/registry-docs/demos/print-figure";
import type { StormPrintProps } from "@/registry/ivan/components/storm-print/storm-print";
import { stormPrintDefaults } from "@/registry/ivan/components/storm-print/storm-print-material";
import { StormPrintScene } from "@/registry/ivan/components/storm-print/storm-print-scene";

const defaultLabel =
  "A picture printed as an ordered dither, reprinted in color by lightning strikes and clicks";

export const StormPrint = ({
  className,
  label = defaultLabel,
  ink,
  paper,
  paused = stormPrintDefaults.paused,
  ...sceneProps
}: StormPrintProps) => {
  const look = usePrintLook({ ink, paper, paused });
  return (
    <PrintFigure background={look.ink} className={className} label={label}>
      <StormPrintScene
        {...sceneProps}
        ink={look.ink}
        paper={look.paper}
        paused={look.paused}
      />
    </PrintFigure>
  );
};
