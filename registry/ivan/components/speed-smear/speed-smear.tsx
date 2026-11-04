"use client";

import { cn } from "@/lib/utils";
import {
  CanvasStage,
  ImageFallback,
} from "@/registry/ivan/components/canvas-stage/canvas-stage";
import { centeredFocus } from "@/registry/ivan/lib/image-cover";

import { speedSmearDefaults } from "./speed-smear-material";
import { SpeedSmearScene } from "./speed-smear-scene";
import type { SpeedSmearSceneProps } from "./speed-smear-scene";

export interface SpeedSmearProps extends SpeedSmearSceneProps {
  className?: string;
  label?: string;
}

const defaultLabel =
  "A picture smeared sideways around the pointer, like a head turning fast";

export const SpeedSmear = ({
  className,
  label = defaultLabel,
  src,
  focus = centeredFocus,
  ink = speedSmearDefaults.ink,
  paper = speedSmearDefaults.paper,
  paused = speedSmearDefaults.paused,
  ...sceneProps
}: SpeedSmearProps) => (
  <CanvasStage
    className={cn("touch-pan-y", className)}
    fallback={<ImageFallback focus={focus} src={src} />}
    ground={ink}
    label={label}
    paused={paused}
  >
    {(isAnimating) => (
      <SpeedSmearScene
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
