"use client";

import { useId, useRef } from "react";

import { useForegroundLitTones } from "@/components/lab/experiments/lunar-dither/use-theme-tones";
import { useViewSlot } from "@/components/scene/view-registry";
import { cn } from "@/lib/utils";
import type { OrbitDustProps } from "@/registry/ivan/components/orbit-dust/orbit-dust";
import { OrbitDustScene } from "@/registry/ivan/components/orbit-dust/orbit-dust-scene";
import { usePrefersReducedMotion } from "@/registry/ivan/hooks/use-prefers-reduced-motion";
import { useWebGLSupport } from "@/registry/ivan/hooks/use-webgl-support";

const defaultLabel = "A ring of dust orbiting a dark core";

export const OrbitDust = ({
  className,
  label = defaultLabel,
  ink,
  paper,
  paused = false,
  ...sceneProps
}: OrbitDustProps) => {
  const track = useRef<HTMLElement>(null);
  const id = useId();
  const hasWebGL = useWebGLSupport();
  const isReduced = usePrefersReducedMotion();
  const tones = useForegroundLitTones();
  const resolvedInk = ink ?? tones.ink;
  const resolvedPaper = paper ?? tones.paper;

  useViewSlot(
    id,
    track,
    <OrbitDustScene
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
