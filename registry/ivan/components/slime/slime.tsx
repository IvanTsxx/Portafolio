"use client";

import { cn } from "@/lib/utils";
import { GpuStage } from "@/registry/ivan/components/gpu-stage/gpu-stage";

import { slimeDefaults } from "./slime-material";
import { SlimeScene } from "./slime-scene";
import type { SlimeSceneProps } from "./slime-scene";

export interface SlimeProps extends SlimeSceneProps {
  className?: string;
  label?: string;
}

const defaultLabel =
  "A glossy green slime that crawls around, drips, reaches for the pointer and splats when clicked";

const fallbackBlob = (ground: string, glow: string) =>
  `radial-gradient(circle at 46% 44%, color-mix(in srgb, ${glow} 55%, ${ground}) 0, ${ground} 24%, transparent 25%)`;

export const Slime = ({
  className,
  label = defaultLabel,
  ink = slimeDefaults.ink,
  paper = slimeDefaults.paper,
  glow = slimeDefaults.glow,
  night = slimeDefaults.night,
  paused = slimeDefaults.paused,
  ...sceneProps
}: SlimeProps) => {
  const ground = night ? ink : paper;
  return (
    <GpuStage
      className={cn(
        "cursor-grab touch-pan-y active:cursor-grabbing",
        className
      )}
      fallback={
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ backgroundImage: fallbackBlob(ground, glow) }}
        />
      }
      ground={ground}
      label={label}
      paused={paused}
    >
      {(isAnimating) => (
        <SlimeScene
          {...sceneProps}
          glow={glow}
          ink={ink}
          night={night}
          paper={paper}
          paused={!isAnimating}
        />
      )}
    </GpuStage>
  );
};
