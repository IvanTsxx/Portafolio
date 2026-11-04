"use client";

import { cn } from "@/lib/utils";
import {
  CanvasStage,
  ImageFallback,
} from "@/registry/ivan/components/canvas-stage/canvas-stage";

import { dustPortraitDefaults } from "./dust-portrait-material";
import { DustPortraitScene } from "./dust-portrait-scene";
import type { DustPortraitSceneProps } from "./dust-portrait-scene";

export interface DustPortraitProps extends Omit<
  DustPortraitSceneProps,
  "pointerTarget"
> {
  alt?: string;
  className?: string;
}

const defaultAlt = "A picture printed in dust that scatters under the pointer";
const centeredFocus = { x: 0.5, y: 0.5 };

export const DustPortrait = ({
  alt = defaultAlt,
  className,
  src,
  focus = centeredFocus,
  ink = dustPortraitDefaults.ink,
  paused = dustPortraitDefaults.paused,
  ...sceneProps
}: DustPortraitProps) => (
  <CanvasStage
    className={cn("touch-pan-y", className)}
    fallback={<ImageFallback focus={focus} src={src} />}
    ground={ink}
    label={alt}
    paused={paused}
  >
    {(isAnimating) => (
      <DustPortraitScene
        {...sceneProps}
        focus={focus}
        ink={ink}
        paused={!isAnimating}
        src={src}
      />
    )}
  </CanvasStage>
);
