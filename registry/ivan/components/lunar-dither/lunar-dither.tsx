"use client";

import { cn } from "@/lib/utils";
import { CanvasStage } from "@/registry/ivan/components/canvas-stage/canvas-stage";

import { lunarDitherDefaults } from "./lunar-dither-material";
import { LunarDitherScene } from "./lunar-dither-scene";
import type { LunarDitherSceneProps } from "./lunar-dither-scene";

export interface LunarDitherProps extends LunarDitherSceneProps {
  className?: string;
  label?: string;
}

const defaultLabel = "A cratered moon printed as an ordered dither";

const fallbackDisc = (ink: string, paper: string) =>
  `radial-gradient(circle closest-side, transparent 76%, ${ink} 77%), radial-gradient(circle at 34% 32%, ${paper} 0%, ${ink} 72%)`;

export const LunarDither = ({
  className,
  label = defaultLabel,
  ink = lunarDitherDefaults.ink,
  paper = lunarDitherDefaults.paper,
  paused = lunarDitherDefaults.paused,
  impacts = lunarDitherDefaults.impacts,
  ...sceneProps
}: LunarDitherProps) => (
  <CanvasStage
    className={cn("aspect-square", impacts && "cursor-crosshair", className)}
    fallback={
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundImage: fallbackDisc(ink, paper) }}
      />
    }
    ground={ink}
    label={label}
    paused={paused}
  >
    {(isAnimating) => (
      <LunarDitherScene
        {...sceneProps}
        impacts={impacts}
        ink={ink}
        paper={paper}
        paused={!isAnimating}
      />
    )}
  </CanvasStage>
);
