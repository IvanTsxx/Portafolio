"use client";

import { cn } from "@/lib/utils";
import { CanvasStage } from "@/registry/ivan/components/canvas-stage/canvas-stage";

import { orbitDustDefaults } from "./orbit-dust-material";
import { OrbitDustScene } from "./orbit-dust-scene";
import type { OrbitDustSceneProps } from "./orbit-dust-scene";

export interface OrbitDustProps extends OrbitDustSceneProps {
  className?: string;
  label?: string;
}

const defaultLabel = "A ring of dust orbiting a dark core";

const fallbackRing = (ink: string, paper: string) =>
  `radial-gradient(ellipse 18% 18% at 50% 50%, ${ink} 98%, transparent 100%), radial-gradient(ellipse 46% 15% at 50% 50%, transparent 52%, color-mix(in srgb, ${paper} 55%, transparent) 60%, color-mix(in srgb, ${paper} 25%, transparent) 82%, transparent 100%)`;

export const OrbitDust = ({
  className,
  label = defaultLabel,
  ink = orbitDustDefaults.ink,
  paper = orbitDustDefaults.paper,
  paused = orbitDustDefaults.paused,
  ...sceneProps
}: OrbitDustProps) => (
  <CanvasStage
    className={cn("aspect-video", className)}
    fallback={
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundImage: fallbackRing(ink, paper) }}
      />
    }
    ground={ink}
    label={label}
    paused={paused}
  >
    {(isAnimating) => (
      <OrbitDustScene
        {...sceneProps}
        ink={ink}
        paper={paper}
        paused={!isAnimating}
      />
    )}
  </CanvasStage>
);
