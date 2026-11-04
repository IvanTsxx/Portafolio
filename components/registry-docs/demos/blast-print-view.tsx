"use client";

import {
  PrintFigure,
  usePrintLook,
} from "@/components/registry-docs/demos/print-figure";
import type { BlastPrintProps } from "@/registry/ivan/components/blast-print/blast-print";
import { blastPrintDefaults } from "@/registry/ivan/components/blast-print/blast-print-material";
import { BlastPrintScene } from "@/registry/ivan/components/blast-print/blast-print-scene";

const defaultLabel =
  "A picture printed as an ordered dither, bleached and reprinted in color by a click";

export const BlastPrint = ({
  className,
  label = defaultLabel,
  ink,
  paper,
  paused = blastPrintDefaults.paused,
  ...sceneProps
}: BlastPrintProps) => {
  const look = usePrintLook({ ink, paper, paused });
  return (
    <PrintFigure background={look.ink} className={className} label={label}>
      <BlastPrintScene
        {...sceneProps}
        ink={look.ink}
        paper={look.paper}
        paused={look.paused}
      />
    </PrintFigure>
  );
};
