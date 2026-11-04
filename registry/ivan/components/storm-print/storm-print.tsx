"use client";

import { cn } from "@/lib/utils";
import {
  CanvasStage,
  ImageFallback,
} from "@/registry/ivan/components/canvas-stage/canvas-stage";
import { centeredFocus } from "@/registry/ivan/lib/image-cover";

import { stormPrintDefaults } from "./storm-print-material";
import { StormPrintScene } from "./storm-print-scene";
import type { StormPrintSceneProps } from "./storm-print-scene";

export interface StormPrintProps extends StormPrintSceneProps {
  className?: string;
  label?: string;
}

const defaultLabel =
  "A picture printed as an ordered dither, reprinted in color by lightning strikes and clicks";

export const StormPrint = ({
  className,
  label = defaultLabel,
  src,
  focus = centeredFocus,
  ink = stormPrintDefaults.ink,
  paper = stormPrintDefaults.paper,
  paused = stormPrintDefaults.paused,
  ...sceneProps
}: StormPrintProps) => (
  <CanvasStage
    className={cn("touch-pan-y", className)}
    fallback={<ImageFallback focus={focus} src={src} />}
    ground={ink}
    label={label}
    paused={paused}
  >
    {(isAnimating) => (
      <StormPrintScene
        {...sceneProps}
        focus={focus}
        ink={ink}
        paper={paper}
        paused={!isAnimating}
        src={src}
      />
    )}
  </CanvasStage>
);
