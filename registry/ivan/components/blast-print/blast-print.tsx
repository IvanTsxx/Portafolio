"use client";

import { cn } from "@/lib/utils";
import {
  CanvasStage,
  ImageFallback,
} from "@/registry/ivan/components/canvas-stage/canvas-stage";
import { centeredFocus } from "@/registry/ivan/lib/image-cover";

import { blastPrintDefaults } from "./blast-print-material";
import { BlastPrintScene } from "./blast-print-scene";
import type { BlastPrintSceneProps } from "./blast-print-scene";

export interface BlastPrintProps extends BlastPrintSceneProps {
  className?: string;
  label?: string;
}

const defaultLabel =
  "A picture printed as an ordered dither, bleached and reprinted in color by a click";

export const BlastPrint = ({
  className,
  label = defaultLabel,
  src,
  focus = centeredFocus,
  ink = blastPrintDefaults.ink,
  paper = blastPrintDefaults.paper,
  paused = blastPrintDefaults.paused,
  ...sceneProps
}: BlastPrintProps) => (
  <CanvasStage
    className={cn("touch-pan-y", className)}
    fallback={<ImageFallback focus={focus} src={src} />}
    ground={ink}
    label={label}
    paused={paused}
  >
    {(isAnimating) => (
      <BlastPrintScene
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
