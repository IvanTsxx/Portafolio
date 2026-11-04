"use client";

import { useId, useRef } from "react";

import { useThemeTones } from "@/components/lab/experiments/lunar-dither/use-theme-tones";
import { useViewSlot } from "@/components/scene/view-registry";
import { cn } from "@/lib/utils";
import type { LunarDitherProps } from "@/registry/ivan/components/lunar-dither/lunar-dither";
import { LunarDitherScene } from "@/registry/ivan/components/lunar-dither/lunar-dither-scene";
import { usePrefersReducedMotion } from "@/registry/ivan/hooks/use-prefers-reduced-motion";
import { useWebGLSupport } from "@/registry/ivan/hooks/use-webgl-support";

const defaultLabel = "A cratered moon printed as an ordered dither";

export const LunarDither = ({
  className,
  label = defaultLabel,
  ink,
  paper,
  paused = false,
  ...sceneProps
}: LunarDitherProps) => {
  const track = useRef<HTMLElement>(null);
  const id = useId();
  const hasWebGL = useWebGLSupport();
  const isReduced = usePrefersReducedMotion();
  const tones = useThemeTones();
  const resolvedInk = ink ?? tones.ink;
  const resolvedPaper = paper ?? tones.paper;

  useViewSlot(
    id,
    track,
    <LunarDitherScene
      {...sceneProps}
      ink={resolvedInk}
      paper={resolvedPaper}
      paused={paused || isReduced}
    />,
    hasWebGL
  );

  return (
    <figure
      aria-label={label}
      className={cn("relative m-0 aspect-square w-full", className)}
      ref={track}
      style={{ backgroundColor: resolvedInk }}
    />
  );
};
