"use client";

import {
  PrintFigure,
  usePrintLook,
} from "@/components/registry-docs/demos/print-figure";
import type { SignalTearProps } from "@/registry/ivan/components/signal-tear/signal-tear";
import { signalTearDefaults } from "@/registry/ivan/components/signal-tear/signal-tear-material";
import { SignalTearScene } from "@/registry/ivan/components/signal-tear/signal-tear-scene";

const defaultLabel =
  "A grainy picture whose rows tear sideways and leave light trails near the pointer";

export const SignalTear = ({
  className,
  label = defaultLabel,
  ink,
  paper,
  paused = signalTearDefaults.paused,
  ...sceneProps
}: SignalTearProps) => {
  const look = usePrintLook({ ink, paper, paused });
  return (
    <PrintFigure background={look.ink} className={className} label={label}>
      <SignalTearScene
        {...sceneProps}
        ink={look.ink}
        paper={look.paper}
        paused={look.paused}
      />
    </PrintFigure>
  );
};
