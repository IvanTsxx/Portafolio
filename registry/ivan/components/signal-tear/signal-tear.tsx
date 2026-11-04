"use client";

import { cn } from "@/lib/utils";
import {
  CanvasStage,
  ImageFallback,
} from "@/registry/ivan/components/canvas-stage/canvas-stage";
import { centeredFocus } from "@/registry/ivan/lib/image-cover";

import { signalTearDefaults } from "./signal-tear-material";
import { SignalTearScene } from "./signal-tear-scene";
import type { SignalTearSceneProps } from "./signal-tear-scene";

export interface SignalTearProps extends SignalTearSceneProps {
  className?: string;
  label?: string;
}

const defaultLabel =
  "A grainy picture whose rows tear sideways and leave light trails near the pointer";

export const SignalTear = ({
  className,
  label = defaultLabel,
  src,
  focus = centeredFocus,
  ink = signalTearDefaults.ink,
  paper = signalTearDefaults.paper,
  paused = signalTearDefaults.paused,
  ...sceneProps
}: SignalTearProps) => (
  <CanvasStage
    className={cn("touch-pan-y", className)}
    fallback={<ImageFallback focus={focus} src={src} />}
    ground={ink}
    label={label}
    paused={paused}
  >
    {(isAnimating) => (
      <SignalTearScene
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
