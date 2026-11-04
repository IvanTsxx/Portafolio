"use client";

import { useId, useRef } from "react";

import { useForegroundLitTones } from "@/components/lab/experiments/lunar-dither/use-theme-tones";
import { useViewSlot } from "@/components/scene/view-registry";
import { cn } from "@/lib/utils";
import type { DustPortraitProps } from "@/registry/ivan/components/dust-portrait/dust-portrait";
import { DustPortraitScene } from "@/registry/ivan/components/dust-portrait/dust-portrait-scene";
import { usePrefersReducedMotion } from "@/registry/ivan/hooks/use-prefers-reduced-motion";
import { useWebGLSupport } from "@/registry/ivan/hooks/use-webgl-support";

const defaultAlt = "A picture printed in dust that scatters under the pointer";

export const DustPortrait = ({
  alt = defaultAlt,
  className,
  ink,
  paper,
  paused = false,
  ...sceneProps
}: DustPortraitProps) => {
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
    <DustPortraitScene
      {...sceneProps}
      ink={resolvedInk}
      paper={resolvedPaper}
      paused={paused || isReduced}
      pointerTarget={track}
    />,
    hasWebGL
  );

  return (
    <figure
      aria-label={alt}
      className={cn(
        "relative m-0 aspect-square w-full cursor-crosshair touch-pan-y",
        className
      )}
      ref={track}
      style={{ backgroundColor: resolvedInk }}
    />
  );
};
