"use client";

import { useId, useRef } from "react";
import type { ReactNode } from "react";

import { useThemeTones } from "@/components/lab/experiments/lunar-dither/use-theme-tones";
import { useViewSlot } from "@/components/scene/view-registry";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/registry/ivan/hooks/use-prefers-reduced-motion";
import { useWebGLSupport } from "@/registry/ivan/hooks/use-webgl-support";

interface PrintLookInput {
  ink: string | undefined;
  paper: string | undefined;
  paused: boolean;
}

export const usePrintLook = ({ ink, paper, paused }: PrintLookInput) => {
  const tones = useThemeTones();
  const isReduced = usePrefersReducedMotion();
  return {
    ink: ink ?? tones.ink,
    paper: paper ?? tones.paper,
    paused: paused || isReduced,
  };
};

interface PrintFigureProps {
  background: string;
  label: string;
  className?: string;
  children: ReactNode;
}

export const PrintFigure = ({
  background,
  label,
  className,
  children,
}: PrintFigureProps) => {
  const track = useRef<HTMLElement>(null);
  const id = useId();
  const hasWebGL = useWebGLSupport();

  useViewSlot(id, track, children, hasWebGL);

  return (
    <figure
      aria-label={label}
      className={cn(
        "relative m-0 aspect-4/3 w-full cursor-crosshair touch-pan-y",
        className
      )}
      ref={track}
      style={{ backgroundColor: background }}
    />
  );
};
